import { describe, it, expect } from "vitest";
import {
  OUTCOMES,
  OFFSETS,
  STEP_LABELS,
  problemStates,
  dueReviews,
  type Attempt,
  type Outcome,
} from "@/lib/schedule";

const a = (id: number, attemptedOn: string, outcome: Outcome, problem = 1): Attempt => ({
  id,
  attemptedOn,
  problem,
  outcome,
});

// Fresh arrays on every call, in case an implementation sorts its input in place.
const case4 = (): Attempt[] => [
  a(1, "2026-10-01", "bug"),
  a(2, "2026-10-02", "clean"),
  a(3, "2026-10-04", "clean"),
  a(4, "2026-10-08", "clean"),
];

const stateOf = (attempts: Attempt[], problem = 1) => problemStates(attempts).get(problem);

describe("review schedule", () => {
  it("case 1: a failure on 10-01 is due on 10-02 as Day 1", () => {
    const attempts = [a(1, "2026-10-01", "bug")];
    expect(stateOf(attempts)).toMatchObject({
      status: "in_cycle",
      anchorDate: "2026-10-01",
      anchorAttemptId: 1,
      nextStep: 0,
      nextDue: "2026-10-02",
    });
    expect(dueReviews(attempts, "2026-10-01")).toEqual([]);
    expect(dueReviews(attempts, "2026-10-02")).toEqual([
      { problem: 1, stepLabel: "Day 1", dueOn: "2026-10-02", daysOverdue: 0, anchorAttemptId: 1 },
    ]);
    expect(dueReviews(attempts, "2026-10-05")).toEqual([
      { problem: 1, stepLabel: "Day 1", dueOn: "2026-10-02", daysOverdue: 3, anchorAttemptId: 1 },
    ]);
  });

  it("case 2: a first-try clean queues one Day 14 review", () => {
    const attempts = [a(1, "2026-10-01", "clean")];
    expect(stateOf(attempts)).toMatchObject({
      status: "in_cycle",
      anchorDate: "2026-10-01",
      anchorAttemptId: 1,
      nextStep: 0,
      nextDue: "2026-10-15",
    });
    expect(dueReviews(attempts, "2026-10-14")).toEqual([]);
    expect(dueReviews(attempts, "2026-10-15")).toEqual([
      { problem: 1, stepLabel: "Day 14", dueOn: "2026-10-15", daysOverdue: 0, anchorAttemptId: 1 },
    ]);
  });

  it("case 3: a slow with no earlier failure leaves the problem at status none", () => {
    const attempts = [a(1, "2026-10-01", "slow")];
    expect(stateOf(attempts)).toMatchObject({ status: "none" });
  });

  it("case 4: Day 1, Day 3, Day 7 clean passes walk the ladder and then queue a Day 14 review", () => {
    expect(STEP_LABELS).toEqual(["Day 1", "Day 3", "Day 7"]);
    expect(OFFSETS).toEqual([1, 3, 7]);

    const attempts = case4();

    // After the failure on 10-01.
    expect(stateOf(attempts.slice(0, 1))).toMatchObject({ status: "in_cycle", nextStep: 0, nextDue: "2026-10-02" });

    // After the pass on 10-02: Day 1 done, next is Day 3.
    expect(stateOf(attempts.slice(0, 2))).toMatchObject({ status: "in_cycle", nextStep: 1, nextDue: "2026-10-04" });
    expect(dueReviews(attempts.slice(0, 2), "2026-10-04")).toEqual([
      { problem: 1, stepLabel: "Day 3", dueOn: "2026-10-04", daysOverdue: 0, anchorAttemptId: 1 },
    ]);

    // After the pass on 10-04: Day 3 done, next is Day 7.
    expect(stateOf(attempts.slice(0, 3))).toMatchObject({ status: "in_cycle", nextStep: 2, nextDue: "2026-10-08" });
    expect(dueReviews(attempts.slice(0, 3), "2026-10-08")).toEqual([
      { problem: 1, stepLabel: "Day 7", dueOn: "2026-10-08", daysOverdue: 0, anchorAttemptId: 1 },
    ]);

    // After the clean pass on 10-08: the Day 14 review is anchored on that pass.
    expect(stateOf(attempts)).toMatchObject({
      status: "in_cycle",
      anchorDate: "2026-10-08",
      anchorAttemptId: 4,
      nextStep: 0,
      nextDue: "2026-10-22",
    });
    expect(dueReviews(attempts, "2026-10-08")).toEqual([]);
    expect(dueReviews(attempts, "2026-10-22")).toEqual([
      { problem: 1, stepLabel: "Day 14", dueOn: "2026-10-22", daysOverdue: 0, anchorAttemptId: 4 },
    ]);
  });

  it("case 5: a failed Day 3 review on 10-04 does not restart; Day 7 stays on 10-08", () => {
    const attempts = [a(1, "2026-10-01", "bug"), a(2, "2026-10-02", "clean"), a(3, "2026-10-04", "bug")];
    expect(stateOf(attempts)).toMatchObject({
      status: "in_cycle",
      anchorDate: "2026-10-01",
      anchorAttemptId: 1,
      nextStep: 2,
      nextDue: "2026-10-08",
    });
  });

  it("case 6: a failure on 10-08, mid-cycle after Day 3, restarts the cycle from 10-08", () => {
    const attempts = [
      a(1, "2026-10-01", "bug"),
      a(2, "2026-10-02", "clean"),
      a(3, "2026-10-04", "clean"),
      a(4, "2026-10-08", "bug"),
    ];
    expect(stateOf(attempts)).toMatchObject({
      status: "in_cycle",
      anchorDate: "2026-10-08",
      anchorAttemptId: 4,
      nextStep: 0,
      nextDue: "2026-10-09",
    });
  });

  it("case 7: late pass on 10-05 completes Day 1 and Day 3", () => {
    const attempts = [a(1, "2026-10-01", "bug"), a(2, "2026-10-05", "clean")];
    expect(stateOf(attempts)).toMatchObject({ status: "in_cycle", nextStep: 2, nextDue: "2026-10-08" });
    expect(dueReviews(attempts, "2026-10-08")).toEqual([
      { problem: 1, stepLabel: "Day 7", dueOn: "2026-10-08", daysOverdue: 0, anchorAttemptId: 1 },
    ]);
  });

  it("case 8: a clean pass on 10-09 completes all three reviews and queues Day 14 from 10-09", () => {
    const attempts = [a(1, "2026-10-01", "bug"), a(2, "2026-10-09", "clean")];
    expect(stateOf(attempts)).toMatchObject({
      status: "in_cycle",
      anchorDate: "2026-10-09",
      anchorAttemptId: 2,
      nextStep: 0,
      nextDue: "2026-10-23",
    });
  });

  it("case 9: a pass on the same day as the failure, with a later id, is ignored as early", () => {
    const attempts = [a(1, "2026-10-01", "bug"), a(2, "2026-10-01", "clean")];
    expect(stateOf(attempts)).toMatchObject({
      status: "in_cycle",
      anchorAttemptId: 1,
      nextStep: 0,
      nextDue: "2026-10-02",
    });
  });

  it("case 10: a pass on 10-03 is early once Day 1 is done, so nextDue stays 10-04", () => {
    const attempts = [a(1, "2026-10-01", "bug"), a(2, "2026-10-02", "clean"), a(3, "2026-10-03", "clean")];
    expect(stateOf(attempts)).toMatchObject({ status: "in_cycle", nextStep: 1, nextDue: "2026-10-04" });
  });

  it("case 11: a failure on 10-20 after a retirement starts a new cycle", () => {
    const attempts = [...case4(), a(5, "2026-10-20", "bug")];
    expect(stateOf(attempts)).toMatchObject({
      status: "in_cycle",
      anchorDate: "2026-10-20",
      anchorAttemptId: 5,
      nextStep: 0,
      nextDue: "2026-10-21",
    });
  });

  it("case 12: a clean pass on 10-22 completes the Day 14 review and retires the problem", () => {
    const attempts = [...case4(), a(5, "2026-10-22", "clean")];
    expect(stateOf(attempts)).toMatchObject({
      status: "retired",
      anchorDate: null,
      anchorAttemptId: null,
      nextStep: null,
      nextDue: null,
    });
    expect(dueReviews(attempts, "2026-12-31")).toEqual([]);
  });

  it("case 13: a failed Day 1 review on 10-02 does not restart; Day 3 is next", () => {
    const attempts = [a(1, "2026-10-01", "bug"), a(2, "2026-10-02", "bug")];
    expect(stateOf(attempts)).toMatchObject({
      status: "in_cycle",
      anchorDate: "2026-10-01",
      anchorAttemptId: 1,
      nextStep: 1,
      nextDue: "2026-10-04",
    });
  });

  it("case 14: a slow on 10-02 counts as a pass and moves nextDue to Day 3", () => {
    const attempts = [a(1, "2026-10-01", "bug"), a(2, "2026-10-02", "slow")];
    expect(stateOf(attempts)).toMatchObject({ status: "in_cycle", nextStep: 1, nextDue: "2026-10-04" });
  });

  it("case 15: with today 10-06, the Day 3 review is due and 2 days overdue", () => {
    const attempts = [a(1, "2026-10-01", "bug"), a(2, "2026-10-02", "clean")];
    expect(dueReviews(attempts, "2026-10-06")).toEqual([
      { problem: 1, stepLabel: "Day 3", dueOn: "2026-10-04", daysOverdue: 2, anchorAttemptId: 1 },
    ]);
  });

  it("case 16: bug, wrong-principle and read-solution each start a cycle", () => {
    const fails = OUTCOMES.filter((o) => o !== "clean" && o !== "slow");
    expect(fails).toEqual(["bug", "wrong-principle", "read-solution"]);
    for (const outcome of fails) {
      expect(stateOf([a(1, "2026-10-01", outcome)])).toMatchObject({
        status: "in_cycle",
        anchorAttemptId: 1,
        nextStep: 0,
        nextDue: "2026-10-02",
      });
    }
  });

  it("case 17: case 4's attempts in a shuffled order give the same result as case 4", () => {
    const ordered = case4();
    const shuffled = [ordered[3], ordered[0], ordered[2], ordered[1]];
    expect(problemStates(shuffled)).toEqual(problemStates(case4()));
    expect(stateOf(shuffled)).toMatchObject({
      status: "in_cycle",
      anchorDate: "2026-10-08",
      anchorAttemptId: 4,
      nextStep: 0,
      nextDue: "2026-10-22",
    });
  });

  it("case 18: two problems due on the same day are ordered by due date, then problem number", () => {
    const attempts = [
      a(1, "2026-10-03", "bug", 20),
      a(2, "2026-10-03", "bug", 10),
      a(3, "2026-10-01", "bug", 5),
    ];
    const due = dueReviews(attempts, "2026-10-10");
    expect(due.map((d) => d.problem)).toEqual([5, 10, 20]);
  });

  it("case 19: a second failure on the same day 10-01 is early and ignored", () => {
    const attempts = [a(1, "2026-10-01", "bug"), a(2, "2026-10-01", "bug")];
    expect(stateOf(attempts)).toMatchObject({ status: "in_cycle", anchorAttemptId: 1, nextStep: 0 });
  });

  it("case 20: a failure on 10-24 is due on 10-25 with 0 days overdue (clocks change that night)", () => {
    const attempts = [a(1, "2026-10-24", "bug")];
    expect(stateOf(attempts)).toMatchObject({ nextDue: "2026-10-25" });
    expect(dueReviews(attempts, "2026-10-25")).toEqual([
      { problem: 1, stepLabel: "Day 1", dueOn: "2026-10-25", daysOverdue: 0, anchorAttemptId: 1 },
    ]);
  });

  it("case 21: a failure on 12-31 has its Day 1 review due on 2027-01-01", () => {
    const attempts = [a(1, "2026-12-31", "bug")];
    expect(stateOf(attempts)).toMatchObject({
      status: "in_cycle",
      anchorDate: "2026-12-31",
      nextStep: 0,
      nextDue: "2027-01-01",
    });
  });

  it("case 22: a clean pass on 10-20, before Day 14 is due, is early and changes nothing", () => {
    const attempts = [...case4(), a(5, "2026-10-20", "clean")];
    expect(stateOf(attempts)).toMatchObject({ status: "in_cycle", anchorAttemptId: 4, nextDue: "2026-10-22" });
  });

  it("case 23: a slow pass at or after Day 14 retires the problem", () => {
    const attempts = [a(1, "2026-10-01", "clean"), a(2, "2026-10-15", "slow")];
    expect(stateOf(attempts)).toMatchObject({ status: "retired", nextStep: null, nextDue: null });
  });

  it("case 24: failing the Day 14 review starts the Day 1/3/7 cycle", () => {
    const attempts = [a(1, "2026-10-01", "clean"), a(2, "2026-10-15", "bug")];
    expect(stateOf(attempts)).toMatchObject({
      status: "in_cycle",
      anchorAttemptId: 2,
      nextStep: 0,
      nextDue: "2026-10-16",
    });
    expect(dueReviews(attempts, "2026-10-16")[0].stepLabel).toBe("Day 1");
  });

  it("case 25: a slow pass that finishes Day 7 also queues a Day 14 review", () => {
    const attempts = [a(1, "2026-10-01", "bug"), a(2, "2026-10-08", "slow")];
    expect(stateOf(attempts)).toMatchObject({
      status: "in_cycle",
      anchorAttemptId: 2,
      nextStep: 0,
      nextDue: "2026-10-22",
    });
  });

  it("case 26: a clean solve of a retired problem queues a new Day 14 review", () => {
    const attempts = [...case4(), a(5, "2026-10-22", "clean"), a(6, "2026-11-01", "clean")];
    expect(stateOf(attempts)).toMatchObject({
      status: "in_cycle",
      anchorAttemptId: 6,
      nextStep: 0,
      nextDue: "2026-11-15",
    });
  });

  it("case 27: failing Day 1, Day 3 and Day 7 in turn restarts only at Day 7", () => {
    const base = [a(1, "2026-10-01", "bug"), a(2, "2026-10-02", "bug"), a(3, "2026-10-04", "bug")];
    expect(stateOf(base)).toMatchObject({ anchorAttemptId: 1, nextStep: 2, nextDue: "2026-10-08" });
    const attempts = [...base, a(4, "2026-10-08", "bug")];
    expect(stateOf(attempts)).toMatchObject({
      status: "in_cycle",
      anchorDate: "2026-10-08",
      anchorAttemptId: 4,
      nextStep: 0,
      nextDue: "2026-10-09",
    });
  });

  it("case 28: a late failure after Day 7 is due restarts the cycle", () => {
    const attempts = [a(1, "2026-10-01", "bug"), a(2, "2026-10-12", "bug")];
    expect(stateOf(attempts)).toMatchObject({ anchorAttemptId: 2, nextStep: 0, nextDue: "2026-10-13" });
  });

  it("case 29: a failed Day 1 review is not queued again", () => {
    const attempts = [a(1, "2026-10-01", "bug"), a(2, "2026-10-02", "bug")];
    expect(dueReviews(attempts, "2026-10-03")).toEqual([]);
    expect(dueReviews(attempts, "2026-10-04")[0]).toMatchObject({ stepLabel: "Day 3", anchorAttemptId: 1 });
  });
});
