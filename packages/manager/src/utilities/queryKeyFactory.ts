// type QueryFunction<T> = T extends (...args: any[]) => any
//   ? { queryFn: T }
//   : T extends { queryFn: (...args: any[]) => any; queryKey: any[] }
//   ? { queryFn: T['queryFn']; queryKey: T['queryKey'] }
//   : { queryFn: () => any; queryKey: string[] };

// type QueryKeys<T, P extends string[] = []> = {
//   queryKey: [...P];
// } & (T extends QueryFunction<T>
//   ? T
//   : { [K in keyof T]: QueryKeys<T[K], [...P, K]> });

// export function getQueryKeys<T>(input: T): QueryKeys<T> {
//   const result: any = {
//     queryKey: [],
//   };

//   for (const key in input) {
//     const currentValue = input[key];

//     if (typeof currentValue === 'object' && currentValue !== null && !Array.isArray(currentValue)) {
//       result[key] = getQueryKeys(currentValue);
//     } else if (typeof currentValue === 'function') {
//       result[key] = { queryFn: currentValue, queryKey: [key] };
//     } else {
//       const { queryKey, queryFn } = currentValue;
//       result[key] = { queryKey: [key, ...queryKey], queryFn };
//     }
//   }

//   return result;
// }

// type QueryFunction<T> = T extends {
//   queryFn: (...args: any[]) => any;
//   queryKey: any[];
// }
//   ? { queryFn: T['queryFn']; queryKey: T['queryKey'] }
//   : (...args: any[]) => { queryFn: () => T; queryKey: T['queryKey'] };

// type QueryFunction<T> = T extends (...args: any[]) => {
//   queryFn: (...args: any[]) => any;
//   queryKey: any[];
// }
//   ? (
//       ...args: Parameters<T>
//     ) => {
//       queryFn: ReturnType<T>['queryFn'];
//       queryKey: ReturnType<T>['queryKey'];
//     }
//   : { queryFn: T['queryFn']; queryKey: T['queryKey'] };

// type QueryFunction<T> = T extends (...args: any[]) => {
//   queryFn: (...args: any[]) => any;
//   queryKey: any[];
// }
//   ? (
//       ...args: Parameters<T>
//     ) => {
//       queryFn: ReturnType<T>['queryFn'];
//       queryKey: ReturnType<T>['queryKey'];
//     }
//   : { queryFn: T['queryFn']; queryKey: T['queryKey'] };

// type QueryFunction<T> = T extends (...args: any[]) => {
//   queryFn: (...args: any[]) => any;
//   queryKey: any[];
// }
//   ? (
//       ...args: Parameters<T>
//     ) => {
//       queryFn: T['queryFn'];
//       queryKey: T['queryKey'];
//     }
//   : { queryFn: T['queryFn']; queryKey: T['queryKey'] };

type QueryKeys<T, P extends string[] = []> = {
  queryKey: [...P];
} & (T extends (
  ...args: any[]
) => {
  queryFn: (...args: any[]) => any;
  queryKey: any[];
}
  ? (
      ...args: Parameters<T>
    ) => {
      queryFn: ReturnType<T>['queryFn'];
      queryKey: [...P, ...Parameters<T>];
    }
  : T extends {
      queryFn: (...args: any[]) => any;
      queryKey: any[];
    } | {
      queryFn: (...args: any[]) => any;
    }
  ? T
  : { [K in keyof T]: QueryKeys<T[K], [...P, K]> });

export function getQueryKeys<T>(input: T): QueryKeys<T> {
  const result: any = {
    queryKey: [],
  };

  for (const key in input) {
    const currentValue = input[key];

    if (
      typeof currentValue === 'object' &&
      currentValue !== null &&
      !Array.isArray(currentValue)
    ) {
      result[key] = getQueryKeys(currentValue);
    } else if (typeof currentValue === 'function') {
      result[key] = { queryFn: currentValue, queryKey: [key] };
    } else {
      const { queryKey, queryFn } = currentValue;
      result[key] = { queryKey: [key, ...queryKey], queryFn };
    }
  }

  return result;
}
