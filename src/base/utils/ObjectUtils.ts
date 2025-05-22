export class ObjectUtils {

  static truncateString(str: string, maxLength = 10, replace = '..'): string {
    return str.length > maxLength ? str.substring(0, maxLength - replace.length) + replace : str;
  }

  static getQualifiedClassName(obj: unknown): string {
    if (obj === null || obj === undefined) {
      return String(obj); // Возвращает "null" или "undefined"
    }
    return obj.constructor.name; // Возвращает имя конструктора объекта
  }

  static getBase64Size(base64String: string): number {
    // Убираем символы выравнивания '='
    const padding = base64String.endsWith("==") ? 2 : base64String.endsWith("=") ? 1 : 0;
    // Длина строки без учета выравнивания
    const base64Length = base64String.length;
    // Рассчитываем исходный размер данных
    return (base64Length * 3) / 4 - padding;
  }

  static getKeyObjValue<T = any>(json: Record<string, any> | null, key: string, fallback: T | null = null): T | null {
    if (json && json[key]) {
      return json[key] as T;
    }
    return fallback;
  }

  static getKeyBoolValue(json: Record<string, any> | null, key: string, fallback: boolean = false): boolean {
    if (json && json.hasOwnProperty(key)) {
      return Boolean(json[key]);
    }
    return fallback;
  }

  static getKeyStringValue(json: Record<string, any> | null, key: string, fallback: string = ""): string {
    if (json && typeof json[key] === "string" && json[key].length > 0) {
      return json[key];
    }
    return fallback;
  }

  static getKeyNumberValue(json: Record<string, any> | null, key: string, fallback: number = 0): number {
    if (json && !isNaN(json[key])) {
      return Number(json[key]);
    }
    return fallback;
  }

  static getKeyIntValue(json: Record<string, any> | null, key: string, fallback: number = 0): number {
    if (json && !isNaN(json[key])) {
      return Math.floor(Number(json[key]));
    }
    return fallback;
  }

  static getKeyArrayValue<T = any>(json: Record<string, any> | null, key: string, fallback: T[] = []): T[] {
    if (json && Array.isArray(json[key])) {
      return json[key] as T[];
    }
    return fallback;
  }

  static getKeyDateValue(json: Record<string, any> | null, key: string, fallback: Date | null = null): Date | null {
    if (json && json[key] instanceof Date) {
      return json[key] as Date;
    }
    if (json && typeof json[key] === "string") {
      const parsedDate = new Date(json[key]);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }
    return fallback;
  }

  static getKeyByteArrayValue(json: Record<string, any> | null, key: string, fallback: Uint8Array | null = null): Uint8Array | null {
    if (json && json[key] instanceof Uint8Array) {
      return json[key] as Uint8Array;
    }
    return fallback;
  }
}
