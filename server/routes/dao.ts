import { Router, Response, NextFunction } from "express";
import { storage } from "../storage";
import { insertDaoProposalSchema, insertDaoVoteSchema } from "@shared/schema";
import { authenticateToken, AuthRequest } from "../auth";

export const daoRouter = Router();

// Lightweight dao_access feature-flag gate (client also gates via use-system-features).
async function requireDaoAccess(req: AuthRequest, res: Response, next: NextFunction) {
  try {
    const setting = await storage.getSystemSetting("features");
    const enabled =
      setting && typeof setting === "object" && !Array.isArray(setting)
        ? (setting as Record<string, boolean>).dao_access !== false
        : true;
    if (!enabled) {
      return res.status(403).json({ error: "DAO access is disabled" });
    }
    next();
  } catch (error) {
    next(error);
  }
}

// List proposals with their tallies
daoRouter.get("/proposals", authenticateToken, requireDaoAccess, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const proposals = await storage.getDaoProposals();
    const withTallies = await Promise.all(
      proposals.map(async (p) => ({ ...p, tally: await storage.getDaoProposalTally(p.id) }))
    );
    res.json(withTallies);
  } catch (error) {
    next(error);
  }
});

// Single proposal with tally + the current user's vote
daoRouter.get("/proposals/:id", authenticateToken, requireDaoAccess, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const proposal = await storage.getDaoProposalById(id);
    if (!proposal) {
      return res.status(404).json({ error: "Proposal not found" });
    }
    const [tally, userVote] = await Promise.all([
      storage.getDaoProposalTally(id),
      storage.getUserDaoVote(id, req.user!.id),
    ]);
    res.json({ ...proposal, tally, userVote: userVote ?? null });
  } catch (error) {
    next(error);
  }
});

// Create a proposal (author = current user, status defaults to active)
daoRouter.post("/proposals", authenticateToken, requireDaoAccess, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const data = insertDaoProposalSchema.parse({ ...req.body, authorId: req.user!.id });
    const proposal = await storage.createDaoProposal(data);
    res.json(proposal);
  } catch (error) {
    next(error);
  }
});

// Cast or change a vote (one per user; only while active and before deadline)
daoRouter.post("/proposals/:id/vote", authenticateToken, requireDaoAccess, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id);
    const proposal = await storage.getDaoProposalById(id);
    if (!proposal) {
      return res.status(404).json({ error: "Proposal not found" });
    }
    if (proposal.status !== "active") {
      return res.status(409).json({ error: "Voting is closed for this proposal" });
    }
    if (new Date(proposal.deadline).getTime() < Date.now()) {
      return res.status(409).json({ error: "Voting deadline has passed" });
    }
    const data = insertDaoVoteSchema.parse({
      proposalId: id,
      userId: req.user!.id,
      choice: req.body.choice,
    });
    const vote = await storage.castDaoVote(data);
    const tally = await storage.getDaoProposalTally(id);
    res.json({ vote, tally });
  } catch (error) {
    next(error);
  }
});

// Close/resolve a proposal (teachers/superusers only) -> passed | rejected by majority
daoRouter.post("/proposals/:id/close", authenticateToken, requireDaoAccess, async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user!.role !== "teacher" && req.user!.role !== "superuser") {
      return res.status(403).json({ error: "Only teachers or superusers can close proposals" });
    }
    const id = parseInt(req.params.id);
    const proposal = await storage.getDaoProposalById(id);
    if (!proposal) {
      return res.status(404).json({ error: "Proposal not found" });
    }
    const tally = await storage.getDaoProposalTally(id);
    const next = tally.for > tally.against ? "passed" : "rejected";
    const updated = await storage.updateDaoProposalStatus(id, next);
    res.json({ ...updated, tally });
  } catch (error) {
    next(error);
  }
});
