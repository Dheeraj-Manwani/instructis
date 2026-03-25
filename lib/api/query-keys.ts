export const queryKeys = {
    callbackRequests: {
        all: ["callback-requests"] as const,
        list: (params?: Record<string, unknown>) =>
            [...queryKeys.callbackRequests.all, "list", params ?? {}] as const,
    },

    students: {
        all: ["students"] as const,
        lists: () => [...queryKeys.students.all, "list"] as const,
        list: (filters: Record<string, unknown>) =>
            [...queryKeys.students.lists(), filters] as const,
        details: () => [...queryKeys.students.all, "detail"] as const,
        detail: (id: string) => [...queryKeys.students.details(), id] as const,
        marks: (id: string) => [...queryKeys.students.detail(id), "marks"] as const,
    },

    questions: {
        all: ["questions"] as const,
        lists: () => [...queryKeys.questions.all, "list"] as const,
        list: (params: Record<string, unknown>) =>
            [...queryKeys.questions.lists(), params] as const,
        details: () => [...queryKeys.questions.all, "detail"] as const,
        detail: (id: string) => [...queryKeys.questions.details(), id] as const,
    },

    faculty: {
        all: ["faculty"] as const,
        list: (filters?: Record<string, unknown>) =>
            [...queryKeys.faculty.all, "list", filters] as const,
        detail: (id: string) => [...queryKeys.faculty.all, "detail", id] as const,
    },

    marks: {
        all: ["marks"] as const,
        byStudent: (studentId: string) =>
            [...queryKeys.marks.all, "student", studentId] as const,
    },

    batches: {
        all: ["batches"] as const,
        lists: () => [...queryKeys.batches.all, "list"] as const,
        list: (params: Record<string, unknown>) =>
            [...queryKeys.batches.lists(), params] as const,
        details: () => [...queryKeys.batches.all, "detail"] as const,
        detail: (id: string) => [...queryKeys.batches.details(), id] as const,
    },

    topics: {
        all: ["topics"] as const,
        list: (subject: string) => [...queryKeys.topics.all, "list", subject] as const,
    },
};