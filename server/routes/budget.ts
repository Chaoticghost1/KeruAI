import { Router } from "express";
import { storage } from "../storage";
import { insertBudgetCategorySchema, insertBudgetTransactionSchema } from "@shared/schema";
import { authenticateToken, AuthRequest } from "../auth";

export const budgetRouter = Router();

// Get budget categories
budgetRouter.get("/categories", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const categories = await storage.getBudgetCategories(req.user!.id);
    res.json(categories);
  } catch (error) {
    res.status(400).json({ error: "Error fetching budget categories" });
  }
});

// Create budget category
budgetRouter.post("/categories", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const categoryData = { ...req.body, userId: req.user!.id };
    const validatedCategory = insertBudgetCategorySchema.parse(categoryData);
    const category = await storage.createBudgetCategory(validatedCategory);
    res.json(category);
  } catch (error) {
    res.status(400).json({ error: "Invalid category data" });
  }
});

// Get budget transactions
budgetRouter.get("/transactions", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const transactions = await storage.getBudgetTransactions(req.user!.id);
    res.json(transactions);
  } catch (error) {
    res.status(400).json({ error: "Error fetching budget transactions" });
  }
});

// Create budget transaction
budgetRouter.post("/transactions", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const transactionData = { ...req.body, userId: req.user!.id };
    const validatedTransaction = insertBudgetTransactionSchema.parse(transactionData);
    const transaction = await storage.createBudgetTransaction(validatedTransaction);
    res.json(transaction);
  } catch (error) {
    res.status(400).json({ error: "Invalid transaction data" });
  }
});
