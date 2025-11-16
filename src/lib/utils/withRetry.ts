export function withRetry<T>(
  fn: () => Promise<T>,
  retryCount: number,
  { onRetry }: { onRetry?: (attempt: number, error: unknown) => void } = {},
): () => Promise<T> {
  return async function wrapped() {
    for (let attempt = 0; attempt <= retryCount; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === retryCount) {
          throw error;
        }
        onRetry?.(attempt, error);
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * (2 ** attempt)));
    }
    throw new Error("Unreachable code");
  }
}
