export default async function retryWithBackoff<T>(fn: () => Promise<T>, attempts = 3, baseDelay = 350): Promise<T> {
    let lastErr: unknown;
    for (let i = 0; i < attempts; i++) {
        try {
            return await fn();
        } catch (e) {
            lastErr = e;
            if (i < attempts - 1) {
                const delay = baseDelay * Math.pow(2, i); // 350, 700, 1400...
                await new Promise((r) => setTimeout(r, delay));
            }
        }
    }
    throw lastErr;
}