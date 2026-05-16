type ServerFunction = (...args: never[]) => unknown;

export function useServerFn<T extends ServerFunction>(fn: T): T {
  return fn;
}
