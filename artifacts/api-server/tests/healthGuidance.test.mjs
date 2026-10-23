import assert from "node:assert/strict";
import { test } from "node:test";
import { buildDashboard, buildWeeklySchedule } from "../src/lib/healthGuidance.ts";

const profile = (overrides = {}) => ({
  id: 1,
  userId: "user_test",
  ageYears: null,
  heightCm: 170,
  weightKg: 66,
  sleepHours: 7,
  waterGlasses: 6,
  activityLevel: "some",
  stressLevel: "low",
  goals: ["move-more"],
  consentAccepted: true,
  consentedAt: new Date("2026-01-01T00:00:00.000Z"),
  createdAt: new Date("2026-01-01T00:00:00.000Z"),
  updatedAt: new Date("2026-01-01T00:00:00.000Z"),
  ...overrides,
});

test("dashboard only estimates BMI when height and weight are both present", () => {
  assert.equal(buildDashboard(profile()).bmi, 22.8);
  assert.equal(buildDashboard(profile({ heightCm: null })).bmi, null);
  assert.equal(buildDashboard(profile({ weightKg: null })).bmi, null);
});

test("dashboard without a profile has no generated routine or invented health record", () => {
  const dashboard = buildDashboard(null);
  assert.equal(dashboard.profile, null);
  assert.equal(dashboard.bmi, null);
  assert.deepEqual(dashboard.schedule.days, []);
  assert.match(dashboard.disclaimer, /not medical advice/i);
});

test("weekly routine contains seven days and reflects the user's selected goal", () => {
  const schedule = buildWeeklySchedule(profile({ goals: ["sleep-better"] }));
  assert.equal(schedule.days.length, 7);
  assert.equal(schedule.days[0].focus, "Create a wind-down cue");
  assert.ok(schedule.days.every((day) => day.suggestions.length > 0));
});
