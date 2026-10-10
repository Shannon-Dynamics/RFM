// TypeScript port of rust/ch10-reasoning. Exact outcome probabilities match the crate's solutions;
// sampled traces use a JavaScript generator, so individual traces differ from the crate's.

export interface Judge { pSuccess: number; falseDone: number; falseRetry: number; maxAttempts: number }

export const blind = (pSuccess: number): Judge => ({ pSuccess, falseDone: 1, falseRetry: 0, maxAttempts: 1 });

export type StepEnd = "done" | "silent" | "help";
export interface Attempt { doneAfter: boolean; judgedDone: boolean }

export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function runStep(j: Judge, rand: () => number): { end: StepEnd; log: Attempt[] } {
  let done = false;
  const log: Attempt[] = [];
  for (let k = 0; k < j.maxAttempts; k++) {
    if (!done && rand() < j.pSuccess) done = true;
    const says = done ? rand() >= j.falseRetry : rand() < j.falseDone;
    log.push({ doneAfter: done, judgedDone: says });
    if (says) return { end: done ? "done" : "silent", log };
  }
  return { end: "help", log };
}

/** Same as the solutions to exercises 10.1 and 10.3. */
export function stepOutcomes(j: Judge) {
  let done = 0, notDone = 1, ok = 0, silent = 0, attempts = 0;
  for (let k = 0; k < j.maxAttempts; k++) {
    attempts += done + notDone;
    done += notDone * j.pSuccess;
    notDone *= 1 - j.pSuccess;
    ok += done * (1 - j.falseRetry);
    silent += notDone * j.falseDone;
    done *= j.falseRetry;
    notDone *= 1 - j.falseDone;
  }
  return { done: ok, silent, help: done + notDone, attempts };
}

/** Same as the solution to exercise 10.2. */
export function taskOutcomes(j: Judge, steps: number) {
  const { done: d, silent: s, help: a } = stepOutcomes(j);
  const allDone = d ** steps, noHelp = (d + s) ** steps;
  let help = 0;
  for (let k = 0; k < steps; k++) help += a * (d + s) ** k;
  return { done: allDone, silent: noHelp - allDone, help };
}
