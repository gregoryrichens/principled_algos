import { existsSync, readFileSync } from "node:fs";

export const PRINCIPLE_NAMES: Record<number, string> = {
  1: "Hash it", 2: "Running aggregates", 3: "Dynamic programming", 4: "Binary search",
  5: "Two pointers", 6: "Stack", 7: "Greedy", 8: "Sliding window", 9: "Sort first",
  10: "Heap", 11: "Tree recursion", 12: "Backtracking", 13: "Graph search",
  14: "Dependencies and groups", 15: "Weighted paths", 16: "Linked-list surgery",
  17: "Bits, digits, and no extra memory", 18: "Reformulate",
};

export interface MapEntry {
  primary: number;
  secondary: number[];
  note: string;
}

export function loadPrincipleMap(path: string): Map<number, MapEntry> {
  const raw = JSON.parse(readFileSync(path, "utf8")) as Record<string, MapEntry>;
  return new Map(
    Object.entries(raw).map(([key, entry]): [number, MapEntry] => [Number(key), entry]),
  );
}

let cached: Map<number, MapEntry> | undefined;

export function principleMap(): Map<number, MapEntry> {
  if (cached) return cached;
  const path = process.env.PRINCIPLE_MAP_PATH;
  if (!path) {
    throw new Error("PRINCIPLE_MAP_PATH is not set, so the principle map cannot be loaded.");
  }
  if (!existsSync(path)) {
    throw new Error(`Principle map not found at PRINCIPLE_MAP_PATH=${path}`);
  }
  cached = loadPrincipleMap(path);
  return cached;
}
