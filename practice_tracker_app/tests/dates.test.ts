import { describe, it, expect } from "vitest";
import { addDays, daysBetween, todayIn, formatLong } from "@/lib/dates";

describe("addDays", () => {
  it("rolls over a month end", () => {
    expect(addDays("2026-01-31", 1)).toBe("2026-02-01");
  });

  it("rolls over a year end", () => {
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
  });

  it("crosses the UK clock change without shifting the day", () => {
    expect(addDays("2026-10-24", 1)).toBe("2026-10-25");
  });
});

describe("daysBetween", () => {
  it("counts whole days across the UK clock change", () => {
    expect(daysBetween("2026-10-24", "2026-10-26")).toBe(2);
  });

  it("is negative when the second date is earlier", () => {
    expect(daysBetween("2026-10-26", "2026-10-24")).toBe(-2);
  });

  it("is zero for the same day", () => {
    expect(daysBetween("2026-10-26", "2026-10-26")).toBe(0);
  });
});

describe("formatLong", () => {
  it("formats a date as weekday, day, month and year", () => {
    expect(formatLong("2026-10-26")).toBe("Monday 26 October 2026");
  });
});

describe("todayIn", () => {
  it("returns a YYYY-MM-DD string", () => {
    expect(todayIn("UTC")).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
