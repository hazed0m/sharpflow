# SharpFlow Architecture, Product Approach, and Roadmap

## 1. Current Implementation Review

### What is already aligned with the product vision

- **Single-task focus UI**: `FocusScreen` shows one active task, a timer, and limited actions (Done / Skip / Extend).
- **Minimal queue**: the store keeps up to 5 actionable tasks and blocks adding beyond that.
- **Task quality enforcement**: `TaskInput` uses `taskRules.ts` to validate that tasks are concrete and not vague.
- **Ash mode**: skipped or timed-out tasks move into an `ash` state for behavioral feedback.
- **Memory Box**: private notes/ reflections are stored locally in the app.
- **Visual/emotional design**: a simple character system and prompt state help deliver motivational messaging without clutter.
- **Security-conscious frontend**: the app uses React best practices and avoids unnecessary data exposure.
- **Low-cost architecture**: the default path uses local storage and client-side state, with Supabase only optional.

### What is already built in the codebase

- `src/store/useSharpFlowStore.ts`: Zustand-based app state for tasks, ash, memories, mood, and prompts.
- `src/features/auth/AuthGate.tsx`: sign-in gate with Supabase email login and Google OAuth.
- `src/features/focus/FocusScreen.tsx`: main experience with timer, task controls, and emotional feedback.
- `src/components/TaskInput.tsx`: task capture form with validation and user guidance.
- `src/components/Timer.tsx`: countdown timer with complete / burn handling.
- `src/components/AshAnimation.tsx`: lightweight burn feedback animation.
- `src/features/memory/MemoryBox.tsx`: private memory capture panel.
- `src/services/supabase.ts`: Supabase client wrapper with auth helpers.

## 2. Correctness Check Against Requirements

### Requirements covered

- **Vite + React + TypeScript**: yes.
- **Tailwind styling**: yes, Tailwind is configured and used.
- **State management**: Zustand is used, which is lightweight and appropriate.
- **Auth flow**: implemented email sign-in + Google sign-in, plus guest fallback.
- **Single task focus screen**: implemented.
- **Limited queue**: enforced at 5 tasks.
- **Task input validation**: implemented with behavioral rules.
- **Memory Box**: implemented.
- **Ash / burn state**: implemented.
- **Character reactions**: implemented through mood/prompt states.
- **Low server cost orientation**: yes, client-side-first with Supabase optional.

### Requirements not fully complete yet

- **Persistent backend storage of tasks/memories**: currently the app still uses browser storage by default.
- **Secure database encryption**: not yet implemented in backend schema or storage layer.
- **Admin panel**: not yet built.
- **Register flow**: current auth uses email magic link and Google OAuth, but no separate registration screen.
- **Module creation and admin content management**: missing.
- **Behavioral analytics/ash dashboard**: missing.
- **Task persistence with server-side user binding**: not yet complete.
- **CSRF/XSS hardening in backend**: still needs server-side validation and security review.

## 3. Design and Product Approach

### Core design principles

- **Behavior over features**: the product is intentionally not a dashboard. It is a behavior trainer focused on a single next action.
- **Urgency through visual rhythm**: the timer, warm gradients, and a small queue create mental pressure without chaos.
- **Safety through simplicity**: Memory Box is a quiet, private zone separate from active tasks.
- **Character-led guidance**: the app uses emotional microcopy and a character mood system rather than heavy animations.
- **Dark-first aesthetic**: reduces distraction and supports emotional focus.

### Product positioning

SharpFlow is best positioned as a **procrastination training tool** rather than a task manager. The messaging should emphasize:

- "Not another list; one clear next step."
- "Turn fuzzy ideas into an action you can start now."
- "If you delay, the task burns — the app helps you learn from missed steps."
- "Private reflections keep you honest without clutter."

### UX rationale

- Avoid multi-column dashboards.
- Keep choices tight: add a task, start the timer, complete/skip/extend.
- Use prompts to reframe procrastination: the product is about action, not perfection.
- Limit queue size to reduce overwhelm and enforce intention.

## 4. Marketing Positioning

### Target audience

- Creators and knowledge workers who overthink decisions.
- People who want a lean accountability tool without heavy project management.
- Users who respond to behavior nudges and emotional support.

### Key value propositions

- "SharpFlow turns procrastination into your training signal."
- "See one task, start now, learn from the ones that burn."
- "Your private focus ritual with a safe memory box for wins and insights."
- "Low-friction sign-in, no bloated dashboard, no infinite list."

### Launch messaging

- "From messy thinking to one clear next step."
- "Use SharpFlow when you have one tough thing to get started on."
- "A small task queue, a timer, and a gentle character to keep you honest."

## 5. Optimization Opportunities

### Technical optimizations

- **Lazy-load non-critical features**: the `MemoryBox` and character UI can be code-split.
- **Limit bundle size**: keep animation use minimal, use `framer-motion` only where needed.
- **Use SVG assets** for illustrations rather than images.
- **Remove unused code** from the starter template and avoid heavy dependencies.
- **Make Supabase optional** by gating it in `AuthGate`, which keeps the app usable cheaply.

### Architecture optimizations

- **Move task persistence to Supabase** once you finalize schema, but keep local fallback.
- **Use RLS at the database layer** so authenticated user data is secure.
- **Keep UI and data layers separated**: `features/*` for screens, `components/*` for shared UI, `services/*` for backend integration.
- **Add a small analytics summary** that is computed client-side from `ash.length`, `task completion ratio`, and `memory counts`.

## 6. Future updates and roadmap

### Immediate next steps

1. **Add remote storage**
   - Persist tasks, ash items, and memories to Supabase.
   - Bind items to the authenticated user.
   - Keep localStorage as an offline cache/fallback.

2. **Add registration flow**
   - Offer email + password or continue magic-link.
   - Add a clear onboarding prompt for first-time users.

3. **Build the admin module**
   - Create a separate admin route (`/admin`).
   - Add admin pages for:
     - content modules
     - behavior prompts
     - analytics summaries
   - Use Supabase row-level security so only admin users can access this panel.

4. **Add lightweight analytics**
   - Show `tasks completed`, `tasks burned`, `memory entries saved`, and `average focus cycle length`.
   - Keep analytics subtle and supportive, not judgmental.

### Mid-term expansion

- **Module system**
  - Admins can create learning or coaching modules.
  - Modules can unlock new prompt sets, focus rituals, or personalized nudges.
  - Modules should remain optional and not convert the app into a full LMS.

- **Behavioral module ideas**
  - `Quick Start`: 20-minute sprints for immediate momentum.
  - `Recovery`: when a task burns, recommend a reflective reset.
  - `Win streak`: celebrate when the user completes 3 tasks in a row.

- **Mobile-first refinements**
  - make UI more compact on small screens.
  - ensure timer and task input remain the top priority.

### Longer-term product goals

- **Cross-device sync** with Supabase user data.
- **Smart task rewriting**: offer a lightweight assistant to help rewrite vague inputs into next actions.
- **Habit-based reminders**: remind users to open SharpFlow when they have a low-energy block.

## 7. Login / Register / Admin Panel Strategy

### Login and register

- Current flow supports email magic-link and Google OAuth.
- This is strong for low-cost and secure access.
- For a full register flow:
  - add an email/password fallback.
  - save a simple profile object in Supabase.
  - keep registration lightweight and optional.

### Admin panel design

- Add a new workspace section under `src/features/admin`.
- Keep the admin UI minimal: list modules, edit prompts, and review ash analytics.
- Use a protected route or a special admin flag in Supabase user metadata.
- Example admin capabilities:
  - create / edit training modules
  - update prompt copy and behavior flows
  - view aggregate `burn` and `complete` stats

### Module creation

- Modules should be data-driven content bundles that can be enabled or disabled.
- Start with simple items:
  - `name`
  - `description`
  - `prompt set`
  - `focus ritual style`
- In the UI, modules can control the active prompt/character tone and task guidance text.

## 8. Recommended file / feature structure for next phase

- `src/features/admin/AdminPanel.tsx`
- `src/features/admin/ModuleEditor.tsx`
- `src/features/admin/AnalyticsSummary.tsx`
- `src/services/supabase-admin.ts` (for admin-only data access)
- `src/lib/validation.ts` (server-safe validation for tasks and memories)
- `src/data/modules.ts` or Supabase `modules` table

## 9. Summary

The current SharpFlow scaffold is a strong base for a behavior-driven focus product. It already matches the core MVP concept: one clear task, a short queue, emotional design, and a private memory space.

The main areas to complete next are:

- remote persistence and user-specific storage,
- admin module management,
- a registration flow,
- stronger backend security,
- and a subtle analytics layer.

This architecture is well positioned to scale without overbuilding — keep the core flow thin, add only a few server-backed features, and preserve the lightweight, low-cost direction.
