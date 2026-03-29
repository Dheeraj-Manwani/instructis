import { api } from "./axios";

export type FacultyListItem = {
  id: string;
  facultyCode: string | null;
  userId: string;
  name: string;
  email: string;
  image: string | null;
  department: string | null;
  title: string | null;
  batchesCount: number;
  questionsCount: number;
  joinedAt: string;
};

type Meta = {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export async function fetchFaculties(params: {
  page?: number;
  limit?: number;
  search?: string;
  department?: string;
}) {
  const res = (await api.get("/api/admin/faculties", { params })) as {
    data?: {
      data?: FacultyListItem[];
      departments?: string[];
    };
    meta?: Meta;
  };

  return {
    data: res.data?.data ?? [],
    departments: res.data?.departments ?? [],
    meta: res.meta ?? { total: 0, page: 1, limit: 10, totalPages: 0 },
  };
}

export async function createFaculty(payload: {
  name: string;
  email: string;
  password: string;
  title?: string;
  department?: string;
}) {
  const res = (await api.post("/api/admin/faculties", payload)) as {
    data: FacultyListItem;
  };
  return res.data;
}

export async function updateFaculty(
  facultyId: string,
  payload: {
    name?: string;
    email?: string;
    facultyCode?: string;
    title?: string | null;
    department?: string | null;
    newPassword?: string;
    confirmPassword?: string;
  }
) {
  const res = (await api.patch(`/api/admin/faculties/${facultyId}`, payload)) as {
    data: FacultyListItem;
  };
  return res.data;
}

export async function removeFacultyRole(facultyId: string) {
  const res = (await api.delete(`/api/admin/faculties/${facultyId}`)) as {
    data: { facultyId: string; userId: string };
  };
  return res.data;
}
