export type RequestSource = "user" | "system"; // who triggered it

export type RequestMeta = {
    requestId: string;
    startedAt: number;
    finishedAt?: number;
    source: RequestSource;
};

export type RequestStatus = {
    loading: boolean;
    error: string | null;
    success: string | null;
    meta?: RequestMeta; // present when running or finished
};