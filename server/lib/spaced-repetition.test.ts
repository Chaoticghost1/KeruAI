import { describe, it, expect } from "vitest";
import {
  getInitialSchedulingInfo,
  scheduleNextReview,
  isDue,
} from "./spaced-repetition";

describe("getInitialSchedulingInfo", () => {
  it("starts at repetition 0 with a future review date", () => {
    const info = getInitialSchedulingInfo("medium");
    expect(info.repetitions).toBe(0);
    expect(new Date(info.nextReviewAt).getTime()).toBeGreaterThan(Date.now());
  });

  it("gives easy a higher ease factor than hard", () => {
    expect(getInitialSchedulingInfo("easy").easeFactor).toBeGreaterThan(
      getInitialSchedulingInfo("hard").easeFactor,
    );
  });
});

describe("scheduleNextReview", () => {
  it("advances repetitions on an easy review", () => {
    const first = getInitialSchedulingInfo("medium");
    const next = scheduleNextReview(first, "easy");
    expect(next.repetitions).toBe(first.repetitions + 1);
    expect(next.easeFactor).toBeGreaterThanOrEqual(first.easeFactor);
  });

  it("resets repetitions and lowers ease on a hard review", () => {
    let info = getInitialSchedulingInfo("medium");
    info = scheduleNextReview(info, "easy");
    info = scheduleNextReview(info, "easy");
    const hard = scheduleNextReview(info, "hard");
    expect(hard.repetitions).toBe(0);
    expect(hard.easeFactor).toBeLessThan(info.easeFactor);
  });

  it("never drops ease factor below 1.3", () => {
    let info = getInitialSchedulingInfo("hard");
    for (let i = 0; i < 10; i++) info = scheduleNextReview(info, "hard");
    expect(info.easeFactor).toBeGreaterThanOrEqual(1.3);
  });

  it("schedules a longer interval for more repetitions", () => {
    const now = Date.now();
    const rep1 = scheduleNextReview(getInitialSchedulingInfo("medium"), "easy", now);
    const advanced = scheduleNextReview(rep1, "easy", now);
    const rep2 = scheduleNextReview(advanced, "easy", now);
    expect(new Date(rep2.nextReviewAt).getTime()).toBeGreaterThan(
      new Date(rep1.nextReviewAt).getTime(),
    );
  });

  it("creates fresh info when current is null", () => {
    const next = scheduleNextReview(null, "medium");
    expect(next.repetitions).toBe(1);
  });
});

describe("isDue", () => {
  it("treats null scheduling info as due", () => {
    expect(isDue(null)).toBe(true);
  });

  it("returns false for an item scheduled in the future", () => {
    const info = getInitialSchedulingInfo("easy");
    expect(isDue(info)).toBe(false);
  });

  it("returns true once the review date has passed", () => {
    const info = getInitialSchedulingInfo("medium");
    const past = { ...info, nextReviewAt: new Date(Date.now() - 1000).toISOString() };
    expect(isDue(past)).toBe(true);
  });
});
