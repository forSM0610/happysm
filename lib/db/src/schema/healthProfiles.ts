import { createInsertSchema } from "drizzle-zod";
import {
  boolean,
  doublePrecision,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { z } from "zod/v4";

export const healthProfilesTable = pgTable(
  "health_profiles",
  {
    id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
    userId: text("user_id").notNull(),
    ageYears: integer("age_years"),
    heightCm: doublePrecision("height_cm"),
    weightKg: doublePrecision("weight_kg"),
    sleepHours: doublePrecision("sleep_hours"),
    waterGlasses: integer("water_glasses"),
    activityLevel: text("activity_level"),
    stressLevel: text("stress_level"),
    goals: text("goals").array().notNull().default([]),
    consentAccepted: boolean("consent_accepted").notNull().default(true),
    consentedAt: timestamp("consented_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (table) => [uniqueIndex("health_profiles_user_id_unique").on(table.userId)],
);

export const insertHealthProfileSchema = createInsertSchema(healthProfilesTable);

export type InsertHealthProfile = z.infer<typeof insertHealthProfileSchema>;
export type HealthProfileRecord = typeof healthProfilesTable.$inferSelect;
