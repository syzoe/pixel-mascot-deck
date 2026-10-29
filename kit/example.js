// example.js — one slide per page arrangement, placeholder content. Copy this into a new deck
// project as deck.js, point MASCOT_DIR at that deck's own mascot PNGs, then replace the content.
//   NODE_PATH=$PWD/node_modules node example.js   -> example.pptx
const fs = require("fs");
const os = require("os");
const path = require("path");
const kit = require("./deck-kit");

// your deck's upscaled poses live in ./assets; until they exist, the skill's "?" placeholder is used
const OWN = path.join(__dirname, "assets");
const MASCOT_DIR = process.env.MASCOT_DIR
  || (fs.existsSync(path.join(OWN, "mascot_idle@16.png")) ? OWN : path.join(os.homedir(), ".agents/skills/pixel-mascot-deck/mascot"));
const M = (f) => path.join(MASCOT_DIR, f);

async function main() {
  const { P, h, L, finish } = kit.start({
    title: "簡報標題",
    header: "活動名稱 · 主題",
    mascots: {
      idle: M("mascot_idle@16.png"), camera: M("mascot_camera@16.png"), board: M("mascot_board@16.png"),
      wrench: M("mascot_wrench@16.png"), live: M("mascot_live@16.png"),
    },
  });

  // ---------------- 開場 ----------------
  const S0 = h.section("開場");
  L.cover(S0, {
    kicker: "活動名稱", title: "簡報主標題，\n可以分\n三行寫", subtitle: "一句副標題", footer: "60 分鐘 · 含現場示範　　2026.01.01",
    // photo: "cover.png",   ← half-bleed photo on the right; omit to show the big mascot
    notes: "開場（約 1 分鐘）",
  });
  {
    const s = h.content(S0, "cards3 · 今天學完，你會做到");
    h.sub(s, "3 件事，含 2 次現場示範。");
    await L.cards3(s, [
      { icon: "LuClapperboard", label: "第一部分 · 20 分鐘", head: "第一件事 →\n一句結果", desc: "一句說明，最多兩到三行。" },
      { icon: "LuPresentation", label: "第二部分 · 20 分鐘", head: "第二件事 →\n一句結果", desc: "一句說明，最多兩到三行。" },
      { icon: "LuMessagesSquare", label: "第三部分 · 15 分鐘", head: "第三件事\n一句結果", desc: "一句說明，最多兩到三行。" },
    ]);
    h.tip(s, "看到灰色框就是可以直接複製的內容，把【】換成你自己的。");
    s.addNotes("（約 2 分鐘）");
  }
  {
    const s = h.content(S0, "panels2 · 兩件事各自負責什麼");
    await L.panels2(s, [
      { form: "camera", head: "左邊負責 A", desc: "一句說明", tags: ["標籤一", "標籤二", "標籤三", "標籤四", "標籤五"], link: "→ 第一部分" },
      { form: "board", head: "右邊負責 B", desc: "一句說明，可以兩行", tags: ["標籤一", "標籤二", "標籤三"], link: "→ 第二部分" },
    ]);
    h.tip(s, "兩個加起來，就是完整的一套。");
  }

  // ---------------- 第一部分 ----------------
  const S1 = h.section("第一部分");
  L.divider(S1, {
    color: P[0], part: "第一部分", title: "主題一", line: "一句話：輸入 → 輸出",
    contents: "小節 · 小節 · 小節 · 小節\n小節 · 小節 · 現場示範", mins: "約 20 分鐘", form: "camera",
    notes: "第一部分（約 20 分鐘）",
  });
  {
    const s = h.content(S1, "tiles4 · 先看規格");
    h.sub(s, "沒寫就是預設值。想改，直接寫在提示詞裡。");
    await L.tiles4(s, [
      { icon: "LuTimer", label: "長度 · 預設", value: "6 秒", caption: "想改就寫", change: "1–15 秒\n例如「10 秒」" },
      { icon: "LuMonitor", label: "畫質 · 預設", value: "480p", caption: "想改就寫", change: "「720p」" },
      { icon: "LuRatio", label: "比例 · 預設", value: "跟原圖一樣", caption: "想改就寫", change: "1:1、16:9、9:16" },
      { icon: "LuFileVideo", label: "檔案 · 預設", value: "MP4", caption: "想改就寫", change: "—" },
    ]);
    h.tip(s, "一句提醒，放在每頁最下面。");
  }
  {
    const s = h.content(S1, "options3 · 選一種開始方式");
    await L.options3(s, [
      { key: "A", head: "方式一", fields: [["你給", "一段描述"], ["適合", "某種情況"]], exLabel: "範例", ex: "這裡放一段可以直接複製的完整範例，最多四到五行。" },
      { key: "B", head: "方式二", fields: [["你給", "一張圖片"], ["適合", "某種情況"]], exLabel: "開頭這樣寫", ex: "一句開頭。\n（後面接公式）" },
      { key: "C", head: "方式三", fields: [["你給", "兩張圖片"], ["適合", "某種情況"]], exLabel: "範例", ex: "這裡放另一段完整範例。" },
    ]);
    h.tip(s, "小技巧：一句話講清楚，最多兩行。");
  }
  {
    const s = h.content(S1, "steps2col · 6 個步驟");
    L.steps2col(s, [
      ["第一步", "一到三行說明。\n第二行。"], ["第二步", "一行說明。"], ["第三步", "一行說明。"],
      ["第四步", "例如「一句示範」"], ["第五步", "電腦：……\n手機：……"], ["第六步", "一到兩行說明。"],
    ]);
    h.tip(s, "第 4 步不用重來，直接說要改什麼。");
  }
  {
    const s = h.content(S1, "formula · 提示詞公式");
    await L.formula(s, {
      parts: ["主體", "動作", "鏡頭", "光線氣氛", "規格"],
      templateLabel: "複製這段，把【】換成你的內容",
      template: "請用我附上的圖做……\n主體：【……】\n動作：【……】\n鏡頭：【……】\n光線氣氛：【……】\n規格：【……】",
      bad: { label: "只寫一句", text: "「幫我做一個」", note: "其他都交給對方猜，結果不一定是你要的。" },
      good: { label: "照公式寫（範例）", text: "請用我附上的圖做……\n主體：……\n動作：……\n鏡頭：……\n光線氣氛：……\n規格：……" },
    });
    h.tip(s, "規格寫最後；沒寫就是預設值。");
  }
  {
    const s = h.content(S1, "rows · 6 種寫法");
    h.sub(s, "一句說明：把下表的寫法直接放進公式那一格。");
    await L.rows(s, {
      heads: [["名稱", 1.05], ["這樣寫", 2.25], ["適合", 6.65]],
      rows: [
        ["LuFocus", "寫法一", "「一句提示詞」", "適合的情況"],
        ["LuZoomIn", "寫法二", "「一句提示詞【換這裡】」", "適合的情況"],
        ["LuZoomOut", "寫法三", "「稍長一點的一句提示詞」", "適合的情況"],
        ["LuMoveHorizontal", "寫法四", "「一句提示詞」", "適合的情況"],
        ["LuRotate3D", "寫法五", "「一句提示詞」", "適合的情況"],
        ["LuArrowDownToLine", "寫法六", "「一句提示詞」", "適合的情況"],
      ],
    });
    h.tip(s, "兩欄版本：省略第 4 欄，把 nameW / chipX / chipW 加大（見 style.md）。");
  }
  {
    const s = h.content(S1, "swatches5 · 5 組現成的寫法");
    await L.swatches5(s, [
      { icon: "LuSun", hex: "E8A15A", name: "感覺一", text: "「一句寫法」" },
      { icon: "LuSunrise", hex: "8CC7E6", name: "感覺二", text: "「一句寫法」" },
      { icon: "LuSparkles", hex: "2B2B2B", name: "感覺三", text: "「一句寫法」" },
      { icon: "LuUsers", hex: "E9775B", name: "感覺四", text: "「一句寫法」" },
      { icon: "LuLeaf", hex: "D9822B", name: "感覺五", text: "「一句寫法」" },
    ], { label: "這樣寫" });
    h.tip(s, "可以和上一頁一起用。");
  }
  {
    const s = h.content(S1, "frames3 · 不同平台用什麼規格");
    L.frames3(s, [
      { ratio: [9, 16], label: "9:16", title: "直式平台", sub: "建議 6–10 秒" },
      { ratio: [3, 4], label: "3:4", title: "貼文", sub: "建議 6 秒", note: "一句例外說明" },
      { ratio: [16, 9], label: "16:9", title: "簡報、網站", sub: "建議 6–8 秒" },
    ]);
    h.tip(s, "同一份素材可以做兩個比例。");
  }
  {
    const s = h.content(S1, "sequence4 · 用 4 個畫面講一個故事");
    h.sub(s, "一句說明：依序出現，適合有先後順序的內容。");
    await L.sequence4(s, {
      items: [{ icon: "LuPackage", label: "第一格" }, { icon: "LuBean", label: "第二格" }, { icon: "LuDroplets", label: "第三格" }, { icon: "LuCoffee", label: "第四格" }],
      prompt: "一段可以複製的提示詞，第一行。\n第 1 張 → 第 2 張 → 第 3 張 → 第 4 張。\n規格。",
      caveat: "一句限制或官方說明的提醒。",
    });
    h.tip(s, "順序不對就直接說要怎麼調。");
  }
  L.demo(S1, {
    label: "第一部分 · 約 5 分鐘", title: "現場示範 1", subtitle: "一句說明要示範什麼",
    note: "全部在同一個對話裡，一則一則貼。\n提示詞都在講者備註，照順序複製。", accent: P[0],
    steps: [[1, "步驟一", "一行細節"], [2, "步驟二", "一行細節"], [3, "步驟三", "一行細節"], [4, "步驟四", "一行細節"], [5, "步驟五", "一行細節"]],
    notes: "現場示範（約 5 分鐘）\n第 1 步：完整提示詞……",
  });

  // ---------------- 第二部分 ----------------
  const S2 = h.section("第二部分");
  L.divider(S2, { color: P[1], part: "第二部分", title: "主題二", line: "一句話：輸入 → 輸出", contents: "小節 · 小節 · 小節", mins: "約 20 分鐘", form: "board" });
  {
    const s = h.content(S2, "flow4 · 整個流程");
    h.sub(s, "一句話講完整個流程，可以兩行。", { fontSize: 13, h: 0.5 });
    await L.flow4(s, [
      { icon: "LuLayoutGrid", head: "階段一", desc: "一到兩行說明" }, { icon: "LuLayers", head: "階段二", desc: "一到兩行說明" },
      { icon: "LuPencilLine", head: "階段三", desc: "一到兩行說明" }, { icon: "LuDownload", head: "階段四", desc: "一到兩行說明" },
    ]);
    h.tip(s, "一句最重要的提醒。");
  }
  {
    const s = h.content(S2, "stepsChips · 6 個步驟 + 範例");
    L.stepsChips(s, {
      steps: [["第一步", "一行說明"], ["第二步", "右邊這段"], ["第三步", "一行說明"], ["第四步", "一行說明"], ["第五步", "一行說明"], ["第六步", "第一行\n第二行"]],
      chips: [
        { label: "步驟 2 · 貼上", text: "第一行提示詞。\n主題：【……】\n對象：【……】\n頁數：【……】\n其他要求。", hh: 1.72 },
        { label: "步驟 5 · 修改", text: "第一句修改。\n第二句修改。\n第三句修改。", hh: 1.12, fontSize: 11 },
      ],
    });
  }
  {
    const s = h.content(S2, "lists3 · 3 種常用骨架");
    h.sub(s, "一句說明：先決定給誰看、要他做什麼，再寫順序。", { fontSize: 13, h: 0.45 });
    await L.lists3(s, [
      { icon: "LuPackageOpen", head: "骨架 1 · 名稱", meta: "8 頁 · 給誰", items: ["封面", "第二頁", "第三頁", "第四頁", "第五頁", "第六頁", "第七頁", "第八頁"] },
      { icon: "LuHandshake", head: "骨架 2 · 名稱", meta: "10 頁 · 給誰", items: ["封面", "二", "三", "四", "五", "六", "七", "八", "九", "十"] },
      { icon: "LuChartColumn", head: "骨架 3 · 名稱", meta: "5 頁 · 給誰", items: ["封面", "第二頁", "第三頁", "第四頁", "第五頁"], note: "一句限制提醒，放在卡片底部。" },
    ]);
    h.tip(s, "每份都加上同一句要求。");
  }
  {
    const s = h.content(S2, "choicesSteps · 選哪一種？");
    await L.choicesSteps(s, {
      choicesLabel: "你的情況 → 選",
      choices: [{ icon: "LuMonitor", when: "情況一", pick: "選項 A" }, { icon: "LuUsers", when: "情況二", pick: "選項 B" }, { icon: "LuMessageCircle", when: "情況三", pick: "兩種都可以" }],
      stepsHead: "設定（只要做一次）",
      steps: ["第一步，可以兩行", "第二步", "第三步", "第四步", "第五步"],
    });
    h.tip(s, "一句例外提醒，太長會自動變兩行。");
  }
  {
    const s = h.content(S2, "rows（兩欄）· 不如預期？這樣改");
    h.mascot(s, "wrench", 8.45, 0.5, 0.75, "Mascot fixing");
    h.sub(s, "不用重來，直接說要改什麼。");
    await L.rows(s, {
      heads: [["你看到的問題", 1.05], ["這樣說", 3.85]], y0: 1.72, rh: 0.5, nameW: 2.65, nameSize: 14, chipX: 3.8, chipW: 5.7,
      rows: [["LuShapes", "問題一", "「一句修改」"], ["LuGauge", "問題二", "「一句修改」"], ["LuType", "問題三", "「一句修改」"], ["LuRatio", "問題四", "「一句修改」"], ["LuEye", "問題五", "「一句修改」"]],
    }, { color: P[1] });
    h.tip(s, "一句提醒。");
  }

  // ---------------- 第三部分 ----------------
  const S3 = h.section("第三部分");
  {
    const s = h.content(S3, "panels2（步驟）· 兩種做法");
    await L.panels2(s, [
      { icon: "LuPresentation", color: P[2], head: "做法 A（3 步）", steps: ["第一步", "第二步，可以兩行", "第三步"] },
      { icon: "LuMonitorPlay", color: P[2], head: "做法 B（2 步）", steps: ["第一步", "第二步\n細節一\n細節二"] },
    ], { y: 1.2, hh: 3.1 });
    h.tip(s, "想更省事的做法，一到兩行。");
  }
  {
    const s = h.content(S3, "promptChain · 一個對話做完全套");
    h.sub(s, "一句說明。");
    await L.promptChain(s, {
      label: "貼上這段，把【】換成你的內容",
      prompt: "第一段說明，每一步做完先給我看：\n1. 第一步……\n2. 第二步……\n3. 第三步……\n4. 第四步……\n5. 第五步……",
      chain: [{ icon: "LuVideo", text: "第一步" }, { icon: "LuRectangleHorizontal", text: "第二步" }, { icon: "LuPresentation", text: "第三步" }, { icon: "LuImagePlus", text: "第四步" }, { icon: "LuSend", text: "第五步" }],
    });
    h.tip(s, "「每一步做完先給我看」很重要。");
  }
  {
    const s = h.content(S3, "grid · 換成你的行業");
    h.sub(s, "同一套流程，換內容就能用。");
    await L.grid(s, {
      heads: [{ icon: "LuUtensils", text: "行業一" }, { icon: "LuGraduationCap", text: "行業二" }, { icon: "LuSparkles", text: "行業三" }],
      rows: [
        ["項目一", 0.34, ["內容", "內容", "內容"]],
        ["項目二", 0.42, ["內容", "內容", "較長的內容可以兩行"]],
        ["項目三", 0.44, ["內容", "內容", "內容"]],
        ["項目四", 0.3, ["內容", "內容", "內容"]],
        ["項目五", 0.6, ["較長的清單：一、二、三、四、五、六", "較長的清單", "較長的清單"]],
      ],
    });
    h.tip(s, "一句注意事項。");
  }
  L.demo(S3, {
    label: "第三部分 · 約 6 分鐘", title: "現場示範 2", subtitle: "一句說明", accent: P[1],
    note: "接著示範 1 的同一個對話。",
    steps: [[6, "步驟六", "細節"], [7, "步驟七", "細節"], [8, "步驟八", "細節"], [9, "步驟九", "細節"], [10, "步驟十", "細節"], [11, "步驟十一", "細節"]],
  });

  await finish("example.pptx");
}
main().catch((e) => { console.error(e); process.exit(1); });
