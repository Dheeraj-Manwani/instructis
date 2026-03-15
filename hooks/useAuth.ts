"use client";

import { authClient } from "@/lib/auth-client";
import { RoleEnum } from "@prisma/client";

export function useAuth() {
    const { data: session, isPending, error, refetch } = authClient.useSession();
    const user = session?.user;

    return {
        session,
        user,
        isPending,
        error,
        refetch,
        isSignedIn: !!user,
        isAdmin: user?.role === RoleEnum.ADMIN,
    };
}