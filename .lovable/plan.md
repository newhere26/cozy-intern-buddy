## Cappy-style companion art + smoother scrolling

### 1. Redraw the companions in the reference style

The uploaded sheets define a clear look: premium stylized 3D, warm brown fur, navy scrubs with a small ID badge, soft lighting, natural anatomy, consistent 3/4-left angle, transparent background.

Regenerate all five companions (capybara, red panda, cow, turtle, owl) in that exact style so they read as one cast:
- Same canonical 3/4-left angle, same lighting, same navy scrubs + badge.
- Rounded, chunky proportions, gentle expression, correct limb count.
- Transparent PNG so overlays and the night lamp glow sit cleanly behind/over.

Palette taken from the sheet (fur `#7B5A3A`/`#5A3E29`, scrubs `#1E2740`/`#24385C`, badge `#E6EDF5`) so the art harmonises with the existing dark themes rather than fighting them.

### 2. Expression states instead of one static pose

The sheets show happy / proud / tired / sleeping / night-shift / concerned. Add a small set per companion and pick contextually:
- **idle** — default home screen
- **night** — night shift on: mug in paw, warm lamp light on the fur
- **proud** — shown briefly after logging a meal, water, a procedure, or a milestone

Companion.tsx gains a `mood` prop; home screen derives it from night-shift state and recent actions, falling back to idle. Existing tap-to-talk bubble stays.

### 3. Outfit progression drawn, not emoji

The sheet's progression is scrubs → +stethoscope → +white coat → +grad hat → +diploma. Replace the emoji milestone chips with painted overlay layers matched to the art (transparent PNGs registered to the same canvas), so the 3/6/9/12-month gear actually looks worn.

Shop items keep the emoji slot system (they're playful by design) but get their coordinates re-tuned against the new artwork, and shop items still take priority over a milestone on the same slot.

### 4. Idle animation

Replace the single `float-slow` bob with the sheet's calm-breathing idle: a subtle scale/translate breath cycle plus an occasional sway, all CSS, GPU-composited (`transform`/`opacity` only), respecting `prefers-reduced-motion`.

### 5. Scrolling performance

Concrete fixes, in order of impact:
- **Remove layout-thrashing effects on scrolling surfaces** — audit `blur`/`backdrop-blur`/large `box-shadow` inside scroll containers (calendar postings list, journal entries, procedure list); these repaint every frame on mobile.
- **Contain repaints** — add `content-visibility: auto` + `contain: layout paint` to repeated list rows so offscreen rows skip rendering.
- **`overscroll-behavior: contain` + `-webkit-overflow-scrolling: touch`** on the postings/journal/procedure scrollers so nested scrolls don't chain and rubber-band.
- **Stop re-subscribing the whole app on every scroll** — the `useApp` store publishes the entire state object; components that only need a slice re-render on any change. Add a selector-based `useApp(selector)` overload so tiles subscribe narrowly.
- **Memoize row components** and give lists stable keys so React doesn't rebuild rows during scroll.
- **Decode images off the main thread** — `decoding="async"` + explicit dimensions on the companion image to prevent layout shift on route entry.

### Technical notes

- Art generated via imagegen at transparent-PNG, then referenced through `src/lib/data.ts` as today; milestone overlay layers live alongside in `src/assets/companions/gear/`.
- `Companion.tsx` refactored to layer: lamp glow → base pose (by mood) → milestone gear layers → shop emoji slots.
- Store changes limited to nothing new; mood is derived, not persisted.

### Files touched

- `src/assets/companions/*` — regenerated art + gear layers
- `src/lib/data.ts` — new asset references, per-mood pose map
- `src/components/Companion.tsx` — mood prop, layered rendering, breathing idle
- `src/routes/index.tsx` — derive mood
- `src/styles.css` — breathing keyframes, scroll containment utilities
- `src/lib/store.ts` — selector-based subscription
- `src/routes/calendar.tsx`, `journal.tsx`, `journey.tsx` — memoized rows, scroll containment
