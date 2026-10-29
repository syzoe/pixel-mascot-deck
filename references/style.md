# Pixel-mascot deck — style reference

Canvas is 16:9 at 10 × 5.625 in. All numbers below are in inches unless they say pt.

## Colour

| Role | Hex | Scheme slot | Used for |
|---|---|---|---|
| Background | `FFFFFF` | lt1 / `C.background1` | content pages |
| Ink | `161616` | dk1 / `C.text1` | titles, body text, demo-page background |
| Muted | `6B6B6B` | dk2 / `C.text2` | subtitles, labels, secondary text |
| Card | `F3F3F1` | lt2 / `C.background2` | cards, chips, tip bubble |
| Hairline | `E4E4E2` | accent4 | table rules, flow arrows, text on the black page |
| Part 1 | `F2604F` coral | accent1 / `P[0]` | everything in part 1 |
| Part 2 | `8F6FE8` lavender | accent2 / `P[1]` | everything in part 2 |
| Part 3+ | `2FB98A` mint | accent3 / `P[2]` | parts 3 and later |

- **One colour per part.** A part's divider, icon circles, number dots and formula pills all use that part's colour. Colour tells the audience where they are, so never mix two part colours on one content page.
- **Brand colours.** When the topic has a brand, swap `colors.accent1–3` in `kit.start()` for colours taken from its logo or reference image. Keep the neutrals.
- **Illustration colours.** Swatch blocks and mock previews may use any hex, because they illustrate content rather than form part of the theme.

## Type

- **Font.** PingFang TC for everything. Every Mac has it; Windows PowerPoint substitutes another font, so check there if the deck will run on Windows.

| Text | Size |
|---|---|
| Divider title | 60pt bold |
| Demo title | 48pt bold |
| Cover title | 40pt bold |
| Content title | 30pt bold, left-aligned |
| Subtitle | 14pt (13pt when it runs to 2 lines) |
| Tip bubble | 13pt |
| Card head | 15–20pt bold |
| Body | 11–12.5pt |
| Labels | 10–11pt |
| Header and page number | 9pt |

- **Sizing rule.** At N pt, a CJK character is about N/72 in wide. A 4 in box at 12pt holds about 24 characters per line. Use `tw(text, pt)` to estimate.

## Grid

- **Margins.** 0.5 left and right, so content runs x 0.5 → 9.5. Three columns are 2.9 wide with a 0.15 gap (x = 0.5 + i × 3.05). Two columns are 4.4 wide, at x 0.5 and 5.1.
- **Vertical positions.**
  - Header: y 0.18.
  - Title: y 0.42 (height 0.6).
  - Subtitle: y 1.05.
  - Body: y 1.2 → 4.6.
  - Tip bubble: bottom edge at 5.14 (0.42 tall, or 0.66 for two lines). Use `h.tipTop(text)` to find where the body must stop.
- **Shapes.** Cards have corner radius 0.12. Chips have radius 0.08. Pills and the tip bubble are fully rounded.

## Motifs

1. **Pixel mascot.** Drawn per deck from the topic (see SKILL.md). Each part gets a pose that holds a prop: camera, board, wrench, LIVE, or a new prop made for the topic. Where it appears:
   - Big on dividers and the cover (when there is no photo).
   - Small in the tip bubble and the cover mark.
   - Top-right of "fix it" pages.
   - On the dark backdrop of demo pages.
2. **Grey chip = something to copy.** Prompts go in chips, inside 「」, with placeholders written as 【】.
3. **Tip bubble.** Mascot plus a grey pill holding one sentence, at the bottom of most content pages. Keep it to one idea; it may run to two lines.
4. **Lucide icons** (react-icons/lu) are drawn white inside circles of the part colour.
5. **Number dots.** Steps are numbered in part-colour dots.

## Rules

- One message per page. Plan about 1.5–2 minutes per page in a live talk.
- At most 6 rows or steps on a page, and 3–5 cards. If it doesn't fit, split it into two pages rather than shrinking the type.
- Every page has a visual: mascot, icons, frames, swatches or cards. No plain bullet pages.
- No accent bars, no gradients, no drop shadows (the only shadow is the soft oval under a mascot).
- Speaker notes on every page, starting with the time, e.g. `（約 2 分鐘）`. Demo pages carry the full prompts in paste order.
- Don't invent facts. Caveats from the source stay in, and general tips must not claim product features.

## Page arrangements (`L.*`)

Pictures of each: `layouts-1.jpg` … `layouts-4.jpg`. The function name is in each example page's title, and `kit/example.js` has the call for each.

| Function | Looks like | Use for |
|---|---|---|
| `L.cover` | title left; photo half-bleed right, or the big mascot | opening |
| `L.divider` | full part colour, big mascot pose, contents line, time pill | start of each part |
| `L.demo` | black page, title left, numbered steps right, LIVE mascot | live demos |
| `L.cards3` | 3 cards: icon, small label, big 2-line head, description | outcomes, agenda, 3 takeaways |
| `L.panels2` | 2 panels with a mascot header + tags, or an icon header + steps | A vs B, two ways to do something |
| `L.tiles4` | 4 stat tiles: big value, rule, "how to change" | specs, defaults, key numbers |
| `L.options3` | 3 lettered option cards with fields + example chip | "pick one way to start" |
| `L.steps2col` | 6 numbered steps in 2 columns | a how-to procedure |
| `L.formula` | formula pills; template chip; ✗ vague vs ✓ good | prompt or recipe formulas |
| `L.rows` | table rows: icon · name · chip · (fit) | 5–6 variants or fixes; two-column version for "problem → say this" |
| `L.swatches5` | 5 cards with colour blocks on top + chip | moods, styles, themes |
| `L.frames3` | 3 aspect-ratio frames with captions | formats, platforms, screens |
| `L.sequence4` | 4 key frames with arrows + prompt chip + caveat | ordered stories, before → after |
| `L.flow4` | 4 big icon circles joined by arrows | a process overview |
| `L.stepsChips` | compact steps on the left, stacked example chips on the right | steps where 1–2 steps need a full prompt |
| `L.lists3` | 3 cards each with a numbered list | outlines, templates, menus |
| `L.choicesSteps` | decision cards on the left, numbered setup on the right | "which one?" + one-time setup |
| `L.promptChain` | one big prompt chip + a vertical chain of icon steps | an all-in-one prompt |
| `L.grid` | label column + 3 icon-headed columns | adapting to industries or audiences |

For the two-column version of `L.rows`, drop the 4th field and pass `nameW: 2.65, nameSize: 14, chipX: 3.8, chipW: 5.7, rh: 0.5, y0: 1.72`.

## Pitfalls already hit

- **LibreOffice drops CJK text on macOS.** Check renders through Keynote (`scripts/keynote_qa.sh`).
- **Keynote quits when its last document closes.** The script runs `open -ga Keynote` first; otherwise AppleScript fails with -600.
- **Keynote draws `→` full-width,** so lines with arrows wrap earlier than `tw()` predicts. Leave slack.
- **pptxgenjs writes Office's colour palette.** `finish()` replaces it and sets the East Asian theme font. Always end with `finish()`, not `pres.writeFile()`.
- **Text boxes don't clip.** Overflow shows only in the render, so look at every page.
