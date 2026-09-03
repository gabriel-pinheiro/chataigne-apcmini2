import type { JsonValue } from "./schema.js";

export function validateEnumDefaults(value: JsonValue, path: string[] = []): void {
  if (Array.isArray(value) || value === null || typeof value !== "object") {
    return;
  }

  if (value.type === "Enum") {
    const defaultOption = value.default;
    const options = value.options;
    const location = path.join(" > ");

    if (typeof defaultOption !== "string") {
      throw new TypeError(`Enum at ${location} needs a string default.`);
    }
    if (options === null || typeof options !== "object" || Array.isArray(options)) {
      throw new TypeError(`Enum at ${location} needs options.`);
    }
    if (!Object.hasOwn(options, defaultOption)) {
      throw new TypeError(`Enum default at ${location} must be an option label.`);
    }
  }

  for (const [key, child] of Object.entries(value)) {
    validateEnumDefaults(child, [...path, key]);
  }
}

export function validateLeafShortNames(value: JsonValue, path: string[] = []): void {
  if (Array.isArray(value) || value === null || typeof value !== "object") {
    return;
  }

  if (typeof value.type === "string" && value.type !== "Container") {
    if (typeof value.shortName !== "string" || value.shortName.length === 0) {
      throw new TypeError(`Controllable at ${path.join(" > ")} needs a shortName.`);
    }
    return;
  }

  for (const [key, child] of Object.entries(value)) {
    validateLeafShortNames(child, [...path, key]);
  }
}
