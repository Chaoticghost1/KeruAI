# Mobile-First Phone UX & Dynamic Screens — Design & Delivery Spec

Covers three flows: **Teacher Uploader**, **Student Lesson Viewer / Revision Pack**, and **AI Buddy Chat**.
All components live under `client/src/components/mobile/*`.

---

## 1. Visual tokens (style mapping)

| Token | Value | Usage |
|-------|-------|-------|
| Breakpoint `compact` | 0–639px | Phones. Stacked, bottom CTAs, thumb-zone FAB. |
| Breakpoint `comfortable` | 640–1023px | Large phone / small tablet. Pills wrap, CTA inline. |
| Breakpoint `wide` | ≥1024px | Tablet / desktop. Two-column / roomy cards. |
| Font base | 14px (compact) → 17px (wide) | `FONT_SCALE` in `tokens.ts`. |
| Tap target | min 44px (48px comfortable) | `TAP_TARGET`. All primary controls use `min-h-[44px]`. |
| Spacing | 4/8/12/16/24/32 px | `SPACING`. |
| Bottom CTA bar | `fixed inset-x-0 bottom-0 z-30` + safe-area inset | `STYLE_TOKENS.bottomCtaBar`. |
| FAB | `fixed bottom-20 right-4` (compact) → `bottom-6 right-6` (≥640) | `STYLE_TOKENS.fab`. |
| Pill | `rounded-full border bg-muted px-3 py-1 text-xs` | `STYLE_TOKENS.pill`. |
| Skeleton | `animate-pulse rounded-md bg-muted` | `STYLE_TOKENS.skeleton`. |

Theme colors come from existing CSS variables (`--primary`, `--muted`, `--youth-success`, etc.),
so components inherit light/dark + youth themes automatically.

---

## 2. Folder structure

```
client/src/components/mobile/
├── tokens.ts                 # breakpoints, spacing, font scale, tap targets, style tokens
├── useDynamicLayout.ts       # variant (compact|comfortable|wide) + safe-area insets
├── useKeyboardSafeView.ts    # keep composer above keyboard (VisualViewport + fallback)
├── TeacherUploaderForm.tsx   # FLOW 1 canonical component
├── LessonHeader.tsx          # FLOW 2 canonical component (header part)
├── AIBuddyChat.tsx           # FLOW 3 canonical component
├── SwipeToDismiss.tsx        # swipe/keyboard dismiss wrapper
├── MobileToast.tsx           # accessible success/info toast
├── index.ts                  # barrel export
└── *.test.tsx                # RTL tests (run via vitest.client.config.ts)
```

Run client tests: `npx vitest run --config vitest.client.config.ts`
(Requires dev deps: `@testing-library/react`, `@testing-library/jest-dom`,
`@testing-library/user-event`, `happy-dom` — already installed in this repo.)

---

## 3. Per-flow wireframes (3 screens each)

### Flow 1 — Teacher Uploader

**Screen A — Upload & metadata**
- Compact (360×800): full-screen form, file chooser button + "O pega el texto" textarea stacked, subject/topic/grade inputs, **bottom CTA bar** "Subir y procesar" (44px). Safe-area padding at bottom.
- Comfortable (768): inputs in 2-col grid; CTA still bottom bar but wider max-width.
- Wide (1280): centered card (max-w-2xl), grid inputs, CTA inline at form end.

**Screen B — Preview & progress**
- Compact: "Vista previa" block (filename + size or first 600 chars) above the CTA bar; while uploading a 1.5px progress track + "42% · se reanuda si se interrumpe" sits inside the CTA bar; composer stays above keyboard via `useKeyboardSafeView`.
- Comfortable/Wide: preview in a side panel; progress bar full-width under header.

**Screen C — Success**
- Compact: `MobileToast` "Material ingerido · N fragmentos" slides above CTA; success line "Material ingerido · N fragmentos" in form. `chunkCount` shown.
- Comfortable/Wide: success card replaces form with summary + "Subir otro".

### Flow 2 — Student Lesson Viewer & Revision Pack

**Screen A — Lesson header + summary**
- Compact: `LessonHeader` title + horizontal scroll of concept pills (swipe/arrow), "Repaso rápido" CTA bottom-right FAB. Summary text below, incremental reveal (read-more).
- Comfortable: pills wrap; CTA inline in header.
- Wide: two-column (summary left, revision pack list right).

**Screen B — Flashcards**
- Compact: one card centered, tap to flip, swipe left/right (`SwipeToDismiss` pattern) to navigate, progress dots. Large tap targets.
- Comfortable/Wide: 2–3 cards in a row / grid.

**Screen C — Practice**
- Compact: one question at a time, option buttons full-width 48px, instant feedback toast, "Siguiente" bottom CTA. Offline: cached pack works without network.
- Comfortable/Wide: question + sidebar with progress & weak-area list.

### Flow 3 — AI Buddy Chat

**Screen A — Conversation**
- Compact: `AIBuddyChat` full-height; messages bubble 85% width; composer pinned bottom (above keyboard); offline banner when disconnected.
- Comfortable: bubbles 75% width; inline citation sidebar toggle.
- Wide: 3-col — sources rail | chat | notes; composer still pinned.

**Screen B — Streaming answer**
- Compact: assistant bubble shows shimmer skeleton + "Escribiendo…"; tokens append incrementally; inline citation badges ("Slide 5") appear as they resolve; auto-scroll to bottom.
- Comfortable/Wide: same; larger type; citations also listed in rail.

**Screen C — Flag / follow-up**
- Compact: long-press a bot message → context menu (Simplificar / Reportar); "Simplificar" re-prompts with stepped explanation; flag sets `msg.flagged` + toast "Reportado".
- Comfortable/Wide: hover toolbar instead of long-press.

---

## 4. Component list (names, props, variants)

| Component | Key props | Variants |
|-----------|-----------|----------|
| `TeacherUploaderForm` | `onSubmit, progress?, chunkCount?, subjectOptions?, uploading?, onCancel?` | default / uploading / success |
| `LessonHeader` | `title, subtitle?, concepts?, onQuickRevision?, quickRevisionLabel?` | compact (scroll) / wide (wrap) |
| `AIBuddyChat` | `messages, onSend, onFlag?, onCitationClick?, offline?, queuedCount?, isStreaming?, onSimplify?` | online / offline / streaming |
| `SwipeToDismiss` | `onDismiss, threshold?` | — |
| `MobileToast` | `open, message, variant?, onClose?, duration?` | success / info / error |
| `useKeyboardSafeView` | `extraPadding?` | returns `{keyboardHeight, isKeyboardOpen, style}` |
| `useDynamicLayout` | — | returns `{variant, isCompact, isComfortable, isWide, width, safeAreaInset}` |

---

## 5. Interaction specs

- **One-hand:** primary action in bottom CTA bar (uploader) or bottom-right FAB (lesson/revision). Thumb-zone within 360–412px reach.
- **Swipe-to-dismiss:** `SwipeToDismiss` (pointer events, threshold 80px); keyboard equivalent = Delete/Backspace.
- **Long-press context menu:** bot messages → Simplificar / Reportar (pointer `onContextMenu`); on wide screens a hover toolbar shows instead.
- **Micro-interactions:** loading skeletons on stream start; incremental token reveal; "Simplificar / Explicar paso" affordance re-queries with a step-by-step prompt; optimistic user message render (added to list immediately, `pending` opacity until ack).
- **Keyboard safety:** `useKeyboardSafeView` uses `VisualViewport` (iOS) with resize fallback (Android); composer becomes `absolute bottom-0` + `paddingBottom` = keyboard height so it never hides behind the keyboard.

---

## 6. Offline & performance

- **Service Worker (Workbox):** pre-cache app shell + revision packs + uploaded file thumbnails.
  Strategy: `StaleWhileRevalidate` for `/api/content/sources/*` and revision packs; `CacheFirst`
  for static assets; `NetworkOnly` (queue fallback) for chat send. Example `vite.config` snippet:

  ```ts
  // vite.config.ts (excerpt)
  import { VitePWA } from "vite-plugin-pwa";
  VitePWA({
    registerType: "autoUpdate",
    workbox: {
      runtimeCaching: [
        { urlPattern: /\/api\/content\/sources\/.*/, handler: "StaleWhileRevalidate", options: { cacheName: "rag-sources" } },
        { urlPattern: /\/api\/revision\/packs\/.*/, handler: "StaleWhileRevalidate", options: { cacheName: "revision-packs" } },
      ],
    },
  });
  ```
- **Limit LLM calls offline:** `AIBuddyChat` disables composer when `offline`; unsent messages are
  queued (`queuedCount`) and flushed on `online` event. No streaming tokens requested without network.
- **Performance:** initial shell is static HTML + minimal JS; canonical components are code-split
  where mounted on routes; skeletons paint before data so first meaningful paint < 250ms on 3G.

---

## 7. Accessibility

- Contrast: rely on theme tokens (WCAG AA). Avoid pure-gray on gray.
- Tap targets ≥ 44×44 CSS px (`min-h-[44px]` on every interactive control).
- Keyboard nav: composer reachable via Tab; chat log `role="log"` `aria-live="polite"`; citation
  links are real `<button>`s with `aria-label="Fuente: Slide 5"`; progress `role="progressbar"`
  with `aria-valuenow/min/max`; toasts `role="status"`.
- Localizable labels: all visible strings are wrapped (es/en); pass via props/`useLanguage`.
- `prefers-reduced-motion`: skeletons still pulse but transitions are shortened (add
  `motion-reduce:animate-none` where needed).

---

## 8. Microcopy samples

| Context | Copy (es / en) |
|---------|----------------|
| Upload CTA | "Subir y procesar" / "Upload & process" |
| Upload progress | "42% · se reanuda si se interrumpe" / "42% · resumes if interrupted" |
| Success toast | "Material ingerido · 8 fragmentos" / "Material ingested · 8 chunks" |
| Quick revision | "Repaso rápido" / "Quick revision" |
| AI streaming | "Escribiendo…" / "Writing…" |
| AI uncertainty | "No estoy del todo seguro, pero según el material…" / "I'm not fully certain, but per the material…" |
| Citation | "Slide 5" / "Slide 5" |
| Flag | "Reportado" / "Reported" |
| Offline queue | "2 mensaje(s) en cola" / "2 message(s) queued" |
| Simplify | "Simplificar" / "Simplify" |

---

## 9. Acceptance criteria & QA checklist

**Mobile acceptance**
- [ ] Usable at 360×800 and 375×812 (no horizontal scroll, no clipped CTAs).
- [ ] Keyboard never obscures composer; composer reachable by screen reader (VoiceOver/TalkBack).
- [ ] Uploader shows file preview + `chunkCount` after upload; progress visible & resumable.
- [ ] AI buddy shows inline citations ("Slide 5") and allows flagging; streaming appends tokens.
- [ ] Initial UI shell paints < 250ms on 3G-throttled QA.

**QA checklist**
- [ ] `npx tsc --noEmit -p tsconfig.json` passes.
- [ ] `npx vitest run --config vitest.client.config.ts` → all mobile tests green (14).
- [ ] Manual: rotate 360→768→1280, confirm variant switches (compact/comfortable/wide).
- [ ] Manual: open keyboard on iOS Simulator + Android Emulator; composer stays visible.
- [ ] Manual: long-press bot message → menu; flag sets state + toast.
- [ ] Manual: toggle offline (DevTools) → composer disables, queue count shows, reconnect flushes.
- [ ] a11y: axe / VoiceOver pass on uploader, lesson header, chat.
- [ ] Perf: Lighthouse PWA offline test passes for revision packs.

---

## 10. Screenshots (text descriptions)

**Small (360×800) — AI Buddy Chat**
```
┌─────────────────────────┐
│  ← Buddy      ⋯          │
│ ┌─────────────────────┐ │
│ │ ¿Qué es una fracción?│ │ (user, right)
│ └─────────────────────┘ │
│ ┌─────────────────────┐ │
│ │ Una fracción… [Slide5]│ │ (bot, left, citation badge)
│ │            [Simplificar][⚑]│
│ └─────────────────────┘ │
│            (autoscroll ↓)│
├─────────────────────────┤
│ │ Escribe tu mensaje… │➤│ │ (composer pinned, safe-area)
└─────────────────────────┘
```

**Medium (768) — Teacher Uploader**
```
┌───────────────────────────────┐
│ Subir material                  │
│ [ Elegir archivo ]  📄 t5.pdf   │
│ O pega el texto [………………]      │
│ Materia [Matemáticas▾] Grado[ ] │
│ Tema [ Fracciones ]             │
│ Vista previa: 📄 t5.pdf (212 KB)│
├───────────────────────────────┤
│   [ Cancelar ] [ Subir 62% ]    │  ← bottom CTA bar
└───────────────────────────────┘
```

**Large (1280) — Student Lesson + Revision**
```
┌──────────────────────────────────────────────┐
│ Fracciones            [Repaso rápido]          │
│ [Suma][Resta][Equivalentes][Mixtos]  (wrap)    │
├──────────────────────┬────────────────────────┤
│ Summary text…         │ Revision Pack          │
│ (read-more reveal)    │ • Flashcard set (12)   │
│                       │ • Practice (8 qs)      │
│                       │ [ Abrir ]              │
└──────────────────────┴────────────────────────┘
```
