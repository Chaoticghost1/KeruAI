# Educational Games: Strategy, Stack & Checklist

Single reference for the game roadmap (MathMaster, LinguaPlay, BudgetBattle), recommendations, and implementation checklist.

---

## Strategy at a glance

**Current:** CruiseWord (1 game) — 6 levels, leaderboard, bilingual, offline, gamification.

**Phase 1 (Weeks 1–4):** MathMaster + LinguaPlay in parallel.
- **MathMaster:** 6 levels (Arithmetic → Calculus), link to Math Buddy AI, 252+ math problems, 4 badge types. Time: 2–3 weeks.
- **LinguaPlay:** 6 levels (Vocab → Academic language), 5 modes (Vocab, Grammar, Listening, Spelling, Pronunciation), link to Professor Quill, 1,050+ language problems, 5 badge types. Time: 3–4 weeks.
- **Result:** 3-game hub (CruiseWord, MathMaster, LinguaPlay).

**Phase 2 (Weeks 5–7):** BudgetBattle — 6 levels (Allowance → Wealth), scenario-based, BudgetPal integration, finance AI mentor, 24+ scenarios. Result: 4-game hub.

**Phase 3 (optional):** Science Quest, History Timeline, Code Crafter, Health Hero.

**Success metrics (Phase 1):** 50%+ engagement with new games, +30% DAU, 15+ min avg session, 5+ school inquiries.

---

## Game summaries

| Game | Domain | Core loop | Integration |
|------|--------|-----------|-------------|
| **MathMaster** | STEM (math) | Select level → problem → MC answer → feedback → XP/badges → leaderboard. Modes: Timed, Sandbox, Tournament. | Study Buddy (Math Buddy), Revision, BudgetPal (real-world math). |
| **LinguaPlay** | Language arts | Select mode (Vocab, Grammar, Listening, Spelling, Pronunciation) → prompt → respond → AI feedback → XP/badges. | Study Buddy (Professor Quill), leaderboard per language/mode. |
| **BudgetBattle** | Life skills | Scenario-based (allowance → wealth), decisions, outcomes. Deep BudgetPal integration, finance mentor. | BudgetPal, gamified engagement. |

**Tech:** Reuse `/api/games/scores`, add `math_problems` / `language_problems` tables, bilingual ES/EN, offline store + sync. Frontend: React components similar to CruiseWord.

---

## Implementation checklist (condensed)

**Pre-launch:** Executive review, approve Phase 1, assign devs, feature branches (`feature/mathmaster`, `feature/linguaplay`), migrations for new tables, staging.

**Content:** MathMaster 120–252 problems (levels 1–6, CSV template: level, topic, question_es/en, options, correct_answer, explanation). LinguaPlay 120–200 per level, modes, audio (TTS or native). BudgetBattle 24+ scenarios.

**Backend:** Migrations for `math_problems`, `language_problems`; endpoints for problems and scores; reuse game scores API.

**Frontend:** MathMaster/LinguaPlay pages, level select, problem display, MC input, feedback, XP/badges, leaderboard. Offline: store problems per level, sync scores on reconnect.

**Testing:** Per-game flows, offline sync, bilingual, accessibility. See **TESTING_CHECKLIST.md** for manual verification.

Full task breakdown and week-by-week plan were in the original checklist; use this doc as the single entry point and expand in project management tools as needed.
