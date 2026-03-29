import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { RoleEnum } from "@prisma/client";
import {
  getChangeEmailVerificationHtml,
  getPasswordResetEmailHtml,
  getVerificationEmailHtml,
  sendEmail,
} from "./email";
import prisma from "./prisma";
import { passwordSchema } from "./schemas/auth.schema";

function randomUpperChar() {
  return String.fromCharCode(65 + Math.floor(Math.random() * 26));
}

function buildFacultyCodeCandidate() {
  const letters = `${randomUpperChar()}${randomUpperChar()}`;
  const numbers = String(Math.floor(Math.random() * 1000)).padStart(3, "0");
  return `${letters}${numbers}`;
}

async function generateUniqueFacultyCode() {
  for (let i = 0; i < 100; i += 1) {
    const candidate = buildFacultyCodeCandidate();
    const existing = await prisma.faculty.findUnique({
      where: { facultyCode: candidate },
      select: { id: true },
    });
    if (!existing) return candidate;
  }
  throw new Error("Unable to generate unique faculty code");
}

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [
    "https://instructis.in",
    "https://www.instructis.in",
    "http://localhost:3000",
  ],
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({
          data: {
            ...user,
            role: user.role ?? RoleEnum.FACULTY,
          },
        }),
        after: async (createdUser) => {
          try {
            if (createdUser.role === RoleEnum.FACULTY) {
              // Ensure a matching faculty record exists for newly created faculty users
              await prisma.faculty.upsert({
                where: { userId: createdUser.id },
                update: {},
                create: {
                  facultyCode: await generateUniqueFacultyCode(),
                  userId: createdUser.id,
                },
              });

              const faculty = await prisma.faculty.findUnique({
                where: { userId: createdUser.id },
                select: { id: true, facultyCode: true },
              });
              if (faculty && !faculty.facultyCode) {
                await prisma.faculty.update({
                  where: { id: faculty.id },
                  data: { facultyCode: await generateUniqueFacultyCode() },
                });
              }
            }
          } catch (error) {
            // Swallow errors here to avoid blocking auth flow; they can be handled separately if needed
            console.error("Failed to ensure faculty record for user", createdUser.id, error);
          }
        },
      },
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  emailAndPassword: {
    enabled: true,
    // requireEmailVerification: true, // Only if you want to block login completely
    async sendResetPassword({ user, url }) {
      const html = getPasswordResetEmailHtml(user.name ?? null, url);
      await sendEmail({
        to: user.email,
        subject: "Reset your password – Instructis",
        html,
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    async sendVerificationEmail({ user, url }) {
      const html = getVerificationEmailHtml(user.name ?? null, url);
      await sendEmail({
        to: user.email,
        subject: "Verify your email – Instructis",
        html,
      });
    },
  },
  user: {
    changeEmail: {
      enabled: true,
      async sendChangeEmailVerification({ user, newEmail, url }: { user: User, newEmail: string, url: string }) {
        const html = getChangeEmailVerificationHtml(user.name ?? null, newEmail, url);
        await sendEmail({
          to: user.email,
          subject: "Approve email change – Instructis",
          html,
        });
      },
    },
    additionalFields: {
      // TODO: ask for target exam in auth flow for students and additional details in onboarding flow
      role: {
        type: "string",
        input: false,
        defaultValue: RoleEnum.FACULTY,
      },
    },
  },
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      if (
        ctx.path === "/auth/sign-up/email" ||
        ctx.path === "/reset-password" ||
        ctx.path === "/change-password"
      ) {
        const password = ctx.body.password || ctx.body.newPassword;
        const { error } = passwordSchema.safeParse(password);
        if (error) {
          throw new APIError("BAD_REQUEST", {
            message: "Password not strong enough",
          });
        }
      }
    }),
  },
});

export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
