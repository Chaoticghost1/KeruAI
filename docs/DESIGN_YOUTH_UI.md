# Youth-Oriented UI Design System

This document describes the design tokens and patterns used for the youth-focused UI across StudyBuddy, Dashboard, and Landing.

## Design Tokens (CSS Variables)

Defined in `client/src/index.css`:

| Token | Value | Use |
|-------|-------|-----|
| `--youth-primary` | Purple (262, 83%, 58%) | Primary actions, level, headings |
| `--youth-accent` | Teal (173, 58%, 45%) | Secondary actions, points, travel |
| `--youth-success` | Green (142, 71%, 42%) | Streaks, success, checkmarks |
| `--youth-surface` | Soft purple-tinted (260, 30%, 98%) | Page/card backgrounds |
| `--youth-muted` | Light purple (260, 15%, 92%) | Borders, progress track |
| `--radius-lg` | 0.875rem | Card and button border radius |

*Note: Dark mode is not supported per PRD; light theme only.*

## Tailwind Usage

- **Colors:** `text-youth-primary`, `bg-youth-primary`, `border-youth-accent`, etc.
- **Radius:** `rounded-youth-lg` for cards and primary buttons.
- **Utility classes:** `youth-card`, `youth-progress-bar`, `youth-progress-fill` (see `index.css`).

## Typography

- **Font stack:** `Plus Jakarta Sans`, `Inter`, `system-ui`, sans-serif (loaded in `client/index.html`).
- Headings use bolder weights; body uses default scale.

## Accessibility

- **Focus:** Visible focus ring on buttons and links via `:focus-visible` (2px outline using `--ring` or `--youth-primary`).
- **Reduced motion:** `@media (prefers-reduced-motion: reduce)` disables progress bar transition and hover transforms on cards.

## Page layout (shared)

Use the **`PageLayout`** component (`client/src/components/PageLayout.tsx`) for all app routes so the same UI/UX feeling is consistent:

- **Outer:** `min-h-screen bg-youth-surface`
- **Inner:** Centered content with `max-w-6xl` (default) or `max-w-7xl` and consistent padding `px-4 sm:px-6 lg:px-8 py-6`

Example: `<PageLayout maxWidth="7xl">{children}</PageLayout>`. Pages with a full-width sticky header can break out of padding using `-mx-4 sm:-mx-6 lg:-mx-8 -mt-6` on the header and re-apply horizontal padding inside it.

## Where Applied

- **StudyBuddy:** Uses `PageLayout`; progress block (level, XP bar, streaks, points), badges (rarity tint, larger tap targets), agent cards, session setup.
- **Dashboard:** Uses `PageLayout maxWidth="7xl"`; hero, feature cards (Study with AI, BudgetPal, Travel), student quick-stats (level, streak, points, profile link), Quick Stats cards.
- **Blog:** Uses `PageLayout` and youth tokens (replaced blue-cyan gradient with `bg-youth-surface`, `text-foreground`, `text-muted-foreground`, `rounded-youth-lg`, primary buttons).
- **MentorshipHub, BudgetPal, StudentRevision:** Use `PageLayout maxWidth="7xl"`; orbs use youth tokens for consistency.
- **Landing:** Hero, nav, CTA buttons, first feature card (StudyBuddy).
- **Student Profile page:** Card and form use standard components; can use `rounded-youth-lg` and youth colors for consistency.

## Gamification Cues

- Level and XP use `youth-primary`; progress bar uses gradient (primary → accent).
- Streaks use `youth-success`; points use `youth-accent`.
- Badges have rarity-based background tints (common, rare, epic, legendary).
- Cards use `rounded-youth-lg` and subtle borders for a modern, tactile feel.
