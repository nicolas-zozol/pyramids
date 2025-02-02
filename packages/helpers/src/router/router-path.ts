//'use server'; // don't use it, or we will pay for server action

let routerPath: string = '/';

export function setRouterPath<T extends string>(path: T) {
  routerPath = path;
}

export function getRouterPath<T extends string>(): T {
  return routerPath as T;
}
