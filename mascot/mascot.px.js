// Pixel mascot + pose props for a pixel-mascot deck.
// Replace `_mascot` with a pixel version of THIS deck's topic (logo, product, character) —
// keep it inside 32x32 so the props below still land beside it. The placeholder is a grey
// block with a "?" so it can never ship by accident.
pal({
  k: "#161616", K: "#2c2c2c",            // outline / dark body + highlight
  w: "#ffffff", W: "#e6e6e6", v: "#cfcfcf", // light -> shade
  g: "#5a5a5a", G: "#8a8a8a",            // prop metal / body
  l: "#9fd3ff",                          // lens glint
  r: "#ff5a4e",                          // REC / LIVE red
  p: "#8F6FE8", m: "#2FB98A", o: "#F2604F", // part colours (chart bars on the board)
  q: "#b8b8b4",                          // placeholder body
})

// rounded rect helper
const rr = (c, x, y, w, h, r, col) => {
  c.rect(x + r, y, w - 2 * r, h, col)
  c.rect(x, y + r, w, h - 2 * r, col)
  for (const [cx, cy] of [[x + r, y + r], [x + w - 1 - r, y + r], [x + r, y + h - 1 - r], [x + w - 1 - r, y + h - 1 - r]])
    c.circ(cx, cy, r, col)
}

// ---- the mascot: REPLACE THIS SPRITE per deck ----
sprite("_mascot", { w: 32, h: 32 },
  (c) => {
    rr(c, 0, 0, 32, 32, 6, "q")
    c.text(10, 8, "?", "w", { scale: 3 })
  })

// ---- poses: same mascot + a prop on the right. Reuse as-is for any mascot. ----
sprite("mascot_idle", { w: 32, h: 32 }, stamp("_mascot", 0, 0))

// video / filming
sprite("mascot_camera", { w: 46, h: 34 },
  stamp("_mascot", 0, 2),
  (c) => {
    rr(c, 26, 16, 14, 11, 2, "g")
    c.rect(26, 16, 14, 2, "G")
    c.poly([40, 18, 45, 15, 45, 28, 40, 25], "g")              // lens hood
    c.circ(31, 22, 3, "k"); c.px(30, 21, "l")
    c.rect(28, 13, 5, 3, "G")                                  // viewfinder
    c.px(37, 18, "r")
  })

// presenting / slides / reports
sprite("mascot_board", { w: 57, h: 34 },
  stamp("_mascot", 0, 2),
  (c) => {
    c.line(39, 21, 36, 33, "g", 2); c.line(52, 21, 55, 33, "g", 2)   // easel legs
    c.line(45, 21, 45, 31, "g", 2)
    rr(c, 34, 2, 22, 19, 2, "k")                                    // board frame
    c.rect(36, 4, 18, 15, "w")
    c.rect(38, 13, 3, 4, "p"); c.rect(42, 10, 3, 7, "m"); c.rect(46, 7, 3, 10, "o")
    c.rect(38, 5, 8, 1, "v")                                        // title line
    c.line(24, 22, 38, 12, "G", 1)                                  // pointer
  })

// fixing / troubleshooting
sprite("mascot_wrench", { w: 48, h: 34 },
  stamp("_mascot", 0, 2),
  (c) => {
    c.line(28, 31, 39, 17, "G", 3)
    c.circ(41, 13, 5, "G")
    c.rect(40, 7, 3, 6, "_")                                        // jaw opening
    c.px(38, 12, "w"); c.px(39, 11, "w")
  })

// live demo
sprite("mascot_live", { w: 55, h: 34 },
  stamp("_mascot", 0, 2),
  (c) => {
    rr(c, 34, 0, 21, 11, 3, "r")
    c.text(37, 3, "LIVE", "w")
    c.px(32, 3, "r"); c.px(31, 1, "r"); c.px(32, 7, "r")             // signal ticks
  })
