---
name: pixel-mascot-deck
description: >-
  Build a .pptx deck in the pixel-mascot style: white minimal pages, one colour per part, a pixel-art mascot
  drawn for THIS deck's topic that changes pose per part, Lucide icons in part-colour circles, grey "copy this"
  prompt chips, a mascot tip bubble on most pages, and 19 ready page arrangements (cards, tiles, rows, swatches,
  frames, flow, grid, demo pages). Use when the user asks for a deck/簡報/PPT "in the pixel mascot style",
  "像素吉祥物簡報", "上次那種簡報風格", "pixel 風格簡報", or wants a talk / workshop / sharing-session deck with
  a mascot. Not for HTML slide decks (frontend-slides, guizang-ppt-skill) or editing an existing .pptx
  template (anthropic-skills:pptx).
---

# Pixel-mascot deck

**Requirements:** Node ≥ 22.18. The [pxl-pixel-art](https://github.com/crsolver/claude-pxl) skill draws the
mascot; the commands below assume it lives at `~/.agents/skills/pxl-pixel-art`, so adjust the path if it's
elsewhere. The check script needs macOS with Keynote and `pdftoppm` (poppler); python3 with Pillow is
optional, for the contact sheets. `<skill>` below means this skill's folder.

A deck is a `deck.js` built on `kit/deck-kit.js` (pptxgenjs), plus pixel mascot poses drawn with
`pxl-pixel-art`. Read `references/style.md` (colours, type, grid, rules, page catalogue) and look at
`references/layouts-1..4.jpg` before planning.

**The mascot is new for every deck.** It is drawn from the topic: the product, the brand logo, or a
character the user names. Never reuse a previous deck's mascot. The `?` block in `mascot/` is only a
placeholder.

## Workflow

1. **Collect.** Gather the source content (PDF, notes), the talk length, the audience, and a reference
   image for the mascot. Ask for the image if none was given. If there is a brand, take 3 part colours
   from its logo; otherwise keep coral / lavender / mint.
2. **Set up the project** (≈2 min):
   ```bash
   mkdir -p ~/Developer/<deck> && cd ~/Developer/<deck>
   npm init -y >/dev/null && npm i pptxgenjs react-icons react react-dom sharp jszip
   cp <skill>/kit/deck-kit.js . && cp <skill>/kit/example.js deck.js
   mkdir assets && cp <skill>/mascot/mascot.px.js assets/
   ```
   The kit copied into the project is that deck's snapshot. Improvements to the style go back into
   `<skill>/kit/` so future decks get them.
3. **Draw the mascot.** In `assets/mascot.px.js`, replace the `_mascot` sprite with a pixel version of
   the reference.
   - Stay inside 32×32, use 2–3 tones plus an outline, and keep the silhouette simple.
   - The pose sprites (camera, board, wrench, live) stamp `_mascot` and add a prop on the right. Keep
     the props that fit the talk, and add topic props in the same way.
   - Build and look at it, then upscale:
     ```bash
     node ~/.agents/skills/pxl-pixel-art/bin/pxl.js build assets/mascot.px.js
     NODE_PATH=$PWD/node_modules node <skill>/scripts/upscale.js assets/out/sprites assets
     ```
   - Read `assets/out/_preview/*.png` and fix the sprites until the mascot reads as the reference.
4. **Outline.** Plan slides × minutes (about 1.5–2 min per slide), group them into parts with one colour
   each, and give each part a divider and a mascot pose. Pick one `L.*` arrangement per slide from the
   catalogue and vary them. Share the outline and timing with the user before building.
5. **Show samples first.** Build only 3 slides (the cover, one divider, one dense content slide), render
   them (step 7), and get the user's OK on the look before building the rest.
6. **Build everything.** In `deck.js`:
   - `kit.start({ title, header, colors?, mascots })`
   - `h.section()` before each part's first slide
   - `L.*` for each page, `h.tip()` on most content pages
   - `s.addNotes("（約 N 分鐘）…")` on every page, with the full prompts in the demo-page notes
   - end with `await finish("<name>.pptx")`

   Run with `NODE_PATH=$PWD/node_modules node deck.js`.
7. **Check.**
   - Run the pptx skill's `scripts/office/validate.py <deck>.pptx` if that skill is installed.
   - Then run `<skill>/scripts/keynote_qa.sh <deck>.pptx qa` and read every `qa/sheet*.jpg`.
   - Fix overflow by shortening text, moving a row, or splitting the slide. Never shrink type below the
     sizes in style.md. Re-render after the fixes.
8. **Deliver.** Hand over the .pptx plus the Keynote PDF preview. Say what stays unchecked, for example
   that the deck has not been opened in real PowerPoint or on Windows.

## Kit API in one screen

```js
const kit = require("./deck-kit");
const { P, h, L, finish } = kit.start({ title, header, colors: { accent1, accent2, accent3 }, mascots: { idle, camera, board, ... } });
const sec = h.section("第一部分");
L.divider(sec, { color: P[0], part, title, line, contents, mins, form: "camera", notes });
const s = h.content(sec, "頁面標題");  h.sub(s, "副標題");
await L.cards3(s, [...]);              // or tiles4, options3, rows, swatches5, sequence4, flow4, lists3, grid ...
h.tip(s, "一句提示");  s.addNotes("（約 2 分鐘）…");
L.demo(sec, { label, title, subtitle, note, steps: [[1, "步驟", "細節"]], accent: P[0], notes });
await finish("deck.pptx");
```

Lower-level pieces live on `h`: `T`, `chip`, `badge`, `numDot`, `card`, `rule`, `tags`, `steps`, `mascot`,
`arrow` and `tipTop`. Use them for a one-off page. If a one-off arrangement gets reused, add it to the kit
as a new `L.*` function.

## Files

- `kit/deck-kit.js`: the theme, 4 layouts (COVER, DIVIDER, CONTENT, DEMO), the `h` pieces and the `L`
  arrangements.
- `kit/example.js`: one slide per arrangement. Copy it as the starting `deck.js`.
- `mascot/mascot.px.js`: the placeholder mascot and pose props; the `@16.png` files are its upscaled poses.
- `scripts/upscale.js`: nearest-neighbour ×16 upscale, so PowerPoint never blurs the pixels.
- `scripts/keynote_qa.sh`: renders the deck through Keynote to PDF, page JPGs and 6-up contact sheets.
- `references/style.md`: the style rules and catalogue; `references/layouts-*.jpg` show every arrangement.
