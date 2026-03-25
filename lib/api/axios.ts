import axios, { AxiosError } from "axios";

export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL ?? "/api/v1",
    timeout: 10000,
});

// Request interceptor — attach auth token if needed (for mobile/external clients)
// For Next.js web app, Better Auth uses cookies automatically — no token needed
api.interceptors.request.use((config) => {
    return config;
});

// Response interceptor — unwrap data, handle global errors
api.interceptors.response.use(
    (response) => response.data,  // ✅ unwraps { success, data } automatically
    (error: AxiosError<{ error: string }>) => {
        const message = error.response?.data?.error ?? "Something went wrong";
        const status = error.response?.status;

        // Global handling
        if (status === 401) {
            // redirect to login
            window.location.href = "/login";
        }

        if (status === 403) {
            window.location.href = "/unauthorized";
        }

        return Promise.reject(new Error(message));
    }
);