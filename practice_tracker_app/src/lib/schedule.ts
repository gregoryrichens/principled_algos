import { addDays, daysBetween } from "@/lib/dates";

export const OUTCOMES = ["clean", "slow", "bug", "wrong-principle", "read-solution"] as const;
export type Outcome = (typeof OUTCOMES)[number];

export const FAILS: ReadonlySet<Outcome> = new Set<Outcome>(["bug", "wrong-principle", "read-solution"]);

export const OFFSETS = [1, 3, 7] as const;
export const STEP_LABELS = ["Day 1", "Day 3", "Day 7"] as const;

// A review cycle is a list of days after its anchor attempt, each with a label.
// A failure starts the Day 1/3/7 cycle; a clean solve, or finishing that cycle, starts a one-step Day 14 cycle.
interface Cycle {
  offsets: readonly number[];
  labels: readonly string[];
}
const FAIL_CYCLE: Cycle = { offsets: OFFSETS, labels: STEP_LABELS };
const CLEAN_CYCLE: Cycle = { offsets: [14], labels: ["Day 14"] };

export interface Attempt {
  id: number;
  attemptedOn: string;
  problem: number;
  outcome: Outcome;
}

export interface ProblemState {
  problem: number;
  status: "none" | "in_cycle" | "retired";
  anchorDate: string | null; // F: date of the attempt that started the current cycle
  anchorAttemptId: number | null; // id of that attempt (a failure, or a clean solve)
  cycle: Cycle | null; // FAIL_CYCLE or CLEAN_CYCLE while in_cycle, else null
  nextStep: number | null; // index into cycle.offsets while in_cycle, else null
  nextDue: string | null; // addDays(anchorDate, cycle.offsets[nextStep]) while in_cycle, else null
}

export interface DueReview {
  problem: number;
  stepLabel: string; // cycle.labels[nextStep]
  dueOn: string;
  daysOverdue: number; // daysBetween(dueOn, today), >= 0
  anchorAttemptId: number;
}

function byDateThenId(x: Attempt, y: Attempt): number {
  if (x.attemptedOn !== y.attemptedOn) return x.attemptedOn < y.attemptedOn ? -1 : 1;
  return x.id - y.id;
}

export function problemStates(attempts: Iterable<Attempt>): Map<number, ProblemState> {
  const groups = new Map<number, Attempt[]>();
  for (const attempt of attempts) {
    const group = groups.get(attempt.problem);
    if (group) group.push(attempt);
    else groups.set(attempt.problem, [attempt]);
  }

  const states = new Map<number, ProblemState>();
  for (const [problem, group] of groups) {
    group.sort(byDateThenId);
    const state: ProblemState = {
      problem,
      status: "none",
      anchorDate: null,
      anchorAttemptId: null,
      cycle: null,
      nextStep: null,
      nextDue: null,
    };

    const start = (cycle: Cycle, attempt: Attempt) => {
      state.status = "in_cycle";
      state.anchorDate = attempt.attemptedOn;
      state.anchorAttemptId = attempt.id;
      state.cycle = cycle;
      state.nextStep = 0;
    };

    for (const attempt of group) {
      if (FAILS.has(attempt.outcome)) {
        start(FAIL_CYCLE, attempt);
      } else if (state.status === "in_cycle" && state.anchorDate !== null && state.cycle !== null && state.nextStep !== null) {
        const anchor = state.anchorDate;
        const cycle = state.cycle;
        const k = cycle.offsets.filter((o) => addDays(anchor, o) <= attempt.attemptedOn).length;
        if (k <= state.nextStep) continue; // early pass
        if (k < cycle.offsets.length) {
          state.nextStep = k;
        } else if (cycle === FAIL_CYCLE) {
          start(CLEAN_CYCLE, attempt); // finished the failure ladder: confirm 14 days later
        } else {
          state.status = "retired";
          state.anchorDate = null;
          state.anchorAttemptId = null;
          state.cycle = null;
          state.nextStep = null;
        }
      } else if (attempt.outcome === "clean") {
        start(CLEAN_CYCLE, attempt);
      }
      state.nextDue =
        state.status === "in_cycle" && state.anchorDate !== null && state.cycle !== null && state.nextStep !== null
          ? addDays(state.anchorDate, state.cycle.offsets[state.nextStep])
          : null;
    }

    states.set(problem, state);
  }
  return states;
}

export function dueReviews(attempts: Iterable<Attempt>, today: string): DueReview[] {
  const due: DueReview[] = [];
  for (const state of problemStates(attempts).values()) {
    if (
      state.status === "in_cycle" &&
      state.cycle !== null &&
      state.nextDue !== null &&
      state.nextStep !== null &&
      state.anchorAttemptId !== null &&
      state.nextDue <= today
    ) {
      due.push({
        problem: state.problem,
        stepLabel: state.cycle.labels[state.nextStep],
        dueOn: state.nextDue,
        daysOverdue: daysBetween(state.nextDue, today),
        anchorAttemptId: state.anchorAttemptId,
      });
    }
  }
  return due.sort((x, y) => (x.dueOn === y.dueOn ? x.problem - y.problem : x.dueOn < y.dueOn ? -1 : 1));
}
