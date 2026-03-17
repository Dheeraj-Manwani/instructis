import { api } from "./axios";
import { RoleEnum } from "@prisma/client";

export type ProfileUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
  role: RoleEnum;
  createdAt: string;
  updatedAt: string;
};

export type ProfileStudent = {
  id: string;
  userId: string;
  rollNo: string;
  targetExam: "JEE" | "NEET";
  batchId: string | null;
  batchName: string | null;
  parentName: string | null;
  parentPhone: string | null;
  parentEmail: string | null;
  address: string | null;
  dob: string | null;
};

export type ProfileFaculty = {
  id: string;
  userId: string;
  title: string | null;
  department: string | null;
};

export type Profile = {
  user: ProfileUser;
  student: ProfileStudent | null;
  faculty: ProfileFaculty | null;
};

export async function getProfile(): Promise<Profile> {
  const res = (await api.get("/profile")) as { data: Profile };
  return res.data;
}

export type UpdateProfilePayload = {
  name?: string;
  image?: string | null;
  student?: {
    rollNo?: string;
    targetExam?: "JEE" | "NEET";
    batchId?: string | null;
    parentName?: string | null;
    parentPhone?: string | null;
    parentEmail?: string | null;
    address?: string | null;
    dob?: string | null;
  };
  faculty?: {
    title?: string | null;
    department?: string | null;
  };
};

export async function updateProfile(payload: UpdateProfilePayload): Promise<Profile> {
  const res = (await api.patch("/profile", payload)) as { data: Profile };
  return res.data;
}
