export type InferAsyncGenerator<T extends (...args: any) => AsyncGenerator<any>> = T extends (...args: any) => AsyncGenerator<infer U> ? U : never;
