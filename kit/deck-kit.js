// deck-kit.js — the pixel-mascot deck style for pptxgenjs.
// White minimal pages, one colour per part, a pixel mascot that changes pose per part,
// grey prompt chips, and a mascot tip bubble. Rules: ../references/style.md
//
//   const kit = require("./deck-kit");
//   const { pres, C, P, h, L, finish } = kit.start({ title, header, mascots: { idle: "mascot_idle@16.png", ... } });
//   const sec = h.section("第一部分");
//   await L.divider(sec, { ... });
//   const s = h.content(sec, "頁面標題"); await L.cards3(s, [...]); h.tip(s, "..."); s.addNotes("...");
//   await finish("deck.pptx");
//
// Needs pptxgenjs, react-icons, react, react-dom, sharp, jszip in the deck project's node_modules;
// run with NODE_PATH=$PWD/node_modules so this file can find them.
const fs = require("fs");
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const lu = require("react-icons/lu");
const JSZip = require("jszip");

const DEFAULT_COLORS = {
  dk1: "161616", lt1: "FFFFFF", dk2: "6B6B6B", lt2: "F3F3F1", // ink, white, muted text, card grey
  accent1: "F2604F", accent2: "8F6FE8", accent3: "2FB98A",     // part colours: coral, lavender, mint
  accent4: "E4E4E2",                                            // hairlines
  accent5: "161616", accent6: "6B6B6B", hlink: "161616", folHlink: "6B6B6B",
};
const SLOTS = ["dk1", "lt1", "dk2", "lt2", "accent1", "accent2", "accent3", "accent4", "accent5", "accent6", "hlink", "folHlink"];

const icons = {};
async function icon(name, color = "#FFFFFF") {
  if (!lu[name]) throw new Error(`react-icons/lu has no icon "${name}" (browse https://lucide.dev/icons, prefix Lu + PascalCase)`);
  const k = name + color;
  if (!icons[k]) {
    const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(lu[name], { color, size: 256 }));
    icons[k] = "image/png;base64," + (await sharp(Buffer.from(svg)).png().toBuffer()).toString("base64");
  }
  return icons[k];
}

// rough rendered width in inches: CJK = 1em, Latin/digits ≈ 0.55em
const tw = (s, pt) => [...s].reduce((a, ch) => a + (ch.codePointAt(0) > 0x2e7f ? 1 : 0.55), 0) * pt / 72;
const pngRatio = (p) => { const b = fs.readFileSync(p); return b.readUInt32BE(16) / b.readUInt32BE(20); };

function start({ title = "", header = "", font = "PingFang TC", colors = {}, mascots, themeName = "Pixel Mascot" }) {
  if (!mascots || !mascots.idle) throw new Error("start({ mascots: { idle: 'path.png', ... } }) — idle is required (it is the tip-bubble mascot)");
  const COL = { ...DEFAULT_COLORS, ...colors };
  const MASCOT = Object.fromEntries(Object.entries(mascots).map(([k, p]) => [k, [p, pngRatio(p)]]));

  const pres = new pptxgen();
  pres.layout = "LAYOUT_16x9"; // 10 x 5.625 in
  pres.theme = { headFontFace: font, bodyFontFace: font };
  pres.title = title;
  const C = pres.SchemeColor;
  const P = [C.accent1, C.accent2, C.accent3]; // one colour per part

  // ---------- layouts ----------
  const headerObj = (color) => ({ text: { text: header, options: { x: 0.5, y: 0.18, w: 6, h: 0.25, fontSize: 9, color, margin: 0 } } });
  const pageNo = (color) => ({ x: 8.9, y: 0.18, w: 0.6, h: 0.25, fontSize: 9, color, align: "right", margin: 0 });
  const titlePh = (o) => ({ placeholder: { options: { name: "title", type: "title", align: "left", bold: true, valign: "top", margin: 0, ...o }, text: "" } });
  pres.defineSlideMaster({ title: "COVER", background: { color: C.background1 }, objects: [titlePh({ x: 0.5, y: 1.25, w: 4.6, h: 2.3, fontSize: 40, color: C.text1, lineSpacingMultiple: 1.1 })] });
  pres.defineSlideMaster({ title: "DIVIDER", objects: [headerObj(C.text1), titlePh({ x: 0.6, y: 1.55, w: 4.8, h: 1.0, fontSize: 60, color: C.text1 })], slideNumber: pageNo(C.text1) });
  pres.defineSlideMaster({ title: "CONTENT", background: { color: C.background1 }, objects: [headerObj(C.text2), titlePh({ x: 0.5, y: 0.42, w: 9, h: 0.6, fontSize: 30, color: C.text1 })], slideNumber: pageNo(C.text2) });
  pres.defineSlideMaster({ title: "DEMO", background: { color: C.text1 }, objects: [headerObj(C.accent4), titlePh({ x: 0.6, y: 1.25, w: 4.3, h: 0.9, fontSize: 48, color: C.background1 })], slideNumber: pageNo(C.accent4) });

  // =====================================================================
  // h — reusable pieces
  // =====================================================================
  const h = {};
  h.section = (t) => { pres.addSection({ title: t }); return t; };
  h.slide = (layout, sec) => pres.addSlide({ masterName: layout, sectionTitle: sec });
  h.content = (sec, t) => { const s = h.slide("CONTENT", sec); s.addText(t, { placeholder: "title" }); return s; };
  h.T = (s, text, o) => s.addText(text, { margin: 0, isTextBox: true, color: C.text1, ...o });
  h.sub = (s, text, o = {}) => h.T(s, text, { x: 0.5, y: 1.05, w: 9, h: 0.3, fontSize: 14, color: C.text2, ...o });
  h.mascot = (s, form, x, y, hh, name) => {
    if (!MASCOT[form]) throw new Error(`no mascot pose "${form}" (have: ${Object.keys(MASCOT).join(", ")})`);
    const [p, r] = MASCOT[form];
    s.addImage({ path: p, x, y, w: hh * r, h: hh, objectName: name || `Mascot ${form}` });
    return hh * r;
  };
  h.mascotWidth = (form, hh) => hh * MASCOT[form][1];
  // grey rounded box = "a prompt / something to copy"
  h.chip = (s, text, x, y, w, hh, o = {}) => {
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: hh, fill: { color: o.fill || C.background2 }, rectRadius: 0.08, objectName: o.name || "Prompt chip" });
    h.T(s, text, { x: x + 0.14, y, w: w - 0.28, h: hh, fontSize: o.fontSize || 12, valign: "middle", lineSpacingMultiple: o.ls || 1.15, color: o.color || C.text1 });
  };
  h.badge = async (s, iconName, x, y, d, color, name = iconName) => {
    s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color }, line: { type: "none" }, objectName: `${name} circle` });
    const i = d * 0.56;
    s.addImage({ data: await icon(iconName), x: x + (d - i) / 2, y: y + (d - i) / 2, w: i, h: i, objectName: `${name} icon` });
  };
  h.numDot = (s, n, x, y, d, color) => {
    s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color }, line: { type: "none" }, objectName: `Step ${n} dot` });
    h.T(s, String(n), { x, y, w: d, h: d, fontSize: Math.round(d * 32), bold: true, color: C.background1, align: "center", valign: "middle" });
  };
  h.rule = (s, x, y, w, name = "Rule") => s.addShape(pres.shapes.LINE, { x, y, w, h: 0, line: { color: C.accent4, width: 0.75 }, objectName: name });
  h.card = (s, x, y, w, hh, name = "Card", fill = C.background2) =>
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: hh, fill: { color: fill }, rectRadius: 0.12, objectName: name });
  h.arrow = async (s, x, y, d = 0.26) => s.addImage({ data: await icon("LuArrowRight", "#" + COL.dk2), x, y, w: d, h: d, objectName: "Arrow" });
  // mascot tip bubble — sits at the bottom, grows to 2 lines; body must end above tipTop(text)
  h.tipTop = (text) => 5.14 - (tw(text, 13) > 7.9 ? 0.66 : 0.42);
  h.tip = (s, text) => {
    const y = h.tipTop(text), hh = 5.14 - y;
    h.mascot(s, "idle", 0.5, y + (hh - 0.42) / 2, 0.42, "Tip mascot");
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 1.05, y, w: 8.45, h: hh, fill: { color: C.background2 }, rectRadius: 0.21, objectName: "Tip bubble" });
    h.T(s, text, { x: 1.25, y, w: 8.1, h: hh, fontSize: 13, valign: "middle" });
  };
  h.tags = (s, list, x, y, maxW, color) => {
    let cx = x, cy = y;
    for (const t of list) {
      const w = tw(t, 12) + 0.36;
      if (cx + w > x + maxW) { cx = x; cy += 0.42; }
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: cx, y: cy, w, h: 0.32, fill: { color: C.background1 }, line: { color, width: 1 }, rectRadius: 0.16, objectName: `Tag ${t}` });
      h.T(s, t, { x: cx, y: cy, w, h: 0.32, fontSize: 12, align: "center", valign: "middle" });
      cx += w + 0.1;
    }
  };
  // numbered list: steps = ["text", ...]; returns y after the list
  h.steps = (s, steps, x, y, w, { color = P[0], d = 0.3, gap = 0.6, fontSize = 12 } = {}) => {
    steps.forEach((t, i) => {
      h.numDot(s, i + 1, x, y + i * gap, d, color);
      h.T(s, t, { x: x + d + 0.15, y: y + i * gap - 0.02, w: w - d - 0.15, h: gap - 0.04, fontSize, valign: "top", lineSpacingMultiple: 1.15 });
    });
    return y + steps.length * gap;
  };

  // =====================================================================
  // L — page arrangements (catalogue + picture: ../references/style.md, layouts.jpg)
  // Slide types create their slide; the rest draw onto a content slide `s`.
  // =====================================================================
  const L = {};

  // COVER — title left; photo half-bleed right, or the big mascot when there is no photo
  L.cover = (sec, { kicker = "", title, subtitle = "", footer = "", photo, notes = "" }) => {
    const s = h.slide("COVER", sec);
    if (photo) s.addImage({ path: photo, x: 5.27, y: 0, w: 4.73, h: 5.625, sizing: { type: "cover", w: 4.73, h: 5.625 }, objectName: "Cover photo" });
    else {
      s.addShape(pres.shapes.OVAL, { x: 6.2, y: 4.3, w: 2.8, h: 0.3, fill: { color: C.text1, transparency: 88 }, line: { type: "none" }, objectName: "Mascot shadow" });
      h.mascot(s, "idle", 6.1, 1.25, 3.0, "Cover mascot");
    }
    h.mascot(s, "idle", 0.5, 0.5, 0.32, "Mascot mark");
    h.T(s, kicker, { x: 0.92, y: 0.5, w: 3.5, h: 0.32, fontSize: 12, color: C.text2, valign: "middle" });
    s.addText(title, { placeholder: "title" });
    h.T(s, subtitle, { x: 0.5, y: 3.7, w: 4.6, h: 0.4, fontSize: 16, color: C.text2 });
    h.T(s, footer, { x: 0.5, y: 4.85, w: 4.6, h: 0.3, fontSize: 11, color: C.text2 });
    if (notes) s.addNotes(notes);
    return s;
  };

  // DIVIDER — full part colour, big mascot pose, contents line, time pill
  L.divider = (sec, { color = P[0], part, title, line = "", contents = "", mins = "", form = "idle", notes = "" }) => {
    const s = h.slide("DIVIDER", sec);
    s.background = { color };
    h.T(s, part, { x: 0.6, y: 1.15, w: 4.8, h: 0.35, fontSize: 16 });
    s.addText(title, { placeholder: "title" });
    h.T(s, line, { x: 0.6, y: 2.65, w: 4.8, h: 0.4, fontSize: 20 });
    h.T(s, contents, { x: 0.6, y: 3.3, w: 4.8, h: 0.7, fontSize: 14, lineSpacingMultiple: 1.25 });
    if (mins) {
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 4.35, w: 1.5, h: 0.4, fill: { color: C.background1 }, rectRadius: 0.2, objectName: "Time pill" });
      h.T(s, mins, { x: 0.6, y: 4.35, w: 1.5, h: 0.4, fontSize: 13, bold: true, align: "center", valign: "middle" });
    }
    const mh = Math.min(3.1, 4.4 / MASCOT[form][1]), mw = mh * MASCOT[form][1];
    s.addShape(pres.shapes.OVAL, { x: 7.3 - 1.7, y: 4.3, w: 3.4, h: 0.35, fill: { color: C.text1, transparency: 82 }, line: { type: "none" }, objectName: "Mascot shadow" });
    h.mascot(s, form, 7.3 - mw / 2, 4.25 - mh, mh);
    if (notes) s.addNotes(notes);
    return s;
  };

  // DEMO — black page for a live demo: title left, numbered steps right, LIVE mascot
  L.demo = (sec, { label = "", title, subtitle = "", note = "", steps, accent = P[0], form = "live", notes = "" }) => {
    const s = h.slide("DEMO", sec);
    h.T(s, label, { x: 0.6, y: 0.9, w: 4.3, h: 0.3, fontSize: 14, color: C.accent4 });
    s.addText(title, { placeholder: "title" });
    h.T(s, subtitle, { x: 0.6, y: 2.15, w: 4.3, h: 0.4, fontSize: 18, color: C.background1 });
    h.T(s, note, { x: 0.6, y: 2.65, w: 4.3, h: 0.55, fontSize: 12, color: C.accent4, lineSpacingMultiple: 1.2 });
    const mw = h.mascotWidth(form, 1.15);
    // light backdrop so a dark mascot still reads on black
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 0.6, y: 3.35, w: mw + 0.3, h: 1.45, fill: { color: C.background1, transparency: 88 }, rectRadius: 0.14, objectName: "Mascot backdrop" });
    h.mascot(s, form, 0.75, 3.5, 1.15);
    const rh = steps.length > 5 ? 0.58 : 0.66, y0 = 1.0 + (6 - steps.length) * 0.1;
    steps.forEach(([n, head, detail], i) => {
      const y = y0 + i * rh;
      h.numDot(s, n, 5.1, y + 0.04, 0.38, accent);
      h.T(s, head, { x: 5.65, y, w: 3.85, h: 0.27, fontSize: 14, bold: true, color: C.background1 });
      h.T(s, detail, { x: 5.65, y: y + 0.28, w: 3.85, h: 0.24, fontSize: 11, color: C.accent4 });
    });
    if (notes) s.addNotes(notes);
    return s;
  };

  // 3 outcome cards: icon circle + small label, big 2-line head, short desc
  L.cards3 = async (s, items, { y = 1.55, hh = 2.8 } = {}) => {
    for (let i = 0; i < items.length; i++) {
      const { icon: ic, color = P[i % 3], label = "", head, desc = "" } = items[i];
      const x = 0.5 + i * 3.05;
      h.card(s, x, y, 2.9, hh, `Card ${i + 1}`);
      await h.badge(s, ic, x + 0.25, y + 0.25, 0.5, color, label || head);
      h.T(s, label, { x: x + 0.9, y: y + 0.25, w: 1.85, h: 0.5, fontSize: 11, color: C.text2, valign: "middle" });
      h.T(s, head, { x: x + 0.25, y: y + 0.95, w: 2.45, h: 0.8, fontSize: 20, bold: true, lineSpacingMultiple: 1.1 });
      h.T(s, desc, { x: x + 0.25, y: y + 1.85, w: 2.45, h: hh - 2.05, fontSize: 12, color: C.text2, lineSpacingMultiple: 1.2, valign: "top" });
    }
  };

  // 2 panels side by side. Header = mascot pose (form) or icon badge. Body = tags or numbered steps.
  L.panels2 = async (s, panels, { y = 1.3, hh = 3.05 } = {}) => {
    for (let i = 0; i < panels.length; i++) {
      const { form, icon: ic, color = P[i % 3], head, desc = "", tags, steps, link = "" } = panels[i];
      const x = i ? 5.1 : 0.5;
      h.card(s, x, y, 4.4, hh, `${head} panel`);
      if (form) {
        const mw = h.mascot(s, form, x + 0.25, y + 0.25, 0.95);
        const tx = x + 0.45 + mw;
        h.T(s, head, { x: tx, y: y + 0.28, w: x + 4.2 - tx, h: 0.42, fontSize: 20, bold: true });
        h.T(s, desc, { x: tx, y: y + 0.72, w: x + 4.2 - tx, h: 0.5, fontSize: 12, color: C.text2, valign: "top" });
      } else {
        await h.badge(s, ic, x + 0.25, y + 0.2, 0.45, color, head);
        h.T(s, head, { x: x + 0.85, y: y + 0.2, w: 3.4, h: 0.45, fontSize: 17, bold: true, valign: "middle" });
        if (desc) h.T(s, desc, { x: x + 0.25, y: y + 0.75, w: 3.9, h: 0.3, fontSize: 12, color: C.text2 });
      }
      if (tags) h.tags(s, tags, x + 0.25, y + 1.5, 3.9, color);
      if (steps) h.steps(s, steps, x + 0.25, y + (form ? 1.45 : desc ? 1.15 : 0.9), 3.95, { color, gap: 0.68 });
      if (link) h.T(s, link, { x: x + 0.25, y: y + hh - 0.5, w: 3.9, h: 0.3, fontSize: 11, color: C.text2 });
    }
  };

  // 4 stat tiles: icon, "label · 預設", big value, rule, caption, change text
  L.tiles4 = async (s, tiles, { color = P[0], y = 1.5 } = {}) => {
    for (let i = 0; i < tiles.length; i++) {
      const { icon: ic, label, value, caption = "", change = "" } = tiles[i];
      const x = 0.5 + i * 2.3;
      h.card(s, x, y, 2.1, 2.9, `${label} tile`);
      await h.badge(s, ic, x + 0.2, y + 0.22, 0.42, color, label);
      h.T(s, label, { x: x + 0.2, y: y + 0.8, w: 1.7, h: 0.25, fontSize: 12, color: C.text2 });
      h.T(s, value, { x: x + 0.2, y: y + 1.08, w: 1.8, h: 0.5, fontSize: 24, bold: true, valign: "middle" });
      h.rule(s, x + 0.2, y + 1.75, 1.7, `${label} rule`);
      h.T(s, caption, { x: x + 0.2, y: y + 1.88, w: 1.7, h: 0.22, fontSize: 10.5, color: C.text2 });
      h.T(s, change, { x: x + 0.2, y: y + 2.12, w: 1.8, h: 0.6, fontSize: 13, valign: "top", lineSpacingMultiple: 1.15 });
    }
  };

  // 3 option cards: letter badge + head, labelled fields, example chip at the bottom
  L.options3 = async (s, items, { color = P[0], y = 1.2, hh = 3.4 } = {}) => {
    for (let i = 0; i < items.length; i++) {
      const { key, head, fields = [], exLabel = "", ex = "" } = items[i];
      const x = 0.5 + i * 3.05;
      h.card(s, x, y, 2.9, hh, `Option ${key} card`);
      s.addShape(pres.shapes.OVAL, { x: x + 0.2, y: y + 0.2, w: 0.42, h: 0.42, fill: { color }, line: { type: "none" }, objectName: `Option ${key} badge` });
      h.T(s, key, { x: x + 0.2, y: y + 0.2, w: 0.42, h: 0.42, fontSize: 16, bold: true, color: C.background1, align: "center", valign: "middle" });
      h.T(s, head, { x: x + 0.75, y: y + 0.2, w: 2.0, h: 0.42, fontSize: 17, bold: true, valign: "middle" });
      fields.forEach(([label, text], j) => {
        h.T(s, label, { x: x + 0.2, y: y + 0.78 + j * 0.52, w: 2.5, h: 0.2, fontSize: 10, color: C.text2 });
        h.T(s, text, { x: x + 0.2, y: y + 0.98 + j * 0.52, w: 2.55, h: 0.25, fontSize: 12.5 });
      });
      if (ex) {
        const ey = y + 0.78 + fields.length * 0.52 + 0.06;
        h.T(s, exLabel, { x: x + 0.2, y: ey, w: 2.5, h: 0.2, fontSize: 10, color: C.text2 });
        h.chip(s, ex, x + 0.12, ey + 0.22, 2.66, y + hh - ey - 0.34, { fontSize: 10.5, fill: C.background1, ls: 1.1, name: `Option ${key} example` });
      }
    }
  };

  // 6 numbered steps in 2 columns (1–3 left, 4–6 right). rows = top of each row.
  L.steps2col = (s, steps, { color = P[0], rows = [1.15, 2.35, 3.45] } = {}) => {
    steps.forEach(([head, body], i) => {
      const x = i < rows.length ? 0.5 : 5.1, y = rows[i % rows.length];
      h.numDot(s, i + 1, x, y, 0.4, color);
      h.T(s, head, { x: x + 0.55, y: y + 0.02, w: 3.85, h: 0.36, fontSize: 15, bold: true, valign: "middle" });
      h.T(s, body, { x: x + 0.55, y: y + 0.42, w: 3.95, h: 0.66, fontSize: 11, color: C.text2, valign: "top", lineSpacingMultiple: 1.15 });
    });
  };

  // formula pills on top; template chip left; ✗ vague vs ✓ good example on the right
  L.formula = async (s, { parts, templateLabel = "", template, bad, good }, { color = P[0] } = {}) => {
    let x = 0.5;
    parts.forEach((t, i) => {
      if (i) { h.T(s, "＋", { x, y: 1.1, w: 0.35, h: 0.42, fontSize: 18, bold: true, color: C.text2, align: "center", valign: "middle" }); x += 0.35; }
      const w = tw(t, 16) + 0.55;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.1, w, h: 0.42, fill: { color }, rectRadius: 0.21, objectName: `Formula ${t}` });
      h.T(s, t, { x, y: 1.1, w, h: 0.42, fontSize: 16, bold: true, color: C.background1, align: "center", valign: "middle" });
      x += w;
    });
    h.T(s, templateLabel, { x: 0.5, y: 1.75, w: 4.3, h: 0.22, fontSize: 11, color: C.text2 });
    h.chip(s, template, 0.5, 2.02, 4.4, 2.0, { fontSize: 12, ls: 1.3, name: "Formula template" });
    if (bad) {
      await h.badge(s, "LuX", 5.1, 1.73, 0.26, C.text2, "Vague");
      h.T(s, bad.label, { x: 5.45, y: 1.73, w: 3.5, h: 0.26, fontSize: 12, bold: true, valign: "middle" });
      h.chip(s, bad.text, 5.1, 2.05, 4.4, 0.4, { fontSize: 12, name: "Vague chip" });
      h.T(s, bad.note || "", { x: 5.1, y: 2.48, w: 4.4, h: 0.25, fontSize: 11, color: C.text2 });
    }
    if (good) {
      await h.badge(s, "LuCheck", 5.1, 2.82, 0.26, color, "Good");
      h.T(s, good.label, { x: 5.45, y: 2.82, w: 4.0, h: 0.26, fontSize: 12, bold: true, valign: "middle" });
      h.chip(s, good.text, 5.1, 3.13, 4.4, 1.48, { fontSize: 10.5, ls: 1.15, name: "Good chip" });
    }
  };

  // table rows: icon | name | chip | (optional) fit. heads = [[text, x], ...]
  L.rows = async (s, { heads, rows, y0 = 1.68, rh = 0.48, nameW = 1.1, nameSize = 15, chipX = 2.2, chipW = 4.25, fitX = 6.65, chipSize = 13 }, { color = P[0] } = {}) => {
    for (const [t, x] of heads) h.T(s, t, { x, y: y0 - 0.28, w: 2.5, h: 0.22, fontSize: 11, color: C.text2 });
    for (let i = 0; i < rows.length; i++) {
      const [ic, name, chipText, fit] = rows[i];
      const y = y0 + i * rh;
      h.rule(s, 0.5, y, 9, `Row rule ${i + 1}`);
      await h.badge(s, ic, 0.5, y + (rh - 0.34) / 2, 0.34, color, name);
      h.T(s, name, { x: 1.05, y, w: nameW, h: rh, fontSize: nameSize, bold: true, valign: "middle" });
      h.chip(s, chipText, chipX, y + 0.07, chipW, rh - 0.14, { fontSize: chipSize, name: `${name} chip` });
      if (fit) h.T(s, fit, { x: fitX, y, w: 9.5 - fitX, h: rh, fontSize: 13, color: C.text2, valign: "middle" });
    }
    h.rule(s, 0.5, y0 + rows.length * rh, 9, "Row rule end");
  };

  // 5 cards with a colour block on top (mood / option swatches) and a chip below
  L.swatches5 = async (s, items, { y = 1.2, label = "" } = {}) => {
    for (let i = 0; i < items.length; i++) {
      const { icon: ic, hex, name, text } = items[i];
      const x = 0.5 + i * 1.83;
      h.card(s, x, y, 1.68, 3.38, `${name} card`);
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w: 1.68, h: 1.0, fill: { color: hex }, rectRadius: 0.12, objectName: `${name} swatch` });
      s.addImage({ data: await icon(ic), x: x + 0.62, y: y + 0.28, w: 0.44, h: 0.44, objectName: `${name} icon` });
      h.T(s, name, { x: x + 0.15, y: y + 1.12, w: 1.4, h: 0.35, fontSize: 14, bold: true, valign: "middle" });
      h.T(s, label, { x: x + 0.15, y: y + 1.5, w: 1.4, h: 0.2, fontSize: 10, color: C.text2 });
      h.chip(s, text, x + 0.1, y + 1.76, 1.48, 1.48, { fontSize: 12, fill: C.background1, ls: 1.2, name: `${name} chip` });
    }
  };

  // 3 aspect-ratio frames (formats / screens), bottom-aligned, captions below
  L.frames3 = (s, items, { color = P[0], base = 3.3 } = {}) => {
    const cxs = [1.9, 4.95, 8.0];
    items.forEach(({ ratio: [rw, rh], label, title, sub = "", note = "" }, i) => {
      const fh = Math.min(2.05, 2.9 * rh / rw, rw < rh * 0.75 ? 2.05 : 1.65), fw = fh * rw / rh, cx = cxs[i];
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: cx - fw / 2, y: base - fh, w: fw, h: fh, fill: { color: C.background2 }, line: { color: C.text1, width: 1.5 }, rectRadius: 0.1, objectName: `${label} frame` });
      h.T(s, label, { x: cx - fw / 2, y: base - fh, w: fw, h: fh, fontSize: 18, bold: true, align: "center", valign: "middle" });
      h.T(s, title, { x: cx - 1.45, y: base + 0.15, w: 2.9, h: 0.3, fontSize: 13, bold: true, align: "center" });
      h.T(s, sub, { x: cx - 1.45, y: base + 0.48, w: 2.9, h: 0.26, fontSize: 12, color: C.text2, align: "center" });
      if (note) h.T(s, note, { x: cx - 1.5, y: base + 0.8, w: 3.0, h: 0.26, fontSize: 11, color, align: "center" });
    });
  };

  // 4 key frames with arrows, a full-width prompt chip and a caveat line
  L.sequence4 = async (s, { items, prompt = "", caveat = "" }, { color = P[0], y = 1.55 } = {}) => {
    for (let i = 0; i < items.length; i++) {
      const { icon: ic, label } = items[i];
      const x = 0.5 + i * 2.35;
      h.card(s, x, y, 1.95, 1.2, `Frame ${i + 1}`);
      await h.badge(s, ic, x + 0.7, y + 0.2, 0.55, color, label);
      h.numDot(s, i + 1, x + 0.12, y + 0.1, 0.28, C.text1);
      h.T(s, label, { x, y: y + 0.83, w: 1.95, h: 0.28, fontSize: 13, bold: true, align: "center" });
      if (i < items.length - 1) await h.arrow(s, x + 2.02, y + 0.47);
    }
    if (prompt) h.chip(s, prompt, 0.5, y + 1.43, 9, 0.95, { fontSize: 12, ls: 1.2, name: "Sequence prompt" });
    if (caveat) h.T(s, caveat, { x: 0.5, y: y + 2.48, w: 9, h: 0.26, fontSize: 11, color: C.text2 });
  };

  // 4-stage flow: big icon circles joined by arrows, numbered heads, centred descriptions
  L.flow4 = async (s, stages, { color = P[1], y = 1.95 } = {}) => {
    for (let i = 0; i < stages.length; i++) {
      const { icon: ic, head, desc = "" } = stages[i];
      const cx = 1.625 + i * 2.25;
      if (i < stages.length - 1) s.addShape(pres.shapes.LINE, { x: cx + 0.6, y: y + 0.45, w: 1.05, h: 0, line: { color: C.accent4, width: 2, endArrowType: "triangle" }, objectName: `Flow arrow ${i + 1}` });
      await h.badge(s, ic, cx - 0.45, y, 0.9, color, head);
      h.T(s, `${i + 1}  ${head}`, { x: cx - 1.05, y: y + 1.07, w: 2.1, h: 0.36, fontSize: 16, bold: true, align: "center" });
      h.T(s, desc, { x: cx - 1.05, y: y + 1.47, w: 2.1, h: 0.75, fontSize: 12, color: C.text2, align: "center", valign: "top", lineSpacingMultiple: 1.15 });
    }
  };

  // compact numbered steps on the left (head + 1-line body), stacked labelled chips on the right
  L.stepsChips = (s, { steps, chips }, { color = P[1] } = {}) => {
    steps.forEach(([head, body], i) => {
      const y = 1.15 + i * 0.585;
      h.numDot(s, i + 1, 0.5, y, 0.32, color);
      h.T(s, head, { x: 0.95, y: y - 0.01, w: 3.7, h: 0.25, fontSize: 13, bold: true });
      h.T(s, body, { x: 0.95, y: y + 0.24, w: 3.9, h: 0.34, fontSize: 10, color: C.text2, valign: "top" });
    });
    let y = 1.12;
    for (const { label, text, hh = 1.4, fontSize = 11.5 } of chips) {
      h.T(s, label, { x: 4.95, y, w: 4, h: 0.22, fontSize: 11, color: C.text2 });
      h.chip(s, text, 4.95, y + 0.26, 4.55, hh, { fontSize, ls: 1.15, name: `${label} chip` });
      y += 0.26 + hh + 0.1;
    }
  };

  // 3 cards each holding a numbered list (outlines, menus, agendas); optional note at the bottom
  L.lists3 = async (s, cols, { color = P[1], y = 1.6, hh = 2.92 } = {}) => {
    for (let i = 0; i < cols.length; i++) {
      const { icon: ic, head, meta = "", items, note = "" } = cols[i];
      const x = 0.5 + i * 3.05;
      h.card(s, x, y, 2.9, hh, `${head} card`);
      await h.badge(s, ic, x + 0.18, y + 0.18, 0.38, color, head);
      h.T(s, head, { x: x + 0.66, y: y + 0.13, w: 2.2, h: 0.27, fontSize: 13.5, bold: true });
      h.T(s, meta, { x: x + 0.66, y: y + 0.4, w: 2.2, h: 0.2, fontSize: 10, color: C.text2 });
      h.T(s, items.map((p, j) => ({ text: `${j + 1}  ${p}`, options: { breakLine: j < items.length - 1 } })),
        { x: x + 0.2, y: y + 0.72, w: 2.6, h: note ? hh - 1.37 : hh - 0.82, fontSize: 10.5, valign: "top", lineSpacingMultiple: 1.08 });
      if (note) h.T(s, note, { x: x + 0.2, y: y + hh - 0.54, w: 2.55, h: 0.45, fontSize: 9.5, color, valign: "top" });
    }
  };

  // decision cards on the left ("your situation → pick"), numbered how-to on the right
  L.choicesSteps = async (s, { choicesLabel = "", choices, stepsHead = "", steps }, { color = P[1] } = {}) => {
    h.T(s, choicesLabel, { x: 0.5, y: 1.15, w: 4, h: 0.25, fontSize: 11, color: C.text2 });
    for (let i = 0; i < choices.length; i++) {
      const { icon: ic, when, pick } = choices[i];
      const y = 1.45 + i * 0.95;
      h.card(s, 0.5, y, 4.3, 0.82, `Choice ${i + 1}`);
      await h.badge(s, ic, 0.68, y + 0.2, 0.42, color, pick);
      h.T(s, when, { x: 1.25, y: y + 0.1, w: 3.45, h: 0.3, fontSize: 12.5 });
      h.T(s, pick, { x: 1.25, y: y + 0.42, w: 3.45, h: 0.3, fontSize: 13, bold: true, color });
    }
    h.T(s, stepsHead, { x: 5.1, y: 1.12, w: 4.4, h: 0.32, fontSize: 15, bold: true });
    h.steps(s, steps, 5.1, 1.58, 4.4, { color, d: 0.28, gap: 0.55, fontSize: 11.5 });
  };

  // one big prompt chip on the left, a vertical chain of icon steps on the right
  L.promptChain = async (s, { label = "", prompt, chain }, { color = P[2], y = 1.45 } = {}) => {
    h.T(s, label, { x: 0.5, y, w: 5.4, h: 0.22, fontSize: 11, color: C.text2 });
    h.chip(s, prompt, 0.5, y + 0.27, 5.4, 4.37 - y - 0.27, { fontSize: 11, ls: 1.18, name: "Big prompt" });
    s.addShape(pres.shapes.LINE, { x: 6.48, y: y + 0.3, w: 0, h: (chain.length - 1) * 0.58, line: { color: C.accent4, width: 2 }, objectName: "Chain line" });
    for (let i = 0; i < chain.length; i++) {
      const { icon: ic, text } = chain[i];
      const cy = y + 0.1 + i * 0.58;
      await h.badge(s, ic, 6.25, cy, 0.46, color, text);
      h.T(s, `${i + 1}  ${text}`, { x: 6.85, y: cy, w: 2.65, h: 0.46, fontSize: 12.5, bold: true, valign: "middle" });
    }
  };

  // comparison grid: label column + 3 columns with icon heads. rows = [[label, rowHeight, [c1, c2, c3]], ...]
  L.grid = async (s, { heads, rows }, { color = P[2], y = 1.45 } = {}) => {
    const colX = (j) => 2.05 + j * 2.5;
    for (let j = 0; j < heads.length; j++) {
      await h.badge(s, heads[j].icon, colX(j), y, 0.34, color, heads[j].text);
      h.T(s, heads[j].text, { x: colX(j) + 0.42, y, w: 2.0, h: 0.34, fontSize: 13, bold: true, valign: "middle" });
    }
    let ry = y + 0.43;
    rows.forEach(([label, rh, cells], i) => {
      h.rule(s, 0.5, ry, 9, `Grid rule ${i + 1}`);
      h.T(s, label, { x: 0.5, y: ry, w: 1.5, h: rh, fontSize: 11, bold: true, color: C.text2, valign: "middle" });
      cells.forEach((c, j) => h.T(s, c, { x: colX(j), y: ry, w: 2.38, h: rh, fontSize: 10.5, valign: "middle" }));
      ry += rh;
    });
    h.rule(s, 0.5, ry, 9, "Grid rule end");
  };

  // ---------- write + theme ----------
  async function finish(out) {
    await pres.writeFile({ fileName: out });
    const zip = await JSZip.loadAsync(fs.readFileSync(out));
    const tp = "ppt/theme/theme1.xml";
    const name = themeName.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
    for (const k of SLOTS) if (!/^[0-9A-Fa-f]{6}$/.test(COL[k])) throw new Error(`colors.${k} must be 6 hex digits, no "#"`);
    const scheme = `<a:clrScheme name="${name}">` + SLOTS.map((k) => `<a:${k}><a:srgbClr val="${COL[k].toUpperCase()}"/></a:${k}>`).join("") + "</a:clrScheme>";
    const xml = (await zip.file(tp).async("string"))
      .replace(/<a:clrScheme\b[\s\S]*?<\/a:clrScheme>/, () => scheme)          // pptxgenjs writes Office's palette; scheme colours need ours
      .replace(/<a:ea typeface="[^"]*"\s*\/>/g, `<a:ea typeface="${font}"/>`); // CJK never falls back to a stock font
    zip.file(tp, xml);
    fs.writeFileSync(out, await zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" }));
    console.log("wrote", out);
  }

  return { pres, C, P, COL, h, L, finish };
}

module.exports = { start, icon, tw };
