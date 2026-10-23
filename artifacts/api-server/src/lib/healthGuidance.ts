import type { HealthProfileRecord } from "@workspace/db";

const weekdays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const goalContent: Record<string, { focus: string; suggestion: string; category: string }> = {
  "move-more": {
    focus: "Make room for movement",
    suggestion: "Try a short movement break that fits your current energy and routine.",
    category: "movement",
  },
  "sleep-better": {
    focus: "Create a wind-down cue",
    suggestion: "Choose a simple cue that helps you begin winding down at a regular time.",
    category: "sleep",
  },
  hydrate: {
    focus: "Make hydration easier",
    suggestion: "Keep a drink nearby and pair a sip with a routine you already have.",
    category: "hydration",
  },
  "manage-stress": {
    focus: "Pause and reset",
    suggestion: "Take a brief pause for a slow breath or another calming activity you enjoy.",
    category: "stress",
  },
  "build-routine": {
    focus: "Build a small routine",
    suggestion: "Attach one manageable habit to a daily cue you already follow.",
    category: "general",
  },
};

function profileToApi(profile: HealthProfileRecord) {
  return {
    ageYears: profile.ageYears,
    heightCm: profile.heightCm,
    weightKg: profile.weightKg,
    sleepHours: profile.sleepHours,
    waterGlasses: profile.waterGlasses,
    activityLevel: profile.activityLevel as "low" | "some" | "active" | null,
    stressLevel: profile.stressLevel as "low" | "moderate" | "high" | null,
    goals: profile.goals,
    consentAccepted: profile.consentAccepted,
    consentedAt: profile.consentedAt.toISOString(),
  };
}

export function buildWeeklySchedule(profile: HealthProfileRecord | null) {
  if (!profile) {
    return { days: [] };
  }
  const selectedGoals = profile.goals.length ? profile.goals : ["build-routine"];

  return {
    days: weekdays.map((day, index) => {
      const content = goalContent[selectedGoals[index % selectedGoals.length]] ?? goalContent["build-routine"];
      return {
        day,
        focus: content.focus,
        suggestions: [content.suggestion],
      };
    }),
  };
}

export function buildDashboard(profile: HealthProfileRecord | null) {
  const mappedProfile = profile ? profileToApi(profile) : null;
  const bmi =
    profile?.heightCm && profile.weightKg
      ? Math.round((profile.weightKg / (profile.heightCm / 100) ** 2) * 10) / 10
      : null;
  const insights = [];

  if (!profile) {
    insights.push({
      title: "Start with your own routine",
      detail: "Complete the optional questionnaire to see suggestions based on the habits and goals you choose to share.",
      category: "general",
    });
  } else {
    if (profile.goals.length > 0) {
      const goal = goalContent[profile.goals[0]];
      if (goal) {
        insights.push({
          title: goal.focus,
          detail: goal.suggestion,
          category: goal.category,
        });
      }
    }
    if (profile.sleepHours !== null && profile.sleepHours < 7) {
      insights.push({
        title: "A steadier wind-down may help",
        detail: `You reported about ${profile.sleepHours} hours of sleep. A regular wind-down cue is one small habit you could try.`,
        category: "sleep",
      });
    }
    if (profile.stressLevel === "high") {
      insights.push({
        title: "Make space for a pause",
        detail: "You marked stress as high. A brief pause or calming activity may be a manageable place to start.",
        category: "stress",
      });
    }
    if (profile.waterGlasses !== null && profile.waterGlasses < 5) {
      insights.push({
        title: "Make hydration convenient",
        detail: "You recorded a lower number of daily glasses. Keeping a drink nearby can make it easier to remember, if appropriate for you.",
        category: "hydration",
      });
    }
    if (insights.length === 0) {
      insights.push({
        title: "Keep it realistic",
        detail: "Choose one small action that fits your week. Your routines can change as your needs do.",
        category: "general",
      });
    }
  }

  return {
    profile: mappedProfile,
    bmi,
    insights,
    schedule: buildWeeklySchedule(profile),
    disclaimer:
      "Happysm shares general educational information, not medical advice or a diagnosis. BMI is a limited estimate and is not a complete measure of health. Speak with a qualified professional for personal medical questions.",
  };
}
