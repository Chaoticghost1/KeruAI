import { Router, Response, NextFunction } from "express";
import { storage } from "../storage";
import { insertBudgetCategorySchema, insertBudgetTransactionSchema } from "@shared/schema";
import { authenticateToken, AuthRequest } from "../auth";

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
