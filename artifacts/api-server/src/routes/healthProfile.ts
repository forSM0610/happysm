import { getAuth } from "@clerk/express";
import {
  GetDashboardResponse,
  GetHealthProfileResponse,
  GetScheduleResponse,
  SaveHealthProfileBody,
  SaveHealthProfileResponse,
} from "@workspace/api-zod";
import { db, healthProfilesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { Router, type IRouter, type NextFunction, type Request, type Response } from "express";
import { buildDashboard, buildWeeklySchedule } from "../lib/healthGuidance";

const router: IRouter = Router();

function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const userId = getAuth(req).userId;
  if (!userId) {
    res.status(401).json({ error: "Authentication required" });
    return;
  }
  res.locals.userId = userId;
  next();
}

async function getProfile(userId: string) {
  const [profile] = await db
    .select()
    .from(healthProfilesTable)
    .where(eq(healthProfilesTable.userId, userId))
    .limit(1);
  return profile ?? null;
}

router.use(requireAuth);

router.get("/health-profile", async (_req, res): Promise<void> => {
  const profile = await getProfile(res.locals.userId as string);
  if (!profile) {
    res.json(GetHealthProfileResponse.parse(null));
    return;
  }

  res.json(
    GetHealthProfileResponse.parse({
      ageYears: profile.ageYears,
      heightCm: profile.heightCm,
      weightKg: profile.weightKg,
      sleepHours: profile.sleepHours,
      waterGlasses: profile.waterGlasses,
      activityLevel: profile.activityLevel,
      stressLevel: profile.stressLevel,
      goals: profile.goals,
      consentAccepted: profile.consentAccepted,
      consentedAt: profile.consentedAt.toISOString(),
    }),
  );
});

router.put("/health-profile", async (req, res): Promise<void> => {
  const parsed = SaveHealthProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  if (!parsed.data.consentAccepted) {
    res.status(400).json({ error: "Consent is required before saving health information" });
    return;
  }

  const userId = res.locals.userId as string;
  const consentedAt = new Date();
  const values = {
    userId,
    ageYears: parsed.data.ageYears,
    heightCm: parsed.data.heightCm,
    weightKg: parsed.data.weightKg,
    sleepHours: parsed.data.sleepHours,
    waterGlasses: parsed.data.waterGlasses,
    activityLevel: parsed.data.activityLevel,
    stressLevel: parsed.data.stressLevel,
    goals: parsed.data.goals,
    consentAccepted: true,
    consentedAt,
  };
  const [profile] = await db
    .insert(healthProfilesTable)
    .values(values)
    .onConflictDoUpdate({
      target: healthProfilesTable.userId,
      set: { ...values, userId },
    })
    .returning();

  res.json(
    SaveHealthProfileResponse.parse({
      ageYears: profile.ageYears,
      heightCm: profile.heightCm,
      weightKg: profile.weightKg,
      sleepHours: profile.sleepHours,
      waterGlasses: profile.waterGlasses,
      activityLevel: profile.activityLevel,
      stressLevel: profile.stressLevel,
      goals: profile.goals,
      consentAccepted: profile.consentAccepted,
      consentedAt: profile.consentedAt.toISOString(),
    }),
  );
});

router.get("/dashboard", async (_req, res): Promise<void> => {
  const profile = await getProfile(res.locals.userId as string);
  res.json(GetDashboardResponse.parse(buildDashboard(profile)));
});

router.get("/schedule", async (_req, res): Promise<void> => {
  const profile = await getProfile(res.locals.userId as string);
  res.json(GetScheduleResponse.parse(buildWeeklySchedule(profile)));
});

export default router;
