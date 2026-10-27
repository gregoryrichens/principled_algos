import { describe, it, expect } from "vitest";
import { loadPrincipleMap, PRINCIPLE_NAMES } from "@/lib/principles";

const mapPath = process.env.PRINCIPLE_MAP_PATH;
if (!mapPath) {
  throw new Error("PRINCIPLE_MAP_PATH must be set to run the principle tests.");
}

describe("loadPrincipleMap", () => {
  const map = loadPrincipleMap(mapPath);

  it("loads all 150 entries", () => {
    expect(map.size).toBe(150);
  });

  it("maps problem 435 to primary 7 and secondary [9]", () => {
    const entry = map.get(435);
    expect(entry?.primary).toBe(7);
    expect(entry?.secondary).toEqual([9]);
  });
});

describe("PRINCIPLE_NAMES", () => {
  it("has 18 entries", () => {
    expect(Object.keys(PRINCIPLE_NAMES)).toHaveLength(18);
  });
});
