# Remove "Bedside helper" from all tool tiles

## Goal
Remove the "Bedside helper" label text from every tool tile in the Clinical Bedside Tools page.

## Current state
`src/routes/tools.tsx` renders the `BentoTile` component for each tool. The `BentoTile` component contains a footer div that displays two pieces of text:
1. "Bedside helper" — a static label.
2. "Tap to open →" — a call to action.

The selected element in the preview is the "Bedside helper" span at line 137.

## Plan
1. Edit the `BentoTile` component in `src/routes/tools.tsx` to remove the static "Bedside helper" span.
2. Keep the "Tap to open →" call to action on the right side.
3. Verify the change in the preview so every tool tile no longer shows "Bedside helper".

## Files to modify
- `src/routes/tools.tsx` (lines 136-139)

## Expected result
Every tool tile will show only the icon, title, blurb, and "Tap to open →" footer, without the "Bedside helper" label.