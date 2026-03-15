import { api } from "./axios";
import { RoleEnum } from "@prisma/client";

export type UserListItem = {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image: string | null;
    role: RoleEnum;
    createdAt: string;
    updatedAt: string;
};

export type ListUsersParams = {
    page?: number;
    limit?: number;
};

export type ListUsersResponse = {
    data: UserListItem[];
    meta: { total: number; page: number; limit: number; totalPages: number };
};

export async function fetchUsers(
    params: ListUsersParams = {}
): Promise<ListUsersResponse> {
    const res = (await api.get("/users", { params })) as {
        data?: UserListItem[];
        meta?: ListUsersResponse["meta"];
    };
    return {
        data: res.data ?? [],
        meta: res.meta ?? { total: 0, page: 1, limit: 10, totalPages: 0 },
    };
}

export async function updateUserRole(
    userId: string,
    role: RoleEnum
): Promise<UserListItem> {
    const res = (await api.patch(`/users/${userId}`, { role })) as {
        data: UserListItem;
    };
    return res.data;
}
