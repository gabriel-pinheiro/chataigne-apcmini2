export type JsonPrimitive = boolean | number | string | null;
export type JsonValue = JsonPrimitive | JsonValue[] | Definition;
export type Definition = { [key: string]: JsonValue };

export function entries(
  count: number,
  createEntry: (index: number) => [string, JsonValue]
): Definition {
  return Object.fromEntries(
    Array.from({ length: count }, (_, offset) => createEntry(offset + 1))
  );
}

export function container(children: Definition, collapsed = true): Definition {
  return {
    type: "Container",
    collapsed,
    ...children
  };
}
