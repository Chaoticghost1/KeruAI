import { Router } from "express";
import { storage } from "../storage";
import { insertBudgetCategorySchema, insertBudgetTransactionSchema } from "@shared/schema";

export const budgetRouter = Router();

// Get budget categories
budgetRouter.get("/categories/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const categories = await storage.getBudgetCategories(userId);
    res.json(categories);
  } catch (error) {
    res.status(400).json({ error: "Error fetching budget categories" });
  }
});

// Create budget category
budgetRouter.post("/categories", async (req, res) => {
  try {
    const validatedCategory = insertBudgetCategorySchema.parse(req.body);
    const category = await storage.createBudgetCategory(validatedCategory);
    res.json(category);
  } catch (error) {
    res.status(400).json({ error: "Invalid category data" });
  }
});

// Get budget transactions
budgetRouter.get("/transactions/:userId", async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);
    const transactions = await storage.getBudgetTransactions(userId);
    res.json(transactions);
  } catch (error) {
    res.status(400).json({ error: "Error fetching budget transactions" });
  }
});

// Create budget transaction
budgetRouter.post("/transactions", async (req, res) => {
  try {
    const validatedTransaction = insertBudgetTransactionSchema.parse(req.body);
    const transaction = await storage.createBudgetTransaction(validatedTransaction);
    res.json(transaction);
  } catch (error) {
    res.status(400).json({ error: "Invalid transaction data" });
  }
});
