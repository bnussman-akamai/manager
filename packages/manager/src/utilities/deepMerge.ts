type ObjectType = Record<string, unknown>;

const isObject = (item: unknown): item is ObjectType => {
  return item !== null && typeof item === 'object' && !Array.isArray(item);
};

/**
 * Deep merge two objects. Arrays won't be merged.
 * Warning: we want to make light usage of this util and consider using a better tool for complex deep merging.
 *
 * @param target Object to merge into
 * @param source Object to merge from
 * @returns Merged object
 */

export const deepMerge = <T extends {}, S extends {}>(
  target: T,
  source: S
): T & S => {
  if (Array.isArray(source)) {
    return (source as unknown) as T & S;
  }

  const output = { ...target } as T & S;
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach((key) => {
      if (isObject(source[key as keyof S])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key as keyof S] });
        } else {
          (output[key as keyof S & T] as unknown) = deepMerge(
            target[key as keyof T] as ObjectType,
            source[key as keyof S] as ObjectType
          );
        }
      } else {
        Object.assign(output, { [key]: source[key as keyof S] });
      }
    });
  }
  return output;
};
