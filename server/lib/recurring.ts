// server/lib/recurring.ts
// Recurring transaction expansion engine (ported concept from needim/gider.im-pwa recurringConfig).
// On each tick, for every active recurring config whose next due date has passed, generate a
// budget_transaction and advance the cursor. Guarded by ENABLE_RECURRING (default true).
import { db } from "../db";
import { budgetRecurring, budgetTransactions } from "@shared/schema";
import { eq, and, lte, isNull } from "drizzle-orm";

const ENABLED = process.env.ENABLE_RECURRING !== "false";

function nextDueDate(start: Date, frequency: string, every: number, occurrence: number): Date {
  const d = new Date(start);
  const mult = every * occurrence;
  if (frequency === "week") d.setDate(d.getDate() + 7 * mult);
  else if (frequency === "month") d.setMonth(d.getMonth() + mult);
  else if (frequency === "year") d.setFullYear(d.getFullYear() + mult);
  return d;
}

// We track progress by counting how many occurrences already generated.
// Simple approach: derive count from existing linked transactions.
async function expandForUser(userId: number) {
  const recs = await db
    .select()
    .from(budgetRecurring)
    .where(and(eq(budgetRecurring.userId, userId), isNull(budgetRecurring.endDate)));

  const now = new Date();
  for (const rec of recs) {
    const generated = await db
      .select()
      .from(budgetTransactions)
      .where(eq(budgetTransactions.recurringId, rec.id));
    let occurrence = generated.length;
    let due = nextDueDate(new Date(rec.startDate), rec.frequency, rec.every, occurrence);

    while (due <= now) {
      await db.insert(budgetTransactions).values({
        userId: rec.userId,
        categoryId: rec.categoryId,
        description: rec.description,
        amount: rec.amount,
        currency: rec.currency,
        type: rec.type,
        date: due,
        paid: false,
        recurringId: rec.id,
      });
      occurrence += 1;
      due = nextDueDate(new Date(rec.startDate), rec.frequency, rec.every, occurrence);
    }

    // Stop expanding if we passed endDate.
    if (rec.endDate && due > new Date(rec.endDate)) {
      await db
        .update(budgetRecurring)
        .set({ endDate: rec.endDate })
        .where(eq(budgetRecurring.id, rec.id));
    }
  }
}

let timer: NodeJS.Timeout | null = null;

export function startRecurringEngine() {
  if (!ENABLED) {
    console.log("[recurring] disabled (ENABLE_RECURRING=false)");
    return;
  }
  const run = async () => {
    try {
      const users = await db
        .selectDistinct({ userId: budgetRecurring.userId })
        .from(budgetRecurring);
      for (const { userId } of users) {
        await expandForUser(userId);
      }
    } catch (err) {
      console.warn("[recurring] tick failed:", err instanceof Error ? err.message : err);
    }
  };
  // Run once at boot, then hourly.
  void run();
  timer = setInterval(() => void run(), 60 * 60 * 1000);
  console.log("[recurring] engine started");
}

export function stopRecurringEngine() {
  if (timer) clearInterval(timer);
  timer = null;
}
