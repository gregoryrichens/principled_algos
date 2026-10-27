import { addDays, daysBetween } from "@/lib/dates";

export const OUTCOMES = ["clean", "slow", "bug", "wrong-principle", "read-solution"] as const;
export type Outcome = (typeof OUTCOMES)[number];

export const FAILS: ReadonlySet<Outcome> = new Set<Outcome>(["bug", "wrong-principle", "read-solution"]);

export const OFFSETS = [1, 3, 7] as const;
export const STEP_LABELS = ["Day 1", "Day 3", "Day 7"] as const;

export interface Attempt {
  id: number;
  attemptedOn: string;
  problem: number;
  outcome: Outcome;
}

export interface ProblemState {
  problem: number;
  status: "none" | "in_cycle" | "retired";
  anchorDate: string | null; // F: date of the failure that started the current cycle
  anchorAttemptId: number | null; // id of that failing attempt
  nextStep: 0 | 1 | 2 | null; // index into OFFSETS while in_cycle, else null
  nextDue: string | null; // addDays(anchorDate, OFFSETS[nextStep]) while in_cycle, else null
}

export interface DueReview {
  problem: number;
  stepLabel: string; // STEP_LABELS[nextStep]
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
      nextStep: null,
      nextDue: null,
    };

    for (const attempt of group) {
      if (FAILS.has(attempt.outcome)) {
        state.status = "in_cycle";
        state.anchorDate = attempt.attemptedOn;
        state.anchorAttemptId = attempt.id;
        state.nextStep = 0;
      } else if (state.status === "in_cycle" && state.anchorDate !== null && state.nextStep !== null) {
        const anchor = state.anchorDate;
        const k = OFFSETS.filter((o) => addDays(anchor, o) <= attempt.attemptedOn).length;
        if (k <= state.nextStep) continue; // early pass
        if (k === OFFSETS.length) {
          state.status = "retired";
          state.anchorDate = null;
          state.anchorAttemptId = null;
          state.nextStep = null;
        } else {
          state.nextStep = k as 1 | 2;
        }
      }
      state.nextDue =
        state.status === "in_cycle" && state.anchorDate !== null && state.nextStep !== null
          ? addDays(state.anchorDate, OFFSETS[state.nextStep])
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
      state.nextDue !== null &&
      state.nextStep !== null &&
      state.anchorAttemptId !== null &&
      state.nextDue <= today
    ) {
      due.push({
        problem: state.problem,
        stepLabel: STEP_LABELS[state.nextStep],
        dueOn: state.nextDue,
        daysOverdue: daysBetween(state.nextDue, today),
        anchorAttemptId: state.anchorAttemptId,
      });
    }
  }
  return due.sort((x, y) => (x.dueOn === y.dueOn ? x.problem - y.problem : x.dueOn < y.dueOn ? -1 : 1));
}
