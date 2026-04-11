type AnyObject = Record<string, unknown>;

function snakeToCamel(str: string): string {
  return str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

function camelToSnake(str: string): string {
  return str.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

export function toCamelCase(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    const result: AnyObject = {};
    for (const [key, value] of Object.entries(obj as AnyObject)) {
      result[snakeToCamel(key)] = toCamelCase(value);
    }
    return result;
  }
  return obj;
}

export function toSnakeCase(obj: unknown): unknown {
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  if (obj !== null && typeof obj === 'object' && !(obj instanceof Date)) {
    const result: AnyObject = {};
    for (const [key, value] of Object.entries(obj as AnyObject)) {
      result[camelToSnake(key)] = toSnakeCase(value);
    }
    return result;
  }
  return obj;
}
