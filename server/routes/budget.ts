import { Router, Response, NextFunction } from "express";
import { storage } from "../storage";
import {
  insertBudgetCategorySchema,
  insertBudgetTransactionSchema,
  insertBudgetGroupSchema,
  insertBudgetTagSchema,
  insertBudgetRecurringSchema,
} from "@shared/schema";
import { authenticateToken, AuthRequest } from "../auth";
import { generateBudgetInsights } from "../ai-service";

export const budgetRouter = Router();

// Get budget categories
budgetRouter.get("/categories", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const categories = await storage.getBudgetCategories(req.user!.id);
    res.json(categories);
  } catch (error) {
    next(error);
  }
});

// Create budget category
budgetRouter.post("/categories", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const categoryData = { ...req.body, userId: req.user!.id };
    const validatedCategory = insertBudgetCategorySchema.parse(categoryData);
    const category = await storage.createBudgetCategory(validatedCategory);
    res.json(category);
  } catch (error) {
    next(error);
  }
});

// Get budget transactions
budgetRouter.get("/transactions", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const transactions = await storage.getBudgetTransactions(req.user!.id);
    res.json(transactions);
  } catch (error) {
    next(error);
  }
});

// Create budget transaction
budgetRouter.post("/transactions", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const transactionData = { ...req.body, userId: req.user!.id };
    const validatedTransaction = insertBudgetTransactionSchema.parse(transactionData);
    const transaction = await storage.createBudgetTransaction(validatedTransaction);
    res.json(transaction);
  } catch (error) {
    next(error);
  }
});

// Update budget category
budgetRouter.put("/categories/:id", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const { name, budget } = req.body;
    const updates: Record<string, unknown> = {};
    if (name !== undefined) updates.name = name;
    if (budget !== undefined) updates.budget = budget;
    const updated = await storage.updateBudgetCategory(id, req.user!.id, updates as { name?: string; budget?: string });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Delete budget category
budgetRouter.delete("/categories/:id", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteBudgetCategory(id, req.user!.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Update budget transaction
budgetRouter.put("/transactions/:id", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const { description, amount, date, categoryId, currency, type, paid, groupId, tagId, recurringId } = req.body;
    const updates: Record<string, unknown> = {};
    if (description !== undefined) updates.description = description;
    if (amount !== undefined) updates.amount = amount;
    if (date !== undefined) updates.date = new Date(date);
    if (categoryId !== undefined) updates.categoryId = categoryId;
    if (currency !== undefined) updates.currency = currency;
    if (type !== undefined) updates.type = type;
    if (paid !== undefined) updates.paid = paid;
    if (groupId !== undefined) updates.groupId = groupId;
    if (tagId !== undefined) updates.tagId = tagId;
    if (recurringId !== undefined) updates.recurringId = recurringId;
    const updated = await storage.updateBudgetTransaction(
      id,
      req.user!.id,
      updates as Partial<import("@shared/schema").BudgetTransaction>
    );
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

// Delete budget transaction
budgetRouter.delete("/transactions/:id", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    await storage.deleteBudgetTransaction(id, req.user!.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// ---- Phase 2: groups, tags, recurring, analytics ----

// Groups
budgetRouter.get("/groups", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(await storage.getBudgetGroups(req.user!.id));
  } catch (error) {
    next(error);
  }
});

budgetRouter.post("/groups", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = insertBudgetGroupSchema.parse({ ...req.body, userId: req.user!.id });
    res.json(await storage.createBudgetGroup(data));
  } catch (error) {
    next(error);
  }
});

budgetRouter.delete("/groups/:id", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await storage.deleteBudgetGroup(parseInt(req.params.id), req.user!.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Tags
budgetRouter.get("/tags", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(await storage.getBudgetTags(req.user!.id));
  } catch (error) {
    next(error);
  }
});

budgetRouter.post("/tags", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = insertBudgetTagSchema.parse({ ...req.body, userId: req.user!.id });
    res.json(await storage.createBudgetTag(data));
  } catch (error) {
    next(error);
  }
});

budgetRouter.delete("/tags/:id", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await storage.deleteBudgetTag(parseInt(req.params.id), req.user!.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Recurring
budgetRouter.get("/recurring", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(await storage.getBudgetRecurring(req.user!.id));
  } catch (error) {
    next(error);
  }
});

budgetRouter.post("/recurring", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = insertBudgetRecurringSchema.parse({ ...req.body, userId: req.user!.id });
    res.json(await storage.createBudgetRecurring(data));
  } catch (error) {
    next(error);
  }
});

budgetRouter.delete("/recurring/:id", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await storage.deleteBudgetRecurring(parseInt(req.params.id), req.user!.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Analytics (category breakdown + monthly trend, normalized to HNL)
budgetRouter.get("/analytics", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(await storage.getUserBudgetAnalytics(req.user!.id));
  } catch (error) {
    next(error);
  }
});

// AI insights (flagged ENABLE_BUDGET_AI; rule-based fallback)
budgetRouter.get("/insights", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const analytics = await storage.getUserBudgetAnalytics(req.user!.id);
    const lang = ((req.query.lang as "es" | "en") || "es");
    const insights = await generateBudgetInsights({
      totalIncomeHnl: analytics.totalIncomeHnl,
      totalExpenseHnl: analytics.totalExpenseHnl,
      byCategory: analytics.byCategory,
      language: lang,
      userId: req.user!.id,
    });
    res.json({ insights });
  } catch (error) {
    next(error);
  }
});

// Gamification (logging streak + on-budget badge)
budgetRouter.get("/gamification", authenticateToken, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json(await storage.getBudgetGamification(req.user!.id));
  } catch (error) {
    next(error);
  }
});
