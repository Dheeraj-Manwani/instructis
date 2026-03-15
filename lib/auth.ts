import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";
import {
  getChangeEmailVerificationHtml,
  getPasswordResetEmailHtml,
  getVerificationEmailHtml,
  sendEmail,
} from "./email";
import prisma from "./prisma";
import { passwordSchema } from "./validations/auth.schema";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  databaseHooks: {
    user: {
      create: {
        before: async (user) => ({
          data: {
            ...user,
            role: user.role ?? "student",
          },
        }),
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
      role: {
        type: "string",
        input: false,
        defaultValue: "student",
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
