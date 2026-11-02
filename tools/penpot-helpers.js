// FMoT Rail wireframes: Penpot board-drawing helpers (gap 19 in gap-review.md).
// Saved from the MCP plugin's storage on 29 October 2026, after the gap-review fixes on page 07.
//
// Load at the start of a session: paste this whole file into mcp__penpot__execute_code, followed by
//   install(storage); return Object.keys(storage.B).length;
// then put the registry and interaction table back from tools/penpot-state.json:
//   storage.reg = <state.reg>; storage.wires = <state.wires>;
// storage.W holds the drawing primitives, storage.B the board builders (B[key](x, y) draws screens/<key>),
// storage.wire / walk / dead / expect / mkFlow the prototype wiring and checks, storage.P the page ids.
// storage.rebuildOn(pageId, keys, [[newKey, x, y]]) does the same on pages 01 to 06, which carry no links. Build on page 07 first. To rebuild a board in place without deleting it: storage.rebuild([key]) hides the old
// layers in an archive group and redraws into the same board, so links pointing at it keep working.
// The raw-SVG boards (w3-map-home, w5-project-view) need storage.svgW3 / storage.svgW5: export those boards first.

function install(storage) {
  const W = storage.W = storage.W || {};
  const B = storage.B = storage.B || {};
  const L = 520, R = 980, CW = 420;
  const SSP = penpot.fonts.findById("sourcesanspro");
  const V = {400: SSP.variants.find(v => v.fontVariantId === "regular"), 600: SSP.variants.find(v => v.fontVariantId === "600"), 700: SSP.variants.find(v => v.fontVariantId === "bold")};
  const origText = (...a) => storage.origText(...a);
  W.U = penpotUtils; // builders made with storage.rebind cannot see penpotUtils directly
  W.C = {
    "bg": "#F7F7F7",
    "white": "#FFFFFF",
    "panel": "#F0F1F3",
    "line": "#CCCCCC",
    "lineSoft": "#E4E7EA",
    "fillSoft": "#E6E6E6",
    "fillMid": "#DDDDDD",
    "txt": "#222222",
    "txt2": "#666666",
    "txt3": "#999999",
    "accent": "#2F2F2F",
    "red": "#B00020",
    "green": "#3A7D44",
    "amber": "#E08A1E",
    "navAct": "#E4E7EA"
  };
  W.INBOX = [
    [
      "Lagos–Ibadan",
      [
        [
          "verify-photo",
          "Flagged photo at km 212+150",
          "Lot 1 · outside corridor",
          "2 days",
          "The dot is 180 m outside the corridor buffer"
        ]
      ]
    ],
    [
      "Kaduna–Kano SGR",
      [
        [
          "approve-ipc",
          "Approve payment certificate",
          "IPC 14 · Lot 2",
          "1 day",
          "NRC engineer certified it; needs your approval"
        ],
        [
          "confirm-account",
          "Confirm new account",
          "CCECC site manager · Lot 2",
          "3 hours",
          "Administrator invited Emeka Nwosu for Lot 2"
        ],
        [
          "verify-milestone",
          "Verify milestone",
          "Embankment section 12 · Lot 2",
          "5 hours",
          "Claimed complete at km 104+800 · 4 photos"
        ]
      ]
    ],
    [
      "Lagos–Calabar coastal",
      [
        [
          "upload-document",
          "Upload document",
          "BPP Certificate of No Objection · gate 6",
          "1 day",
          "Procurement to attach BPP's no-objection letter"
        ],
        [
          "confirm-gate",
          "Confirm gate 6",
          "BPP no objection · evidence uploaded",
          "4 hours",
          "Certificate uploaded; confirm the date"
        ]
      ]
    ],
    [
      "Kano–Maradi SGR",
      [
        [
          "publish-project",
          "Publish project",
          "From Engr. A. Bello · gate 1",
          "1 hour",
          "PM sent the draft for publishing"
        ]
      ]
    ]
  ];
  W.NAV5 = [
    "Overview",
    "Gates",
    "Corridor",
    "Photos and reports",
    "Progress and measurement",
    "Payments",
    "Design",
    "Documents",
    "Land and community",
    "Issues and variations",
    "People",
    "Reports",
    "Activity"
  ];
  W.GATES8 = [
    [
      "1 Initiation",
      "Project manager",
      "—",
      "Director (PIN)"
    ],
    [
      "2 Feasibility",
      "Project manager",
      "NRC engineer",
      "PS and Minister"
    ],
    [
      "3 Funding route",
      "Project manager",
      "—",
      "Minister"
    ],
    [
      "4–11 Evidence",
      "Unit officers",
      "—",
      "Director confirms"
    ],
    [
      "12 Design",
      "Contractor",
      "Consultant RE",
      "NRC engineer"
    ],
    [
      "13 Certify, pay",
      "Contractor",
      "Consultant RE",
      "NRC, Dir., PS"
    ],
    [
      "14 Commissioning",
      "Contractor",
      "NRC engineer",
      "NRC"
    ],
    [
      "15 Handover",
      "NRC asset mgr",
      "—",
      "Min., NRC, A-G"
    ]
  ];
  W.STATUS_STYLE = {
    "Queued": {
      "fill": "#FFFFFF",
      "stroke": "#999999",
      "dash": true,
      "color": "#222222"
    },
    "Sent": {
      "fill": "#E6E6E6",
      "color": "#222222"
    },
    "Checked, pending RE": {
      "fill": "#FFFFFF",
      "stroke": "#666666",
      "color": "#222222"
    },
    "Pending RE": {
      "fill": "#FFFFFF",
      "stroke": "#666666",
      "color": "#222222"
    },
    "Verified": {
      "fill": "#666666",
      "color": "#FFFFFF"
    },
    "Sent back": {
      "fill": "#2F2F2F",
      "color": "#FFFFFF"
    }
  };
  const C = W.C;
  storage.P = {
    "p01": "3cbd760a-5173-8123-8008-dc54454e0e2c",
    "p02": "c44afb3c-8cdf-8002-8008-dc545e17e2a7",
    "p03": "c44afb3c-8cdf-8002-8008-dc5471855748",
    "p04": "c44afb3c-8cdf-8002-8008-dc5472b17f94",
    "p05": "c44afb3c-8cdf-8002-8008-dc5473dd6e5b",
    "p06": "c44afb3c-8cdf-8002-8008-dc5475099042",
    "p07": "c44afb3c-8cdf-8002-8008-dcc9d4d1e16b"
  };
  const p7 = storage.p7 = "c44afb3c-8cdf-8002-8008-dcc9d4d1e16b";
  const page = { get flows() { return penpot.currentPage.flows; }, createFlow: (n, b) => penpot.currentPage.createFlow(n, b) };
  storage.reg = storage.reg || {}; storage.wires = storage.wires || [];

  // ---- primitives and shared pieces (storage.W) ----
  W.start = (board) => { W.ctx = {board, bx: board.x, by: board.y, items: null, section: null, els: {}}; };

  W.add = (s) => { W.ctx.board.appendChild(s); if (W.ctx.items) W.ctx.items.push(s); return s; };

  W.nm = (n) => W.ctx.section ? `${W.ctx.section}/${n}` : n;

  W.sec = (name) => { W.ctx.section = name; W.ctx.items = []; };

  W.end = () => { const it = W.ctx.items; const name = W.ctx.section; W.ctx.items = null; W.ctx.section = null;
  if (!it || !it.length) return null; const g = penpot.group(it); g.name = name; return g; };

  W.rect = (name, x, y, w, h, o = {}) => {
  const r = penpot.createRectangle(); W.add(r);
  r.name = W.nm(name); r.resize(w, h); r.x = W.ctx.bx + x; r.y = W.ctx.by + y;
  r.fills = o.fill === null ? [] : [{fillColor: o.fill || C.white, fillOpacity: 1}];
  r.strokes = o.stroke ? [{strokeColor: o.stroke, strokeWidth: o.sw || 1, strokeAlignment: "inner", strokeStyle: o.dash ? "dashed" : "solid"}] : [];
  if (o.r) r.borderRadius = o.r;
  return r;
};

  W.ellipse = (name, x, y, w, h, o = {}) => {
  const r = penpot.createEllipse(); W.add(r);
  r.name = W.nm(name); r.resize(w, h); r.x = W.ctx.bx + x; r.y = W.ctx.by + y;
  r.fills = o.fill === null ? [] : [{fillColor: o.fill || C.white, fillOpacity: 1}];
  r.strokes = o.stroke ? [{strokeColor: o.stroke, strokeWidth: o.sw || 1, strokeAlignment: "inner", strokeStyle: o.dash ? "dashed" : "solid"}] : [];
  return r;
};

  W.text = (name, x, y, str, o) => { if (str === "" || str == null) throw new Error("empty text for " + name); return origText(name, x, y, str, o); };

  W.path = (name, d, o = {}) => {
  const p = penpot.createPath(); W.add(p);
  // translate d to absolute page coords
  const bx = W.ctx.bx, by = W.ctx.by;
  const abs = d.replace(/([ML])\s*(-?[\d.]+)[ ,](-?[\d.]+)/g, (m, c, a, b) => `${c}${+a + bx},${+b + by}`);
  p.content = abs; p.name = W.nm(name); p.fills = [];
  p.strokes = [{strokeColor: o.color || C.txt2, strokeWidth: o.sw || 2, strokeStyle: o.dash ? "dashed" : "solid", strokeAlignment: "center"}];
  return p;
};

  W.button = (name, x, y, w, h, label, kind = "secondary", o = {}) => {
  const sty = {primary: {fill: C.accent, stroke: null, col: C.white}, secondary: {fill: C.white, stroke: C.accent, col: C.accent}, danger: {fill: C.red, stroke: null, col: C.white}, ghost: {fill: C.fillSoft, stroke: null, col: C.txt}}[kind];
  const m = W.ctx.items ? W.mark() : null;
  W.rect(name + "-bg", x, y, w, h, {fill: sty.fill, stroke: sty.stroke, r: o.r ?? 6, sw: 1.5});
  W.text(name + "-label", x, y, label, {size: o.size || 15, weight: 600, color: sty.col, w, h, align: "center", valign: "center"});
  if (m === null) return null;
  const g = W.groupFrom(m, name);
  if (o.key) W.reg(o.key, g);
  return g;
};

  W.field = (name, x, y, w, label, value, o = {}) => {
  W.text(name + "-label", x, y, label, {size: 13, weight: 600, color: C.txt});
  const h = o.h || 40;
  W.rect(name + "-input", x, y + 22, w, h, {fill: o.fill || C.white, stroke: C.line, r: 4, dash: o.dash});
  W.text(name + "-value", x + 12, y + 22 + (h - 18) / 2, value, {size: 14, color: o.muted ? C.txt3 : C.txt});
  if (o.chevron) W.text(name + "-chevron", x + w - 24, y + 22 + (h - 18) / 2, "▾", {size: 14, color: C.txt2});
  if (o.hint) W.text(name + "-hint", x, y + 22 + h + 4, o.hint, {size: 12, color: C.txt2});
};

  W.newBoard = (name, x, y, w, h, fill = C.white) => { if (W.into) { const b = W.into; W.into = null; return b; } return W._newBoard0(name, x, y, w, h, fill); };

  W.card = (name, x, y, w, h, title, o = {}) => {
  W.rect(name + "-card", x, y, w, h, {fill: o.fill || C.white, stroke: C.line, r: 6});
  if (title) W.text(name + "-title", x + 16, y + 14, title, {size: 14, weight: 700});
};

  W.hr = (name, x, y, w) => W.rect(name, x, y, w, 1, {fill: C.lineSoft});

  W.checkbox = (name, x, y, on) => {
  W.rect(name + "-box", x, y, 18, 18, {fill: on ? C.txt2 : C.white, stroke: on ? null : C.txt3, r: 3, sw: 1.5});
  if (on) W.text(name + "-tick", x, y, "✓", {size: 12, weight: 700, color: C.white, w: 18, h: 18, align: "center", valign: "center"});
};

  W.statusBar = (dark) => {
  W.sec("status-bar");
  W.rect("bg", 0, 0, 390, 44, {fill: dark ? C.accent : C.panel});
  W.text("time", 24, 13, "10:52", {size: 15, weight: 700, color: dark ? C.white : C.txt});
  W.text("indicators", 290, 14, "▂▄▆ 4G ▭", {size: 13, color: dark ? C.white : C.txt, w: 76, align: "right"});
  W.end();
};

  W.homeBar = () => { W.sec("home-indicator"); W.rect("bar", 128, 828, 134, 5, {fill: C.txt, r: 3}); W.end(); };

  W.reg = (key, shape) => { W.ctx.els[key] = shape.id; return shape; };

  W.mark = () => W.ctx.items.length;

  W.groupFrom = (start, name) => { const arr = W.ctx.items.splice(start); const g = penpot.group(arr); g.name = W.nm(name); W.ctx.items.push(g); return g; };

  W.hot = (name, x, y, w, h) => { const r = W.rect(name, x, y, w, h, {fill: "#FFFFFF"}); r.fills = [{fillColor: "#FFFFFF", fillOpacity: 0}]; return r; };

  W.estW = (str, size, weight) => Math.ceil(str.length * size * (weight >= 600 ? 0.56 : 0.52));

  W.clickText = (name, x, y, str, o = {}, key) => {
  const m = W.mark();
  const size = o.size || 14, w = W.estW(str, size, o.weight || 400);
  const hx = o.align === "right" ? x + o.w - w : x;
  W.hot(name + "-hit", hx - 4, y - 3, w + 8, Math.round(size * 1.3) + 6);
  W.text(name, x, y, str, o);
  const g = W.groupFrom(m, name + "-link");
  if (key) W.reg(key, g);
  return g;
};

  W.chip = (name, x, y, w, label, o = {}) => {
  const h = o.h || 22;
  W.rect(name + "-chip", x, y, w, h, {fill: o.fill === undefined ? C.fillSoft : o.fill, stroke: o.stroke || null, dash: o.dash, r: h / 2, sw: o.sw || 1});
  W.text(name + "-chip-label", x, y, label, {size: o.size || 12, weight: o.weight || 600, color: o.color || C.txt, w, h, align: "center", valign: "center"});
};

  W.placeholder = (name, x, y, w, h, fill = C.fillMid) => {
  W.rect(name, x, y, w, h, {fill});
  W.path(name + "-cross-a", `M${x},${y} L${x + w},${y + h}`, {color: "#BBBBBB", sw: 1});
  W.path(name + "-cross-b", `M${x + w},${y} L${x},${y + h}`, {color: "#BBBBBB", sw: 1});
};

  W.finish = (key) => { const pid = penpot.currentPage.id; storage.reg[pid] = storage.reg[pid] || {}; storage.reg[pid][key] = {id: W.ctx.board.id, els: W.ctx.els}; return {key, id: W.ctx.board.id, els: Object.keys(W.ctx.els)}; };

  W.webHeader = (title, kicker, right1, right2) => {
  W.sec("header");
  W.rect("bar", 0, 0, 1440, 64, {fill: C.panel});
  W.rect("divider", 0, 63, 1440, 1, {fill: C.line});
  W.clickText("back-link", 24, 10, kicker, {size: 13, color: C.txt2}, "back");
  W.clickText("title", 24, 28, title, {size: 20, weight: 700}, "title");
  if (right2) {
    W.text("signed-in", 1104, 14, right1, {size: 14, weight: 600, w: 312, align: "right"});
    W.text("call-support", 1104, 34, right2, {size: 13, color: C.txt2, w: 312, align: "right"});
  } else W.text("draft-status", 1104, 22, right1, {size: 14, color: C.txt2, w: 312, align: "right"});
  W.end();
};

  W.w6Stepper = (active) => {
  const STEPS = ["Basics", "Funding route", "Geography", "People", "Documents", "Review and publish"];
  W.sec("stepper");
  W.rect("panel", 0, 64, 280, 880, {fill: C.panel});
  W.text("heading", 24, 96, "New project · 6 steps", {size: 13, weight: 600, color: C.txt2});
  STEPS.forEach((s, i) => {
    const y = 136 + i * 64, st = i < active ? "done" : i === active ? "active" : "todo";
    const key = `step-${i + 1}-${(i === 5 ? "Publish" : s).toLowerCase().replace(/ /g, "-")}`;
    if (i < STEPS.length - 1) W.rect(`${key}-connector`, 39, y + 32, 2, 32, {fill: C.line});
    const m = W.mark();
    if (st === "active") { W.rect(`${key}-highlight`, 0, y - 12, 280, 56, {fill: C.white}); W.rect(`${key}-marker`, 0, y - 12, 4, 56, {fill: C.txt2}); }
    else W.hot(`${key}-hit`, 0, y - 12, 280, 56);
    W.ellipse(`${key}-circle`, 24, y, 32, 32, {fill: st === "todo" ? C.white : C.txt2, stroke: st === "todo" ? C.line : null, sw: 1.5});
    W.text(`${key}-number`, 24, y, st === "done" ? "✓" : String(i + 1), {size: 14, weight: 600, color: st === "todo" ? C.txt2 : C.white, w: 32, h: 32, align: "center", valign: "center"});
    W.text(`${key}-name`, 72, y - 1, s, {size: 15, weight: st === "active" ? 700 : 400, color: st === "todo" ? C.txt2 : C.txt});
    W.text(`${key}-state`, 72, y + 18, {done: "Done", active: "In progress", todo: "Not started"}[st], {size: 12, color: C.txt3});
    W.reg(`step${i + 1}`, W.groupFrom(m, key));
  });
  W.end();
};

  W.w6Footer = (n, primary = "Next", pw = 120) => {
  W.sec("footer");
  W.rect("bar", 0, 944, 1440, 80, {fill: C.white});
  W.rect("divider", 0, 944, 1440, 1, {fill: C.line});
  W.button("back-button", 320, 962, 120, 44, "Back", "secondary", {key: "back-btn"});
  W.text("step-count", 460, 975, `Step ${n} of 6`, {size: 13, color: C.txt2});
  W.button("save-draft-button", 1400 - pw - 20 - 140, 962, 140, 44, "Save draft", "secondary", {key: "save"});
  W.button(primary === "Next" ? "next-button" : primary.toLowerCase().replace(/ /g, "-") + "-button", 1400 - pw, 962, pw, 44, primary, "primary", {key: "next"});
  W.end();
};

  W.w6Start = (key, x, y) => { const b = W.newBoard(`screens/${key}`, x, y, 1440, 1024, C.white); W.start(b); W.webHeader("Create project", "← Back to map", "Draft · visible to you and the Director"); return b; };

  W.mapFrame = (title, subtitle) => {
  W.rect("frame", 900, 100, 500, 804, {fill: C.fillSoft, stroke: C.line, r: 6});
  W.text("title", 916, 114, title, {size: 14, weight: 600});
  W.text("subtitle", 916, 134, subtitle, {size: 12, color: C.txt2});
  W.text("zoom-controls", 1356, 114, "+ / −", {size: 13, color: C.txt2});
};

  W.realLine = () => {
  W.path("alignment", "M1010,760 L1035,700 L1080,600 L1120,520 L1170,450 L1230,360 L1290,240", {sw: 4, color: C.txt2});
  [["kano", 1010, 760, "Kano 0+000", 1030, 752], ["katsina", 1080, 600, "Katsina 190+000", 1100, 592], ["maradi", 1290, 240, "Maradi 393+000", 1190, 206]].forEach(([k, x, y, l, lx, ly]) => {
    W.ellipse(`station-${k}`, x - 9, y - 9, 18, 18, {fill: C.white, stroke: C.txt, sw: 3});
    W.text(`station-${k}-label`, lx, ly, l, {size: 13, weight: 600});
  });
};

  W.legend = (text, dashed) => {
  W.rect("legend-bg", 916, 852, 468, 36, {fill: C.white, r: 4});
  W.path("legend-line", "M928,870 L960,870", {dash: dashed, sw: dashed ? 3 : 4, color: C.txt2});
  W.text("legend-text", 970, 861, text, {size: 12, color: C.txt2});
};

  W.stepTitle = (t, intro) => { W.text("step-title", 320, 100, t, {size: 22, weight: 700}); W.text("step-intro", 320, 132, intro, {size: 14, color: C.txt2}); };

  W.w7Start = (key, x, y) => { const b = W.newBoard(`screens/${key}`, x, y, 1440, 1024, C.white); W.start(b); W.webHeader("Tasks", "← Back to map", "Engr. H. Danjuma · Director, rail", "Call support"); return b; };

  W.w7Inbox = (selected) => {
  W.sec("inbox");
  W.rect("panel", 0, 64, 480, 960, {fill: C.bg});
  W.rect("panel-divider", 479, 64, 1, 960, {fill: C.line});
  W.text("heading", 24, 88, "Your tasks today", {size: 18, weight: 700});
  W.chip("count-badge", 176, 89, 28, String(W.INBOX.reduce((n, g) => n + g[1].length, 0)), {fill: C.txt2, color: C.white, weight: 700, size: 13});
  W.chip("done-today", 340, 86, 116, "Done today: 4", {h: 28, size: 13});
  W.text("sort", 24, 122, "Grouped by project · oldest first", {size: 13, color: C.txt2});
  let y = 152;
  W.INBOX.forEach(([proj, tasks], gi) => {
    W.text(`group-${gi + 1}-project`, 24, y, proj.toUpperCase(), {size: 12, weight: 700, color: C.txt2});
    W.text(`group-${gi + 1}-count`, 400, y, `${tasks.length} task${tasks.length > 1 ? "s" : ""}`, {size: 12, color: C.txt3, w: 56, align: "right"});
    y += 24;
    tasks.forEach(([key, type, ref, age, why]) => {
      const sel = key === selected, k = `task-${key}`, m = W.mark();
      W.rect(`${k}-card`, 16, y, 448, 92, {fill: C.white, stroke: sel ? C.txt2 : C.lineSoft, sw: sel ? 2 : 1, r: 6});
      if (sel) W.rect(`${k}-selected-marker`, 16, y, 4, 92, {fill: C.txt2});
      W.text(`${k}-type`, 32, y + 12, type, {size: 15, weight: 700});
      W.chip(`${k}-age`, 380, y + 12, 68, age);
      W.text(`${k}-project`, 32, y + 36, `${proj} · ${ref}`, {size: 13, color: C.txt2, w: 416});
      W.text(`${k}-why`, 32, y + 60, why, {size: 13, w: 350});
      W.text(`${k}-open`, 400, y + 60, "Open →", {size: 13, weight: 600, w: 48, align: "right"});
      W.reg(k, W.groupFrom(m, k));
      y += 102;
    });
    y += 10;
  });
  W.text("done-today-heading", 24, y, "DONE TODAY", {size: 12, weight: 700, color: C.txt2});
  W.text("done-today-toggle", 380, y, "4 tasks ▸", {size: 12, color: C.txt3, w: 76, align: "right"});
  W.end();
};

  W.w7Actions = (note, sec, pri) => {
  W.sec("actions");
  W.rect("bar", 480, 944, 960, 80, {fill: C.white});
  W.rect("divider", 480, 944, 960, 1, {fill: C.line});
  W.text("next-step-note", 520, 975, note, {size: 13, color: C.txt2, w: sec ? 500 : 640});
  if (sec) W.button(sec[0], 1220 - 20 - sec[2], 962, sec[2], 44, sec[1], "secondary", {key: "secondary"});
  W.button(pri[0], 1400 - pri[2], 962, pri[2], 44, pri[1], "primary", {key: "primary"});
  W.end();
};

  W.detailHead = (crumb, title, sub) => {
  W.text("breadcrumb", 520, 88, crumb, {size: 13, color: C.txt2});
  W.text("title", 520, 108, title, {size: 24, weight: 700});
  W.text("subtitle", 520, 144, sub, {size: 14, color: C.txt2});
};

  W.kv = (name, x, y, rows, kw = 150, vw = 240, gap = 28) => rows.forEach(([k, v], i) => {
  const kk = `${name}-${k.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  W.text(kk + "-key", x, y + i * gap, k, {size: 13, color: C.txt2});
  W.text(kk + "-value", x + kw, y + i * gap, v, {size: 13, w: vw});
});

  W.mStart = (key, x, y, dark) => { const b = W.newBoard(`screens/${key}`, x, y, 390, 844, C.white); W.start(b); return b; };

  W.mTopBar = (title, backLabel = "← Home") => {
  W.sec("top-bar");
  W.clickText("back", 20, 56, backLabel, {size: 14, weight: 600, color: C.txt2}, "back");
  W.text("title", 20, 80, title, {size: 22, weight: 700});
  W.end();
};

  W.group = (name, fn, key) => { const m = W.mark(); fn(); const g = W.groupFrom(m, name); if (key) W.reg(key, g); return g; };

  W.keypad = (x, y, kw, kh, gap) => {
  ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"].forEach((k, i) => {
    if (!k) return;
    const kx = x + (i % 3) * (kw + gap), ky = y + Math.floor(i / 3) * (kh + gap), nm = k === "⌫" ? "delete" : k;
    W.rect(`key-${nm}`, kx, ky, kw, kh, {fill: C.panel, r: 6});
    W.text(`key-${nm}-label`, kx, ky, k, {size: 18, weight: 600, w: kw, h: kh, align: "center", valign: "center"});
  });
};

  W.w5Start = (key, x, y, active, o = {}) => {
  const b = W.newBoard(`screens/${key}`, x, y, 1440, 1024, C.bg); W.start(b);
  W.sec("header");
  W.rect("bar", 0, 0, 1440, 96, {fill: C.accent});
  W.clickText("back-link", 24, 27, "← Back to map", {size: 13, color: "#CCCCCC"}, "back");
  W.clickText("title", 24, 50, o.title || "Kaduna–Kano SGR (203 km)", {size: 22, weight: 700, color: C.white}, "title");
  W.chip("status", 340, 54, o.statusW || 140, o.status || "Under construction", {h: 24, fill: o.statusFill || "#F2C27B", weight: o.status ? 700 : 400});
  W.text("gate", 520, 57, o.gate || "Gate 13 · 12 days at gate", {size: 14, color: C.white});
  W.text("complete", 720, 57, o.complete || "68% complete", {size: 14, color: C.white});
  W.text("in-charge", 860, 57, "In charge: Engr. A. Bello · 0803 000 0000", {size: 14, color: C.white});
  W.text("organisations", 1200, 59, o.orgs || "CCECC · TEAM Consultants", {size: 12, color: "#CCCCCC"});
  W.end();
  W.sec("left-nav");
  W.rect("panel", 0, 96, 240, 928, {fill: C.panel});
  W.NAV5.forEach((n, i) => {
    const ny = 112 + i * 44, on = i === active, off = o.draft && !on, k = `item-${i + 1}-${n.toLowerCase().replace(/ /g, "-")}`;
    W.group(k, () => {
      if (on) W.rect(`${k}-highlight`, 0, ny, 240, 40, {fill: C.navAct}); else if (!off) W.hot(`${k}-hit`, 0, ny, 240, 40);
      W.text(`${k}-label`, 24, ny + 11, `${i + 1}. ${n}`, {size: 14, weight: on ? 700 : 400, color: off ? C.txt3 : C.txt});
    }, off ? null : `nav${i + 1}`);
  });
  if (o.draft) W.text("draft-note", 24, 112 + 13 * 44 + 8, "Other sections open after publishing.", {size: 12, color: C.txt2, w: 200});
  W.end();
  return b;
};

  W.secTitle = (t, sub) => { W.text("title", 280, 124, t, {size: 18, weight: 700}); W.text("subtitle", 280, 152, sub, {size: 13, color: C.txt2}); };

  W.importSvgBoard = (key, svg, x, y) => {
  const b = W.newBoard(`screens/${key}`, x, y, 1440, 1024, C.white); W.start(b);
  const g = penpot.createShapeFromSvg(svg);
  b.appendChild(g); g.x = x; g.y = y; g.name = key;
  return {b, g};
};

  W.hotspots = (list) => {
  W.sec("prototype-hotspots");
  list.forEach(([k, hx, hy, w, h]) => W.reg(k, W.hot(k, hx, hy, w, h)));
  W.end();
};

  W._newBoard0 = (name, x, y, w, h, fill = C.white) => {
  const b = penpot.createBoard(); b.name = name; b.resize(w, h); b.x = x; b.y = y; b.fills = [{fillColor: fill, fillOpacity: 1}]; b.clipContent = true;
  penpot.root.appendChild(b);
  return b;
};

  W.handoff = (name, x, y, label, key, o = {}) => {
  const w = o.w || W.estW(label, 12, 600) + 28, h = o.h || 26;
  return W.group("handoff-" + name, () => {
    W.rect("bg", x, y, w, h, {fill: o.fill || C.white, stroke: o.stroke || C.txt2, dash: true, sw: 1.5, r: h / 2});
    W.text("label", x, y, label, {size: o.fs || 12, weight: 600, color: o.color || C.txt, w, h, align: "center", valign: "center"});
  }, key);
};

  W.matrix = (name, x, y, w, rows, o = {}) => {
  const cols = o.cols || [0, 0.27, 0.53, 0.75], rh = o.rh || 28, fs = o.fs || 11;
  const heads = o.heads || ["Gate", "Uploads", "Verifies", "Approves"];
  W.rect(name + "-header-row", x, y, w, 24, {fill: C.panel, r: 4});
  heads.forEach((h, i) => W.text(`${name}-col-${h.toLowerCase().replace(/ /g, "-")}`, x + 8 + Math.round(cols[i] * w), y + 6, h, {size: fs, weight: 700, color: C.txt2}));
  rows.forEach((r, ri) => {
    const ry = y + 24 + ri * rh, k = `${name}-row-${ri + 1}`, hi = o.highlight === ri;
    if (hi) W.rect(k + "-highlight", x, ry, w, rh, {fill: C.panel});
    if (ri) W.rect(k + "-rule", x, ry, w, 1, {fill: C.lineSoft});
    r.forEach((c, ci) => W.text(`${k}-${heads[ci].toLowerCase().replace(/ /g, "-")}`, x + 8 + Math.round(cols[ci] * w), ry + Math.round((rh - fs * 1.25) / 2), c, {size: fs, weight: ci === 0 || hi ? 600 : 400, color: c === "—" ? C.txt3 : C.txt}));
  });
  return y + 24 + rows.length * rh;
};

  W.recap = (o) => {
  const {lx, rx, cw, top, edit} = o;
  const head = (k, x, y, w, h, title, step) => {
    W.card(k, x, y, w, h, title);
    if (edit) W.clickText(k + "-edit", x + w - 48, y + 14, "Edit", {size: 13, weight: 700}, "edit" + step);
  };
  let y = top;
  W.sec("recap-basics");
  head("basics", lx, y, cw, 166, "1. Basics", 1);
  W.kv("basics", lx + 16, y + 44, [["Name", "Kano–Maradi Standard Gauge Railway"], ["Type", "New line · standard gauge"], ["Route", "Kano to Maradi (Niger border)"], ["States", "Kano, Jigawa, Katsina"], ["Origin", "Master plan"]], 96, cw - 128, 23);
  W.end();
  y += 182;
  W.sec("recap-funding-route");
  head("funding", lx, y, cw, 124, "2. Funding route", 2);
  W.text("funding-route", lx + 16, y + 42, "External loan · 15 gates from the external-loan template", {size: 13});
  const gw = Math.floor((cw - 32 - 14 * 4) / 15);
  for (let i = 0; i < 15; i++) {
    const gx = lx + 16 + i * (gw + 4);
    W.rect(`gate-${i + 1}`, gx, y + 66, gw, 24, {fill: i === 0 ? C.txt2 : C.white, stroke: i === 0 ? null : C.line, r: 3});
    W.text(`gate-${i + 1}-number`, gx, y + 66, String(i + 1), {size: 11, weight: 600, color: i === 0 ? C.white : C.txt3, w: gw, h: 24, align: "center", valign: "center"});
  }
  W.text("gate-caption", lx + 16, y + 98, "Gate 1 awaiting the Director · gates 2 to 15 not started", {size: 12, color: C.txt2});
  W.end();
  y += 140;
  W.sec("recap-geography");
  head("geography", lx, y, cw, 196, "3. Geography", 3);
  W.kv("geography", lx + 16, y + 44, [["File", "Kano–Maradi.kmz"], ["Length", "393 km · 688 points"], ["Corridor", "500 m buffer each side"]], 96, 170, 23);
  W.text("stations-key", lx + 16, y + 118, "Stations", {size: 13, color: C.txt2});
  ["Kano · km 0+000 · terminal", "Katsina · km 190+000 · station", "Maradi · km 393+000 · terminal"].forEach((s, i) => W.text(`station-${i + 1}`, lx + 112, y + 118 + i * 22, s, {size: 13}));
  if (cw >= 500) {
    const mx = lx + cw - 156, my = y + 44;
    W.rect("mini-map", mx, my, 140, 136, {fill: C.fillSoft, r: 4});
    W.path("mini-map-line", `M${mx + 24},${my + 116} L${mx + 60},${my + 70} L${mx + 116},${my + 22}`, {sw: 3, color: C.txt2});
    [[24, 116], [60, 70], [116, 22]].forEach(([px, py], i) => W.ellipse(`mini-map-station-${i + 1}`, mx + px - 5, my + py - 5, 10, 10, {fill: C.white, stroke: C.txt, sw: 2}));
  }
  W.end();
  y += 212;
  W.sec("recap-documents");
  head("documents", lx, y, cw, 170, "5. Documents", 5);
  [["D01", "Concept note", "Kano-Maradi concept note v3.pdf · 2.4 MB"], ["D02", "Minister's approval minute", "Evidence for gate 1 · v1 · 640 KB"]].forEach(([c, t, m], i) => {
    const yy = y + 42 + i * 50, k = c.toLowerCase();
    W.rect(`${k}-row`, lx + 16, yy, cw - 32, 44, {fill: C.bg, r: 4});
    W.chip(`${k}-code`, lx + 28, yy + 11, 44, c, {fill: C.fillMid});
    W.text(`${k}-title`, lx + 84, yy + 5, t, {size: 13, weight: 700});
    W.text(`${k}-meta`, lx + 84, yy + 23, m, {size: 12, color: C.txt2});
    if (o.open) W.clickText(`${k}-open`, lx + cw - 64, yy + 13, "Open", {size: 13, weight: 600}, "open-" + k);
  });
  W.text("documents-note", lx + 16, y + 144, "D02 is evidence for gate 1, not an in-system approval.", {size: 12, color: C.txt2});
  W.end();
  W.sec("recap-people");
  head("people", rx, top, cw, 448, "4. People", 4);
  W.kv("people", rx + 16, top + 44, [["Project manager", "Engr. A. Bello · owner"], ["Director, rail", "Engr. H. Danjuma · publishes"], ["NRC engineer", "Engr. F. Musa"]], 130, cw - 162, 23);
  W.text("matrix-title", rx + 16, top + 128, "Who does what at each gate", {size: 13, weight: 700});
  W.text("matrix-source", rx + 16, top + 148, "Generated from the external-loan template · names fill in at gate 8", {size: 12, color: C.txt2});
  W.matrix("matrix", rx + 16, top + 176, cw - 32, W.GATES8, {highlight: 0});
  W.end();
  W.sec("recap-who-approves");
  const wy = top + 464;
  W.rect("bg", rx, wy, cw, 240, {fill: C.panel, r: 6});
  W.text("title", rx + 16, wy + 14, "Who approves publishing", {size: 14, weight: 700});
  [o.self ? "The Director, rail publishes with a PIN; that confirms gate 1." : "You publish with your PIN; that confirms gate 1.",
   "Evidence: D02, the Minister's approval minute. It is not an in-system approval.",
   o.self ? "You created this project, so you cannot publish it." : "Engr. A. Bello created it, so cannot publish it.",
   "The NRC alignment check is optional and never blocks publishing.",
   "The PS and the Minister see it after publishing; they do not approve it."].forEach((t, i) => {
    W.text(`point-${i + 1}-bullet`, rx + 16, wy + 44 + i * 38, "•", {size: 13, color: C.txt2});
    W.text(`point-${i + 1}`, rx + 30, wy + 44 + i * 38, t, {size: 13, w: cw - 48});
  });
  W.end();
};

  W.adminNav = (activeIdx) => {
  W.sec("admin-nav");
  W.rect("panel", 0, 64, 220, 960, {fill: C.panel});
  ["Organisations", "Users", "Roles and permissions", "Gate templates", "Reference data", "Map and layers", "Reminders", "Audit log", "Integrations and health", "Security desk console"].forEach((n, i) => {
    const ny = 88 + i * 44, active = i === activeIdx, k = `s${i + 1}-${n.toLowerCase().replace(/ /g, "-")}`;
    W.group(k, () => {
      if (active) { W.rect(`${k}-highlight`, 0, ny, 220, 40, {fill: C.white}); W.rect(`${k}-marker`, 0, ny, 4, 40, {fill: C.txt2}); }
      else if (i < 2) W.hot(`${k}-hit`, 0, ny, 220, 40);
      W.text(`${k}-code`, 20, ny + 11, `S${i + 1}`, {size: 12, weight: 700, color: active ? C.txt : C.txt3});
      W.text(`${k}-label`, 52, ny + 10, n, {size: 14, weight: active ? 700 : 400, color: active ? C.txt : C.txt2});
    }, i < 2 && !active ? "admin" + (i + 1) : null);
  });
  W.end();
};

  W.statusChip = (name, x, y, w, label) => { const s = W.STATUS_STYLE[label]; W.chip(name, x, y, w, label, {h: 22, size: 11, fill: s.fill, stroke: s.stroke, dash: s.dash, color: s.color, sw: 1}); };

  W.photoStatus = (sent) => {
  W.sec("photo-status");
  W.group("photo-status-strip", () => {
    W.rect("bg", 20, 610, 350, 92, {fill: C.panel, r: 8});
    W.text("title", 36, 620, "Your photos", {size: 13, weight: 700, color: C.txt2});
    W.text("last-sync", 196, 620, sent ? "Last sync just now ›" : "Last sync 10:47 ›", {size: 12, color: C.txt2, w: 158, align: "right"});
    [["Queued", sent ? "0" : "1"], ["Sent", sent ? "4" : "3"], ["Verified", "12"], ["Sent back", "2"]].forEach(([l, n], i) => {
      const sx = 28 + i * 84, k = l.toLowerCase().replace(/ /g, "-");
      W.rect(`${k}-cell`, sx, 644, 78, 48, {fill: C.white, stroke: i === 3 ? C.txt : (sent && i === 1 ? C.txt2 : null), sw: 1.5, r: 6});
      W.text(`${k}-count`, sx + 10, 646, n, {size: 18, weight: 700});
      W.text(`${k}-label`, sx + 10, 671, l, {size: 11, color: C.txt2});
    });
  }, "outbox");
  W.end();
};

  W.w3Additions = (b) => {
  const svgTexts = W.U.findShapes(s => s.name === "svg-text", b);
  const old = svgTexts[17];
  if (old) { old.hidden = true; old.name = "svg-text (hidden; replaced by tasks/confirm-gate-title)"; }
  W.sec("tasks");
  W.text("confirm-gate-title", 32, 145, "Confirm gate: BPP no objection", {size: 14, weight: 700, color: "#111111"});
  W.end();
  const old2 = svgTexts[18];
  if (old2) { old2.hidden = true; old2.name = "svg-text (hidden; replaced by tasks/confirm-gate-project)"; }
  W.U.findShapes(s => s.type === "path" && Math.round(s.x - b.x) === 930 && Math.round(s.y - b.y) === 220, b).forEach(p => { p.hidden = true; p.name = "svg-path (hidden; Kano–Maradi is now the draft corridor)"; });
  W.sec("tasks-2");
  W.text("confirm-gate-project", 32, 170, "Lagos–Calabar · waiting 3 days", {size: 12, color: "#666666"});
  W.end();
  W.sec("draft-corridor");
  W.path("line", "M930,330 L860,272 L952,222", {sw: 4, dash: true, color: "#8A8A8A"});
  W.ellipse("katsina-station", 855, 267, 10, 10, {fill: C.white, stroke: "#8A8A8A", sw: 2});
  W.chip("label", 700, 246, 120, "Draft · Kano–Maradi", {h: 22, fill: C.white, stroke: "#8A8A8A", dash: true, size: 11});
  W.text("visibility-note", 700, 274, "Only you and the Director see it", {size: 11, color: "#333333"});
  W.reg("draft-corridor", W.hot("hit", 716, 214, 250, 120));
  W.end();
  W.sec("top-bar-additions");
  W.group("portfolio-link (executive roles)", () => {
    W.rect("bg", 296, 16, 112, 32, {fill: "#2F2F2F", stroke: "#9A9A9A", r: 6});
    W.text("label", 296, 16, "Portfolio", {size: 14, weight: 600, color: C.white, w: 112, h: 32, align: "center", valign: "center"});
  }, "portfolio");
  W.group("drafts-chip (pm and director roles)", () => {
    W.rect("bg", 428, 16, 116, 32, {fill: "#4A4A4A", stroke: "#CCCCCC", dash: true, r: 16});
    W.text("label", 428, 16, "Drafts (1)", {size: 14, color: C.white, w: 116, h: 32, align: "center", valign: "center"});
  }, "drafts");
  W.end();
  W.sec("prototype-hotspots-added");
  W.reg("blocker", W.hot("blocker-line", 1058, 648, 240, 22));
  W.end();
};

  W.U = class e{static shapeStructure(e,t=void 0){let n;(t===void 0||t>0)&&`children`in e&&e.children&&(n=e.children.map(e=>this.shapeStructure(e,t===void 0?void 0:t-1)));let r={id:e.id,name:e.name,type:e.type};if(`flex`in e&&e.flex){let t=e.flex;r.layout={type:`flex`,dir:t.dir,rowGap:t.rowGap,columnGap:t.columnGap}}else if(`grid`in e&&e.grid){let t=e.grid;r.layout={type:`grid`,rows:t.rows,columns:t.columns,rowGap:t.rowGap,columnGap:t.columnGap}}if(e.isComponentInstance()){r.componentInstance={};let t=e.component();if(t){r.componentInstance.componentId=t.id,r.componentInstance.componentName=t.name;let e=t.mainInstance();e&&(r.componentInstance.mainInstanceId=e.id)}}return r.children=n,r}static findShapes(e,t=null){let n=[],r=function(t){if(t&&`children`in t&&t.children)for(let i of t.children)e(i)&&n.push(i),r(i)};if(t===null){let e=penpot.currentFile?.pages;if(e)for(let t of e)r(t.root)}else r(t);return n}static findShape(e,t=null){let n=function(t){if(!t)return null;if(e(t))return t;if(`children`in t&&t.children)for(let e of t.children){let t=n(e);if(t)return t}return null};if(t===null){let e=penpot.currentFile?.pages;if(e)for(let t of e){let e=n(t.root);if(e)return e}return null}return n(t)}static findShapeById(e){return this.findShape(t=>t.id===e)}static findPage(e){return penpot.currentFile.pages.find(e)||null}static getPages(){return penpot.currentFile.pages.map(e=>({id:e.id,name:e.name}))}static getPageById(e){return this.findPage(t=>t.id===e)}static getPageByName(e){return this.findPage(t=>t.name.toLowerCase()===e.toLowerCase())}static getPageForShape(e){for(let t of penpot.currentFile.pages)if(t.getShapeById(e.id))return t;return null}static generateCss(e){let t=this.getPageForShape(e);if(!t)throw Error(`Shape is not part of any page`);return penpot.openPage(t),penpot.generateStyle([e],{type:`css`,includeChildren:!0})}static getBounds(e){return e.type===`text`?e.textBounds:e.bounds}static isContainedIn(e,t){let n=this.getBounds(e),r=this.getBounds(t);return n.x>=r.x&&n.y>=r.y&&n.x+n.width<=r.x+r.width&&n.y+n.height<=r.y+r.height}static setParentXY(e,t,n){if(!e.parent)throw Error(`Shape has no parent - cannot set parent-relative position`);e.x=e.parent.x+t,e.y=e.parent.y+n}static addFlexLayout(e,t){let n=(`children`in e&&e.children?[...e.children]:[]).sort((e,n)=>t===`row`?e.x-n.x:e.y-n.y),r=e.addFlexLayout();r.dir=t;for(let e of n)e.setParentIndex(0);return r}static analyzeDescendants(e,t,n=void 0){let r=[],i=(a,o)=>{let s=t(e,a);if(s!=null&&r.push({shape:a,result:s}),(n===void 0||o<n)&&`children`in a&&a.children)for(let e of a.children)i(e,o+1)};if(`children`in e&&e.children)for(let t of e.children)i(t,1);return r}static base64ToByteArray(e){let t=atob(e),n=new Uint8Array(t.length);for(let e=0;e<t.length;e++)n[e]=t.charCodeAt(e);return n}static async importImage(t,n,r,i,a,o,s){let c=e.base64ToByteArray(t),l=await penpot.uploadMediaData(r,c,n),u=penpot.createRectangle();u.name=r;let d,f,p=o!==void 0,m=s!==void 0;return p&&m?(d=o,f=s):p?(d=o,f=d*(l.height/l.width)):m?(f=s,d=f*(l.width/l.height)):(d=l.width,f=l.height),u.resize(d,f),i!==void 0&&(u.x=i),a!==void 0&&(u.y=a),u.fills=[{fillOpacity:1,fillImage:l}],u}static async exportImage(e,t,n){switch(await new Promise(e=>setTimeout(e,200)),t){case`shape`:return e.export({type:n?`svg`:`png`});case`fill`:if(n)throw Error(`Image fills cannot be exported as SVG`);if(!(`fills`in e))throw Error("Shape with `fills` member is required for fill export mode");let r=e.fills;for(let e of r)if(e.fillImage)return e.fillImage.data();throw Error(`No fill with image data found in the shape`);default:throw Error(`Unsupported export mode: ${t}`)}}static findTokensByName(e){let t=[],n=penpot.library.local.tokens;for(let r of n.sets)for(let n of r.tokens)n.name===e&&t.push(n);return t}static findTokenByName(e){let t=penpot.library.local.tokens;for(let n of t.sets)for(let t of n.tokens)if(t.name===e)return t;return null}static getTokenSet(e){let t=penpot.library.local.tokens;for(let n of t.sets)if(n.tokens.includes(e))return n;return null}static createVariantContainer(e){let t=[];for(let{properties:n}of e)for(let e of Object.keys(n))t.includes(e)||t.push(e);let n=penpot.createVariantFromComponents(e.map(e=>e.shape)),r=n.variants;if(!r)throw Error("createVariantContainer: the created container has no `variants`. Ensure every provided shape is a main component instance (Board).");for(let e=0;e<t.length;e++)e===0?r.renameProperty(0,t[0]):(r.addProperty(),r.renameProperty(e,t[e]));let i=r.variantComponents();for(let n=0;n<i.length;n++){let r=i[n];if(!penpot.utils.types.isVariantComponent(r))continue;let a=e[n]?.properties??{};for(let e=0;e<t.length;e++){let n=a[t[e]];n!==void 0&&r.setVariantProperty(e,n)}}return n}static tokenOverview(){let e={},t=penpot.library.local.tokens;for(let n of t.sets){let t={};for(let e of n.tokens){let n=e.type;t[n]||(t[n]=[]),t[n].push(e.name)}e[n.name]=t}return e}};

  // ---- board builders (storage.B) ----
  B["w6-create-project"] = (x, y) => {
  const b = W.w6Start("w6-create-project", x, y); W.w6Stepper(0);
  W.sec("form");
  W.stepTitle("1. Basics", "Name the project and set the two ends of the line. States crossed fill in automatically.");
  W.field("project-name", 320, 176, 540, "Project name", "Kano–Maradi Standard Gauge Railway");
  W.field("project-type", 320, 258, 260, "Type", "New line", {chevron: true, hint: "New line, rehabilitation, extension, station"});
  W.field("gauge", 600, 258, 260, "Gauge", "Standard gauge (1,435 mm)", {chevron: true});
  W.field("start-town", 320, 358, 260, "Start town", "Kano", {chevron: true});
  W.field("end-town", 600, 358, 260, "End town", "Maradi", {chevron: true});
  W.text("states-crossed-label", 320, 440, "States crossed", {size: 13, weight: 600});
  W.text("states-crossed-tag", 424, 441, "Auto-filled from the line", {size: 12, color: C.txt2});
  W.rect("states-crossed-box", 320, 462, 540, 44, {fill: C.panel, stroke: C.lineSoft, r: 4});
  ["Kano", "Jigawa", "Katsina"].forEach((s, i) => W.chip(`states-crossed-${s.toLowerCase()}`, 332 + i * 96, 470, 84, s, {h: 28, size: 13, weight: 400}));
  W.text("states-crossed-lock", 795, 475, "Read only", {size: 12, color: C.txt3});
  W.field("origin-reference", 320, 530, 540, "Origin reference", "Master plan", {chevron: true, hint: "Master plan, directive, state request, unsolicited proposal"});
  W.text("concept-note-label", 320, 630, "Concept note", {size: 13, weight: 600});
  W.rect("concept-note-dropzone", 320, 652, 540, 120, {fill: C.bg, stroke: C.line, r: 6, dash: true, sw: 1.5});
  W.text("concept-note-icon", 320, 672, "⇪", {size: 24, color: C.txt2, w: 540, align: "center"});
  W.text("concept-note-prompt", 320, 708, "Drag the concept note here or browse", {size: 14, weight: 600, w: 540, align: "center"});
  W.text("concept-note-hint", 320, 732, "PDF or Word, up to 20 MB · stored as D01 against gate 1", {size: 12, color: C.txt2, w: 540, align: "center"});
  W.end();
  W.sec("map-preview");
  W.mapFrame("Map preview", "Placeholder line until the alignment is uploaded in Geography");
  W.path("route-placeholder", "M1010,760 L1290,240", {dash: true, sw: 3, color: C.txt2});
  W.ellipse("start-pin", 1001, 751, 18, 18, {fill: C.white, stroke: C.txt2, sw: 2});
  W.text("start-label", 1030, 752, "Kano (start)", {size: 13, weight: 600});
  W.ellipse("end-pin", 1281, 231, 18, 18, {fill: C.white, stroke: C.txt2, sw: 2});
  W.text("end-label", 1200, 206, "Maradi (end)", {size: 13, weight: 600});
  W.legend("Placeholder line between the start and end towns", true);
  W.end();
  W.w6Footer(1);
  return W.finish("w6-create-project");
};

  B["w6-funding-route"] = (x, y) => {
  W.w6Start("w6-funding-route", x, y); W.w6Stepper(1);
  W.sec("funding-tiles");
  W.stepTitle("2. Funding route", "Pick how the project is paid for. The 15 gates are created from that route's template when you press Next.");
  const tiles = [["Budget", "Federal capital budget. National Assembly appropriation is the gate 4 evidence."],
    ["External loan", "China Exim, AfDB or similar. FEC, Senate and House, then the lender's board at gate 4."],
    ["PPP", "ICRC outline and full business case certificates, then FEC or the Project Approval Board."],
    ["State or private", "A state government or private sponsor. Their funding agreement is the evidence."]];
  tiles.forEach(([t, d], i) => {
    const tx = 320 + i * 275, sel = i === 1, k = `tile-${t.toLowerCase().replace(/ /g, "-")}`;
    const m = W.mark();
    W.rect(`${k}-bg`, tx, 176, 255, 184, {fill: sel ? C.panel : C.white, stroke: sel ? C.txt : C.line, sw: sel ? 2 : 1, r: 8});
    W.rect(`${k}-icon`, tx + 20, 196, 40, 40, {fill: sel ? C.txt2 : C.fillMid, r: 6});
    if (sel) { W.ellipse(`${k}-check-bg`, tx + 215, 196, 24, 24, {fill: C.txt}); W.text(`${k}-check`, tx + 215, 196, "✓", {size: 13, weight: 700, color: C.white, w: 24, h: 24, align: "center", valign: "center"}); }
    W.text(`${k}-title`, tx + 20, 252, t, {size: 18, weight: 700});
    W.text(`${k}-description`, tx + 20, 282, d, {size: 13, color: C.txt2, w: 215});
    W.groupFrom(m, k);
  });
  W.end();
  W.sec("gate-strip-preview");
  W.rect("card", 320, 392, 1080, 268, {fill: C.white, stroke: C.line, r: 8});
  W.text("title", 344, 410, "Gate template preview · External loan · 15 gates", {size: 15, weight: 700});
  W.text("subtitle", 344, 434, "Filled circles are approved in the system; outlined circles need evidence uploaded and confirmed by the Director.", {size: 12, color: C.txt2});
  const gates = ["Initiation", "Feasibility", "Funding route", "Funding approved", "Tender", "BPP no objection", "FEC award", "Contract", "Environment", "Right-of-way", "Financial close", "Design", "Certify and pay", "Commis-sioning", "Handover"];
  const approve = [1, 2, 3, 12, 13, 14, 15];
  W.rect("strip-line", 380, 487, 960, 2, {fill: C.line});
  gates.forEach((g, i) => {
    const gx = 368 + i * 68.6, n = i + 1, ap = approve.includes(n);
    W.ellipse(`gate-${n}-circle`, gx, 476, 24, 24, {fill: ap ? C.txt2 : C.white, stroke: ap ? null : C.txt2, sw: 1.5});
    W.text(`gate-${n}-number`, gx, 476, String(n), {size: 11, weight: 700, color: ap ? C.white : C.txt, w: 24, h: 24, align: "center", valign: "center"});
    W.text(`gate-${n}-label`, gx - 20, 508, g.replace("Commis-sioning", "Commissioning"), {size: 11, color: C.txt2, w: 64, align: "center"});
  });
  W.rect("gate-4-note-bg", 344, 572, 1032, 68, {fill: C.panel, r: 6});
  W.text("gate-4-note-title", 360, 584, "Gate 4 for an external loan", {size: 13, weight: 700});
  W.text("gate-4-note", 360, 606, "Evidence: FEC conclusion, Senate and House resolutions, lender board approval. Uploaded by Finance (D07, D08); the Director confirms.", {size: 13, color: C.txt, w: 1000});
  W.end();
  W.w6Footer(2);
  return W.finish("w6-funding-route");
};

  B["w6-geography"] = (x, y) => {
  W.w6Start("w6-geography", x, y); W.w6Stepper(2);
  W.sec("form");
  W.stepTitle("3. Geography", "Upload the alignment so the real line replaces the placeholder.");
  W.text("upload-label", 320, 176, "Upload alignment", {size: 13, weight: 600});
  W.text("upload-tag", 436, 177, "KMZ or shapefile", {size: 12, color: C.txt2});
  W.rect("upload-dropzone", 320, 198, 540, 96, {fill: C.bg, stroke: C.line, r: 6, dash: true, sw: 1.5});
  W.rect("file-row", 336, 214, 508, 64, {fill: C.white, stroke: C.lineSoft, r: 4});
  W.rect("file-icon", 350, 226, 32, 40, {fill: C.fillMid, r: 3});
  W.text("file-name", 396, 226, "Kano–Maradi.kmz", {size: 14, weight: 700});
  W.text("file-parsed", 396, 248, "Parsed · 393 km · 688 points · Kano, Jigawa, Katsina states", {size: 12, color: C.txt2});
  W.clickText("file-replace", 790, 236, "Replace", {size: 13, weight: 600}, "replace");
  W.field("expected-length", 320, 314, 260, "Expected length", "393 km (from the file)", {fill: C.panel});
  W.text("keep-placeholder-note", 600, 350, "Or keep the placeholder and upload later.", {size: 12, color: C.txt2, w: 260});
  W.text("stations-label", 320, 410, "Stations", {size: 15, weight: 700});
  W.button("add-station-button", 740, 402, 120, 32, "+ Add station", "secondary", {size: 13, key: "add-station"});
  W.rect("stations-header", 320, 446, 540, 30, {fill: C.panel, r: 4});
  W.text("stations-col-name", 336, 452, "Name", {size: 12, weight: 700, color: C.txt2});
  W.text("stations-col-chainage", 560, 452, "Chainage", {size: 12, weight: 700, color: C.txt2});
  W.text("stations-col-type", 700, 452, "Type", {size: 12, weight: 700, color: C.txt2});
  [["Kano", "0+000", "Terminal"], ["Katsina", "190+000", "Station"], ["Maradi", "393+000", "Terminal"]].forEach(([n, c, t], i) => {
    const ry = 476 + i * 40;
    W.text(`station-${i + 1}-name`, 336, ry + 11, n, {size: 14});
    W.text(`station-${i + 1}-chainage`, 560, ry + 11, "km " + c, {size: 14});
    W.text(`station-${i + 1}-type`, 700, ry + 11, t, {size: 14, color: C.txt2});
    W.rect(`station-${i + 1}-rule`, 320, ry + 39, 540, 1, {fill: C.lineSoft});
  });
  W.rect("nrc-check-bg", 320, 616, 540, 88, {fill: C.panel, r: 6});
  W.button("ask-nrc-button", 336, 632, 200, 36, "Ask NRC to check", "secondary", {size: 14, key: "ask-nrc"});
  W.text("ask-nrc-optional", 552, 641, "Optional", {size: 12, color: C.txt2});
  W.text("ask-nrc-note", 336, 676, "Sends Check alignment to the NRC engineer. You can carry on without waiting.", {size: 12, color: C.txt2});
  W.end();
  W.sec("map-preview");
  W.mapFrame("Map preview", "Real alignment from Kano–Maradi.kmz with three stations");
  W.realLine();
  W.legend("Alignment from the uploaded file · 393 km", false);
  W.end();
  W.w6Footer(3);
  return W.finish("w6-geography");
};

  B["w6-people"] = (x, y) => {
  W.w6Start("w6-people", x, y); W.w6Stepper(3);
  W.sec("form");
  W.stepTitle("4. People", "Who runs the project. The person in charge shows on the map's hover card.");
  const person = (k, y0, role, tag, name, detail, locked) => {
    W.rect(`${k}-card`, 320, y0, 540, 84, {fill: locked ? C.panel : C.white, stroke: C.line, r: 6});
    W.rect(`${k}-avatar`, 336, y0 + 18, 48, 48, {fill: C.fillMid, r: 24});
    W.text(`${k}-role`, 400, y0 + 14, role, {size: 12, weight: 700, color: C.txt2});
    W.text(`${k}-name`, 400, y0 + 32, name, {size: 16, weight: 700});
    W.text(`${k}-detail`, 400, y0 + 54, detail, {size: 12, color: C.txt2});
    W.chip(`${k}-tag`, 740, y0 + 14, 104, tag, {fill: locked ? C.white : C.fillSoft});
  };
  person("project-manager", 176, "PROJECT MANAGER · OWNER", "Prefilled (you)", "Engr. A. Bello", "FMoT Rail directorate · 0803 000 0000", false);
  person("director", 276, "DIRECTOR, RAIL", "Automatic", "Engr. H. Danjuma", "Added to every rail project · cannot be removed", true);
  W.text("director-lock", 790, 330, "Locked", {size: 12, color: C.txt3});
  W.text("nrc-label", 320, 384, "NRC project engineer", {size: 13, weight: 600});
  W.rect("nrc-picker", 320, 406, 540, 40, {fill: C.white, stroke: C.line, r: 4});
  W.text("nrc-picker-value", 332, 416, "Search NRC engineers", {size: 14, color: C.txt3});
  W.text("nrc-picker-chevron", 836, 416, "▾", {size: 14, color: C.txt2});
  W.rect("nrc-chosen-card", 320, 454, 540, 64, {fill: C.white, stroke: C.txt2, sw: 1.5, r: 6});
  W.rect("nrc-chosen-avatar", 336, 466, 40, 40, {fill: C.fillMid, r: 20});
  W.text("nrc-chosen-name", 390, 466, "Engr. F. Musa", {size: 15, weight: 700});
  W.text("nrc-chosen-detail", 390, 488, "NRC Kano district · 0806 771 0452", {size: 12, color: C.txt2});
  W.clickText("nrc-chosen-change", 800, 478, "Change", {size: 13, weight: 600}, "change-nrc");
  W.rect("later-note-bg", 320, 542, 540, 64, {fill: C.panel, r: 6});
  W.text("later-note", 336, 554, "Consultant and contractor organisations are added at gate 8, when the lots are created. The Director confirms external organisations.", {size: 13, w: 508});
  W.end();
  W.sec("map-preview");
  W.mapFrame("Map preview", "The person in charge appears on the hover card");
  W.realLine();
  W.rect("hover-card", 1110, 620, 260, 104, {fill: C.white, stroke: C.line, r: 6});
  W.text("hover-card-name", 1124, 632, "Kano–Maradi SGR", {size: 14, weight: 700});
  W.text("hover-card-status", 1124, 654, "Draft · 0% complete", {size: 12, color: C.txt2});
  W.text("hover-card-in-charge", 1124, 674, "In charge: Engr. A. Bello", {size: 12});
  W.text("hover-card-phone", 1124, 692, "0803 000 0000", {size: 12, color: C.txt2});
  W.legend("Alignment from the uploaded file · 393 km", false);
  W.end();
  W.sec("responsibility-matrix");
  W.card("matrix", 320, 622, 540, 300, "Who does what at each gate");
  W.text("matrix-source", 336, 656, "Generated from the external-loan template; names fill in when lots are created at gate 8.", {size: 12, color: C.txt2});
  W.matrix("matrix", 336, 684, 508, W.GATES8, {rh: 26});
  W.end();
  W.w6Footer(4);
  return W.finish("w6-people");
};

  B["w6-documents"] = (x, y) => {
  W.w6Start("w6-documents", x, y); W.w6Stepper(4);
  W.sec("form");
  W.stepTitle("5. Documents", "Attach the two gate 1 documents, then mark gate 1 passed.");
  [["d01", "D01", "Concept note", "Kano-Maradi concept note v3.pdf · 2.4 MB"], ["d02", "D02", "Minister's approval minute", "MoT approval minute 2026-118.pdf · 640 KB"]].forEach(([k, code, t, f], i) => {
    const ry = 176 + i * 92;
    W.rect(`${k}-card`, 320, ry, 540, 80, {fill: C.white, stroke: C.line, r: 6});
    W.chip(`${k}-code`, 336, ry + 14, 48, code, {fill: C.fillMid});
    W.text(`${k}-title`, 396, ry + 14, t, {size: 15, weight: 700});
    W.text(`${k}-file`, 396, ry + 38, f, {size: 12, color: C.txt2});
    W.text(`${k}-attached`, 396, ry + 56, "✓ Attached 28 Oct 2026", {size: 12, weight: 600});
    W.clickText(`${k}-replace`, 790, ry + 30, "Replace", {size: 13, weight: 600}, `replace-${k}`);
  });
  W.rect("gate-1-card", 320, 368, 540, 196, {fill: C.panel, r: 6});
  W.text("gate-1-title", 336, 384, "Gate 1 · Initiation", {size: 15, weight: 700});
  W.text("gate-1-kind", 336, 406, "Approve in system · the Minister's minute (D02) is the record", {size: 12, color: C.txt2});
  W.checkbox("mark-gate-1", 336, 440, true);
  W.text("mark-gate-1-label", 364, 440, "Mark gate 1 passed", {size: 14, weight: 600});
  W.field("date-passed", 336, 474, 220, "Date passed", "21 Oct 2026");
  W.text("date-hint", 572, 506, "Gate 1 becomes Awaiting confirmation.", {size: 12, color: C.txt2, w: 272});
  W.end();
  W.sec("map-preview");
  W.mapFrame("Map preview", "Status becomes Identified once gate 1 is passed");
  W.realLine();
  W.chip("status", 1240, 852 - 44, 144, "Status: Identified", {h: 28, fill: C.white, stroke: C.txt2, sw: 1.5});
  W.legend("Alignment from the uploaded file · 393 km", false);
  W.end();
  W.w6Footer(5);
  return W.finish("w6-documents");
};

  B["w6-publish"] = (x, y) => {
  W.w6Start("w6-publish", x, y); W.w6Stepper(5);
  W.sec("intro");
  W.text("step-title", 320, 100, "6. Review and publish", {size: 22, weight: 700});
  W.text("step-intro", 320, 132, "Read the whole project once. Edit any section or preview it, then send it to the Director.", {size: 14, color: C.txt2});
  W.button("preview-map-button", 1012, 100, 172, 40, "Preview on map", "secondary", {key: "preview-map", size: 14});
  W.button("preview-page-button", 1196, 100, 204, 40, "Preview project page", "secondary", {key: "preview-page", size: 14});
  W.end();
  W.recap({lx: 320, rx: 880, cw: 520, top: 176, edit: true, self: true});
  W.w6Footer(6, "Send for publishing", 200);
  return W.finish("w6-publish");
};

  B["w7-tasks"] = (x, y, opts = {}) => {
  const key = opts.pin ? "w7-approve-ipc-pin" : "w7-tasks";
  W.w7Start(key, x, y); W.w7Inbox("approve-ipc");
  const L = 520, R = 980, CW = 420;
  W.sec("certificate");
  W.detailHead("Kaduna–Kano SGR · Gate 13 Certify and pay · W7.4", "Approve payment certificate · IPC 14", "Lot 2, km 68+000 to km 137+000 · Period September 2026 · Valuation V-14 attached");
  W.end();
  W.sec("amount");
  W.card("amount", L, 184, CW, 132, "Amount for approval");
  W.text("net-value", L + 16, 224, "₦4,812,650,000.00", {size: 32, weight: 700});
  W.text("net-caption", L + 16, 266, "Net payable after deductions", {size: 13, color: C.txt2});
  W.text("permission-note", L + 16, 288, "Shown because you hold the financial-amounts permission", {size: 12, color: C.txt3});
  W.end();
  W.sec("measurement");
  W.card("measurement", L, 336, CW, 208, "Measurement summary");
  W.text("source", L + 16, 372, "From verified measurement sheet MS-09 (RE, 30 Sep)", {size: 12, color: C.txt2});
  W.text("col-discipline", L + 16, 398, "Discipline", {size: 12, weight: 600, color: C.txt2});
  W.text("col-period", L + 200, 398, "This period", {size: 12, weight: 600, color: C.txt2, w: 90, align: "right"});
  W.text("col-cumulative", L + 306, 398, "To date", {size: 12, weight: 600, color: C.txt2, w: 98, align: "right"});
  W.rect("header-rule", L + 16, 418, CW - 32, 1, {fill: C.lineSoft});
  [["Earthworks", "42,300 m³", "61%"], ["Bridges and culverts", "3 culverts", "48%"], ["Track laying", "6.4 km", "22%"], ["Stations", "Zaria 15%", "9%"]].forEach(([d, p, c], i) => {
    const yy = 428 + i * 28;
    W.text(`row-${i + 1}-discipline`, L + 16, yy, d, {size: 13});
    W.text(`row-${i + 1}-period`, L + 200, yy, p, {size: 13, w: 90, align: "right"});
    W.text(`row-${i + 1}-cumulative`, L + 306, yy, c, {size: 13, w: 98, align: "right"});
  });
  W.end();
  W.sec("photos");
  W.card("photos", L, 564, CW, 104, "Verified photos this period");
  W.text("count", L + 16, 598, "186", {size: 32, weight: 700});
  W.text("breakdown", L + 92, 612, "verified · 4 flagged · 0 sent back", {size: 13, color: C.txt2});
  W.text("view-link", L + 16, 642, "View photos by chainage →", {size: 13, weight: 600});
  W.end();
  W.sec("deductions");
  W.card("deductions", L, 688, CW, 232, "Deductions");
  [["Gross value this certificate", "₦5,620,400,000"], ["Retention (5%)", "− ₦281,020,000"], ["Advance recovery (8%)", "− ₦449,632,000"], ["Previous overpayment", "− ₦77,098,000"], ["Total deductions", "− ₦807,750,000"], ["Net payable", "₦4,812,650,000"]].forEach(([k2, v], i) => {
    const yy = 730 + i * 30, bold = i >= 4;
    if (i === 4) W.rect("total-rule", L + 16, yy - 6, CW - 32, 1, {fill: C.lineSoft});
    W.text(`row-${i + 1}-label`, L + 16, yy, k2, {size: 13, weight: bold ? 700 : 400});
    W.text(`row-${i + 1}-value`, L + 220, yy, v, {size: 13, weight: bold ? 700 : 400, w: 184, align: "right"});
  });
  W.end();
  W.sec("approval-chain");
  W.card("approval-chain", R, 184, CW, 360, "Approval chain");
  W.text("rule-note", R + 16, 228, "Four different people from three organisations", {size: 12, color: C.txt2});
  [["Submitted", "Li Wei · CCECC commercial manager", "20 Oct 2026", "done"], ["Recommended", "Engr. K. Adeyemi · TEAM Consultants RE", "24 Oct 2026", "done"], ["Certified", "Engr. F. Musa · NRC project engineer", "28 Oct 2026", "done"], ["Approved (ministry)", "You · Director, rail", "Waiting 1 day", "current"], ["Approved (final)", "Permanent Secretary", "Next", "todo"], ["Paid", "Finance officer", "After approval", "todo"]].forEach(([step, who, when, st], i) => {
    const yy = 256 + i * 48;
    if (i < 5) W.rect(`step-${i + 1}-connector`, R + 27, yy + 22, 2, 26, {fill: C.line});
    W.ellipse(`step-${i + 1}-dot`, R + 18, yy + 2, 20, 20, {fill: st === "done" ? C.txt2 : C.white, stroke: st === "done" ? null : (st === "current" ? C.txt : C.line), sw: st === "current" ? 3 : 1.5});
    if (st === "done") W.text(`step-${i + 1}-tick`, R + 18, yy + 2, "✓", {size: 12, weight: 700, color: C.white, w: 20, h: 20, align: "center", valign: "center"});
    W.text(`step-${i + 1}-name`, R + 50, yy, step, {size: 14, weight: st === "todo" ? 400 : 700, color: st === "todo" ? C.txt2 : C.txt});
    W.text(`step-${i + 1}-date`, R + 260, yy + 1, when, {size: 12, weight: st === "current" ? 700 : 400, color: st === "current" ? C.txt : C.txt2, w: 144, align: "right"});
    W.text(`step-${i + 1}-person`, R + 50, yy + 20, who, {size: 12, color: C.txt2});
  });
  W.end();
  W.sec("return-reasons");
  W.card("return-reasons", R, 564, CW, 356, "Return asks for a reason");
  W.text("intro", R + 16, 602, "It goes back to Engr. F. Musa (NRC) with the reason you pick.", {size: 12, color: C.txt2, w: CW - 32});
  ["Quantities do not match verified photos", "Quantities exceed the contract BOQ", "Valuation file missing or unreadable", "Deduction calculated wrongly", "Wrong period or lot", "Other (add a short note)"].forEach((r, i) => {
    const yy = 632 + i * 40;
    W.rect(`reason-${i + 1}-row`, R + 16, yy, CW - 32, 32, {fill: C.bg, r: 4});
    W.ellipse(`reason-${i + 1}-radio`, R + 28, yy + 8, 16, 16, {fill: C.white, stroke: C.txt3, sw: 1.5});
    W.text(`reason-${i + 1}-label`, R + 54, yy + 7, r, {size: 13});
  });
  W.text("note-hint", R + 16, 884, "Nothing is lost: the certificate keeps its history.", {size: 12, color: C.txt3});
  W.end();
  W.sec("actions");
  W.rect("bar", 480, 944, 960, 80, {fill: C.white});
  W.rect("divider", 480, 944, 960, 1, {fill: C.line});
  W.text("next-step-note", 520, 975, "Approving sends IPC 14 to the Permanent Secretary and writes an audit row.", {size: 13, color: C.txt2});
  W.button("return-button", 1060, 962, 140, 44, "Return…", "secondary", {key: "secondary"});
  W.button("approve-button", 1220, 962, 180, 44, "Approve (PIN)", "primary", {key: "primary"});
  W.end();
  if (opts.pin) {
    W.sec("pin-sheet");
    const s = W.rect("scrim", 0, 0, 1440, 1024, {fill: "#000000"}); s.fills = [{fillColor: "#000000", fillOpacity: 0.35}];
    const sh = W.rect("sheet", 1060, 664, 340, 268, {fill: C.white, r: 10});
    sh.shadows = [{style: "drop-shadow", offsetX: 0, offsetY: 8, blur: 24, spread: 0, color: {color: "#000000", opacity: 0.2}, hidden: false}];
    W.text("title", 1084, 684, "Enter your PIN to approve", {size: 17, weight: 700});
    W.text("subtitle", 1084, 710, "IPC 14 · ₦4,812,650,000.00", {size: 13, color: C.txt2});
    [0, 1, 2, 3].forEach(i => W.ellipse(`dot-${i + 1}`, 1166 + i * 36, 752, 18, 18, {fill: C.txt}));
    W.text("dots-caption", 1084, 784, "4 of 4 digits entered", {size: 12, color: C.txt3, w: 292, align: "center"});
    W.button("confirm-button", 1084, 818, 292, 44, "Confirm", "primary", {key: "pin-confirm"});
    W.button("cancel-button", 1084, 872, 292, 40, "Cancel", "secondary", {key: "pin-cancel", size: 14});
    W.end();
  }
  if (!opts.pin) { W.sec("handoff"); W.handoff("next-valuation", 1236, 90, "Next: valuation ▸", "handoff-valuation", {w: 164}); W.end(); }
  return W.finish(key);
};

  B["w7-approve-ipc-pin"] = (x, y) => B["w7-tasks"](x, y, {pin: true});

  B["w7-publish-project"] = (x, y) => {
  W.w7Start("w7-publish-project", x, y); W.w7Inbox("publish-project");
  W.sec("publish");
  W.detailHead("Kano–Maradi SGR · Gate 1 Initiation · Publish project", "Publish project · Kano–Maradi SGR", "Sent by Engr. A. Bello (Ministry project manager) · today 09:40 · 1 hour ago");
  W.clickText("preview-map", 1220, 88, "Preview on map →", {size: 13, weight: 700, w: 180, align: "right"}, "preview-map");
  W.clickText("preview-page", 1220, 112, "Preview project page →", {size: 13, weight: 700, w: 180, align: "right"}, "preview-page");
  W.end();
  W.recap({lx: L, rx: R, cw: CW, top: 184, edit: false, self: false, open: true});
  W.w7Actions("Publishing confirms gate 1, sets status Identified and draws the corridor for every member.", ["return-button", "Return…", 140], ["publish-button", "Publish (PIN)", 180]);
  return W.finish("w7-publish-project");
};

  B["w7-confirm-account"] = (x, y) => {
  W.w7Start("w7-confirm-account", x, y); W.w7Inbox("confirm-account");
  W.sec("account");
  W.detailHead("Kaduna–Kano SGR · Lot 2 · Confirm new account · W7.8", "Confirm new account · Emeka Nwosu", "Requested by Ade Ogun (IT administrator) · today 07:15 · 3 hours ago");
  W.end();
  W.sec("person");
  W.card("person", L, 184, CW, 300, "Person");
  W.rect("avatar", L + 16, 220, 56, 56, {fill: C.fillMid, r: 28});
  W.text("name", L + 88, 226, "Emeka Nwosu", {size: 18, weight: 700});
  W.chip("status", L + 88, 254, 72, "Invited", {fill: C.white, stroke: C.txt3, dash: true});
  W.kv("person", L + 16, 300, [["Phone", "+234 812 445 0193"], ["Organisation", "CCECC (contractor)"], ["Role", "Contractor site manager"], ["Lots requested", "Kaduna–Kano SGR · Lot 2"], ["Chainage", "km 68+000 to 137+000"], ["Invite", "SMS sent 07:15, not yet accepted"]], 120, 268, 28);
  W.end();
  W.sec("why");
  W.card("why", R, 184, CW, 132, "Why you are asked");
  W.text("text", R + 16, 224, "Accounts for external organisations need the Director's confirmation. Ministry and NRC staff activate on first login.", {size: 13, w: CW - 32});
  W.end();
  W.sec("checks");
  W.card("checks", R, 336, CW, 180, "Checks");
  [["Phone number not used by another account", "ok"], ["CCECC holds a contract on Lot 2", "ok"], ["Lot 2 already has one site manager (Musa Garba)", "info"]].forEach(([t, s], i) => {
    const yy = 372 + i * 40;
    W.ellipse(`check-${i + 1}-dot`, R + 16, yy + 2, 16, 16, {fill: s === "ok" ? C.green : C.txt3});
    W.text(`check-${i + 1}-label`, R + 42, yy, t, {size: 13, w: CW - 60});
  });
  W.end();
  W.w7Actions("Confirm activates the account when Emeka logs in. Decline cancels the invite link and tells the administrator why.", ["decline-button", "Decline…", 140], ["confirm-button", "Confirm (PIN)", 180]);
  return W.finish("w7-confirm-account");
};

  B["w7-verify-photo"] = (x, y) => {
  W.w7Start("w7-verify-photo", x, y); W.w7Inbox("verify-photo");
  W.sec("photo");
  W.detailHead("Lagos–Ibadan · Lot 1 · Photos and reports · W7.1", "Verify photo · km 212+150", "Flagged: outside corridor · taken 27 Oct 2026 14:32 · 2 days in the queue");
  W.placeholder("image", L, 184, 560, 360);
  W.rect("caption-bg", L, 544, 560, 36, {fill: C.panel});
  W.text("caption", L + 12, 553, "Earthworks · voice note 0:12 ▶ · heading NE", {size: 13, color: C.txt});
  W.end();
  W.sec("submitter");
  W.card("submitter", L, 600, 560, 96, "Submitter");
  W.rect("avatar", L + 16, 636, 40, 40, {fill: C.fillMid, r: 20});
  W.text("name", L + 68, 636, "Tunde Bakare · Mota-Engil site manager", {size: 14, weight: 600});
  W.text("detail", L + 68, 656, "0816 237 9905 · bound device Tecno Spark 10", {size: 12, color: C.txt2});
  W.end();
  W.sec("previous-photo");
  W.card("previous-photo", L, 716, 560, 204, "Previous photo at this chainage");
  W.placeholder("thumbnail", L + 16, 748, 220, 156);
  W.text("meta", L + 252, 752, "km 212+150 · 13 Oct 2026", {size: 13, weight: 600});
  W.text("status", L + 252, 774, "Verified by Engr. K. Adeyemi", {size: 12, color: C.txt2});
  W.text("compare", L + 252, 802, "Compare side by side →", {size: 13, weight: 600});
  W.end();
  const X = 1100, CWs = 300;
  W.sec("corridor-inset");
  W.card("corridor-inset", X, 184, CWs, 236, "Corridor at km 212");
  W.rect("map", X + 16, 214, CWs - 32, 160, {fill: C.fillSoft, r: 4});
  W.path("buffer-left", "M1130,370 L1360,230", {dash: true, sw: 1, color: C.txt3});
  W.path("buffer-right", "M1150,382 L1380,242", {dash: true, sw: 1, color: C.txt3});
  W.path("alignment", "M1140,376 L1370,236", {sw: 3, color: C.txt2});
  W.ellipse("photo-dot", 1290, 236, 14, 14, {fill: C.amber, stroke: C.white, sw: 2});
  W.text("note", X + 16, 384, "Dot is 180 m outside the 100 m buffer", {size: 12, weight: 600});
  W.end();
  W.sec("checks");
  W.card("checks", X, 440, CWs, 212, "Automatic checks");
  [["Inside corridor", "Amber · 180 m out", C.amber], ["Time", "Green · 14:32, working hours", C.green], ["Device", "Green · bound, no mock GPS", C.green], ["Duplicate", "Green · no match", C.green]].forEach(([k, v, col], i) => {
    const yy = 476 + i * 42;
    W.ellipse(`check-${i + 1}-dot`, X + 16, yy + 3, 14, 14, {fill: col});
    W.text(`check-${i + 1}-name`, X + 40, yy, k, {size: 13, weight: 700});
    W.text(`check-${i + 1}-value`, X + 40, yy + 18, v, {size: 12, color: C.txt2});
  });
  W.end();
  W.w7Actions("Verify counts it toward progress and this month's measurement. Send back returns it to the site manager.", ["send-back-button", "Send back…", 140], ["verify-button", "Verify", 160]);
  return W.finish("w7-verify-photo");
};

  B["w7-upload-document"] = (x, y) => {
  W.w7Start("w7-upload-document", x, y); W.w7Inbox("upload-document");
  W.sec("upload");
  W.detailHead("Lagos–Calabar coastal · Gate 6 BPP no objection · W7.7", "Upload document · BPP Certificate of No Objection", "Asked of Procurement · due in 2 days · 1 day in the queue");
  W.end();
  W.sec("expected");
  W.card("expected", L, 184, 880, 132, "Expected document");
  W.kv("expected-left", L + 16, 218, [["Document", "BPP Certificate of No Objection"], ["Register code", "D11"], ["Gate", "6 · BPP no objection (attach evidence)"]], 120, 300, 28);
  W.kv("expected-right", L + 460, 218, [["Sensitivity", "Internal"], ["Confirmer", "Director, rail"], ["Version", "1 (first upload)"]], 110, 290, 28);
  W.end();
  W.sec("file");
  W.text("label", L, 340, "File", {size: 13, weight: 600});
  W.rect("dropzone", L, 362, 880, 120, {fill: C.bg, stroke: C.line, r: 6, dash: true, sw: 1.5});
  W.rect("file-row", L + 16, 384, 848, 76, {fill: C.white, stroke: C.lineSoft, r: 4});
  W.rect("file-icon", L + 32, 398, 36, 48, {fill: C.fillMid, r: 3});
  W.text("file-name", L + 84, 402, "BPP-CNO-LC-2026-044.pdf", {size: 15, weight: 700});
  W.text("file-meta", L + 84, 426, "1.1 MB · 2 pages · chosen just now", {size: 12, color: C.txt2});
  W.clickText("change-file", L + 780, 412, "Change file", {size: 13, weight: 600}, "change-file");
  W.end();
  W.sec("date");
  W.field("document-date", L, 506, 260, "Date on the document", "24 Oct 2026");
  W.text("date-hint", L + 280, 538, "The date the gate counts as passed once the Director confirms.", {size: 12, color: C.txt2});
  W.end();
  W.sec("what-happens");
  W.rect("bg", L, 612, 880, 96, {fill: C.panel, r: 6});
  W.text("title", L + 16, 626, "On Submit", {size: 14, weight: 700});
  W.text("text", L + 16, 650, "Stored as D11 version 1 and linked to gate 6. The Director gets Confirm gate. This task closes.", {size: 13, w: 848});
  W.end();
  W.w7Actions("Only Procurement can upload D11 for this project.", null, ["submit-button", "Submit", 160]);
  return W.finish("w7-upload-document");
};

  B["w7-confirm-gate"] = (x, y) => {
  W.w7Start("w7-confirm-gate", x, y); W.w7Inbox("confirm-gate");
  W.sec("gate");
  W.detailHead("Lagos–Calabar coastal · Gate 6 · W7.3", "Confirm gate 6 · BPP no objection", "Evidence uploaded by Procurement · today 06:50 · 4 hours ago");
  W.end();
  W.sec("viewer");
  W.rect("frame", L, 184, 560, 736, {fill: C.fillSoft, stroke: C.line, r: 6});
  W.rect("toolbar", L, 184, 560, 40, {fill: C.panel, r: 6});
  W.text("toolbar-file", L + 16, 195, "BPP-CNO-LC-2026-044.pdf · page 1 of 2", {size: 13, weight: 600});
  W.text("toolbar-zoom", L + 450, 195, "−  100%  +", {size: 13, color: C.txt2, w: 94, align: "right"});
  W.rect("page", L + 60, 244, 440, 656, {fill: C.white, stroke: C.lineSoft});
  W.text("page-heading", L + 60, 284, "BUREAU OF PUBLIC PROCUREMENT", {size: 14, weight: 700, w: 440, align: "center"});
  W.text("page-title", L + 60, 310, "Certificate of No Objection", {size: 13, w: 440, align: "center", color: C.txt2});
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(i => W.rect(`page-line-${i + 1}`, L + 100, 360 + i * 26, i % 4 === 3 ? 240 : 360, 8, {fill: C.fillSoft, r: 2}));
  W.rect("page-signature", L + 300, 660, 160, 40, {fill: C.fillSoft, r: 2});
  W.text("page-date", L + 100, 670, "Dated 24 October 2026", {size: 12, color: C.txt2});
  W.end();
  const X = 1100, CWs = 300;
  W.sec("evidence");
  W.card("evidence", X, 184, CWs, 248, "Evidence");
  W.kv("evidence", X + 16, 220, [["Uploaded by", "Bola Ade, Procurement"], ["When", "Today 06:50"], ["Date entered", "24 Oct 2026"], ["Register", "D11 · version 1"], ["Gate kind", "Attach evidence"], ["Approving party", "BPP"]], 104, 164, 32);
  W.end();
  W.sec("on-confirm");
  W.rect("bg", X, 452, CWs, 132, {fill: C.panel, r: 6});
  W.text("title", X + 16, 466, "On Confirm", {size: 14, weight: 700});
  W.text("text", X + 16, 490, "Gate 6 becomes Passed with 24 Oct 2026 and the days-at-gate clock stops. Return sends it back to Procurement with your reason.", {size: 13, w: CWs - 32});
  W.end();
  W.w7Actions("Confirming writes an audit row with your PIN.", ["return-button", "Return…", 140], ["confirm-button", "Confirm (PIN)", 180]);
  return W.finish("w7-confirm-gate");
};

  B["m2-home"] = (x, y, opts = {}) => {
  const key = opts.sent ? "m2-home-sent" : "m2-home";
  W.mStart(key, x, y); W.statusBar(false);
  W.sec("top-bar");
  W.text("greeting", 20, 56, "Good morning, Musa", {size: 18, weight: 700});
  W.text("menu", 342, 56, "☰", {size: 20, color: C.txt2});
  W.end();
  W.sec("current-lot");
  W.rect("card", 20, 92, 350, 84, {fill: C.panel, r: 8});
  W.text("label", 36, 102, "CURRENT LOT", {size: 11, weight: 700, color: C.txt2});
  W.text("lot-picker", 36, 118, "Lot 2 · Kaduna–Kano SGR  ▾", {size: 16, weight: 700});
  W.text("nearest-chainage", 36, 144, "Nearest chainage km 104+350 · GPS ±4 m", {size: 13, color: C.txt2});
  W.end();
  W.sec("take-photo");
  W.group("take-photo-button", () => {
    W.rect("button-bg", 20, 192, 350, 150, {fill: C.accent, r: 12});
    W.ellipse("camera-icon", 171, 214, 48, 48, {fill: null, stroke: C.white, sw: 3});
    W.ellipse("camera-icon-lens", 185, 228, 20, 20, {fill: C.white});
    W.text("label", 20, 274, "Take photo", {size: 26, weight: 700, color: C.white, w: 350, align: "center"});
    W.text("hint", 20, 308, "Location locks before the shutter opens", {size: 13, color: "#CCCCCC", w: 350, align: "center"});
  }, "take-photo");
  W.end();
  W.sec("shortcuts");
  W.group("todays-report", () => {
    W.rect("todays-report-tile", 20, 358, 169, 92, {fill: C.white, stroke: C.line, r: 8});
    W.text("todays-report-title", 36, 372, "Today's report", {size: 16, weight: 700});
    W.text("todays-report-state", 36, 398, "Not sent", {size: 13});
    W.text("todays-report-due", 36, 418, "Prefilled · due 4 pm", {size: 12, color: C.txt2});
  }, "todays-report");
  W.group("milestones", () => {
    W.rect("milestones-tile", 201, 358, 169, 92, {fill: C.white, stroke: C.line, r: 8});
    W.text("milestones-title", 217, 372, "Milestones", {size: 16, weight: 700});
    W.text("milestones-state", 217, 398, "2 open on this lot", {size: 13});
    W.text("milestones-next", 217, 418, "Next: culvert km 106", {size: 12, color: C.txt2});
  }, "milestones");
  W.end();
  W.sec("report-incident");
  W.group("report-incident-button", () => {
    W.rect("button-bg", 20, 466, 350, 56, {fill: C.red, r: 8});
    W.text("label", 20, 466, "⚠  Report incident", {size: 17, weight: 700, color: C.white, w: 350, h: 56, align: "center", valign: "center"});
  }, "report-incident");
  W.end();
  W.sec("sent-back");
  W.group("sent-back-row", () => {
    W.rect("row-bg", 20, 538, 350, 56, {fill: C.white, stroke: C.line, r: 8});
    W.text("label", 36, 556, "Sent back", {size: 16, weight: 700});
    W.chip("count", 124, 555, 28, "2", {fill: C.txt2, color: C.white, weight: 700, size: 13});
    W.text("reason-preview", 166, 558, "Photo unclear · 1 more", {size: 12, color: C.txt2});
    W.text("chevron", 346, 554, "›", {size: 22, color: C.txt2});
  }, "sent-back");
  W.end();
  W.photoStatus(opts.sent);
  W.sec("call-support");
  W.group("call-support-button", () => {
    W.rect("button-bg", 20, 722, 350, 52, {fill: C.white, stroke: C.accent, r: 8, sw: 1.5});
    W.text("label", 20, 722, "☎  Call support", {size: 16, weight: 600, color: C.accent, w: 350, h: 52, align: "center", valign: "center"});
  }, "call-support");
  W.end();
  if (opts.sent) {
    W.sec("toast");
    W.group("toast-message", () => {
      const t = W.rect("bg", 20, 782, 350, 40, {fill: C.accent, r: 8});
      t.shadows = [{style: "drop-shadow", offsetX: 0, offsetY: 4, blur: 12, spread: 0, color: {color: "#000000", opacity: 0.2}, hidden: false}];
      W.text("label", 36, 782, "✓  Sent, km 142+300", {size: 13, weight: 600, color: C.white, w: 140, h: 40, valign: "center"});
      W.text("dismiss", 310, 782, "OK", {size: 14, weight: 700, color: C.white, w: 44, h: 40, align: "right", valign: "center"});
    }, "toast");
    W.end();
    W.sec("toast-handoff");
    W.handoff("next-resident-engineer", 170, 789, "Next: resident engineer ▸", "handoff-re", {w: 156, fill: "#FFFFFF"});
    W.end();
  } else W.homeBar();
  return W.finish(key);
};

  B["m2-home-sent"] = (x, y) => B["m2-home"](x, y, {sent: true});

  B["m3-capture"] = (x, y) => {
  W.mStart("m3-capture", x, y);
  W.sec("viewfinder");
  W.rect("frame", 0, 0, 390, 420, {fill: "#D6D6D6"});
  W.path("placeholder-cross-a", "M0,44 L390,420", {color: "#BBBBBB", sw: 1});
  W.path("placeholder-cross-b", "M390,44 L0,420", {color: "#BBBBBB", sw: 1});
  W.end();
  W.statusBar(true);
  W.sec("viewfinder-overlay");
  W.rect("location-lock-chip", 12, 56, 172, 32, {fill: C.white, r: 16});
  W.ellipse("location-lock-dot", 24, 67, 10, 10, {fill: C.txt});
  W.text("location-lock-label", 42, 63, "Location locked · ±4 m", {size: 13, weight: 700});
  W.rect("close-bg", 338, 56, 36, 32, {fill: C.white, r: 16});
  W.text("close", 338, 56, "✕", {size: 15, w: 36, h: 32, align: "center", valign: "center"});
  W.rect("chainage-strip", 0, 364, 390, 56, {fill: C.accent});
  W.text("chainage-live", 16, 372, "km 104+350", {size: 20, weight: 700, color: C.white});
  W.text("chainage-caption", 16, 398, "Chainage, live from GPS", {size: 11, color: "#CCCCCC"});
  W.text("capture-meta", 200, 382, "Lot 2 · 10:52 · heading NE", {size: 12, color: C.white, w: 174, align: "right"});
  W.end();
  W.sec("what-is-this");
  W.text("title", 20, 436, "What is this?", {size: 18, weight: 700});
  W.text("hint", 136, 440, "Tap one", {size: 13, color: C.txt2});
  ["Earthworks", "Bridge or culvert", "Track", "Station", "Equipment", "Other"].forEach((t, i) => {
    const tx = 20 + (i % 3) * 120, ty = 468 + Math.floor(i / 3) * 84, sel = i === 0, k = `tile-${t.toLowerCase().replace(/ /g, "-")}`;
    W.group(k, () => {
      W.rect(`${k}-bg`, tx, ty, 110, 74, {fill: sel ? C.panel : C.white, stroke: sel ? C.txt : C.line, sw: sel ? 2 : 1, r: 8});
      W.rect(`${k}-icon`, tx + 43, ty + 12, 24, 24, {fill: sel ? C.txt2 : C.fillMid, r: 4});
      W.text(`${k}-label`, tx, ty + 44, t, {size: 13, weight: sel ? 700 : 400, w: 110, align: "center"});
    });
  });
  W.end();
  W.sec("voice-note");
  W.rect("button-bg", 20, 644, 350, 48, {fill: C.white, stroke: C.line, r: 24});
  W.ellipse("mic-icon", 36, 656, 24, 24, {fill: C.fillMid});
  W.rect("mic-icon-body", 45, 661, 6, 11, {fill: C.txt2, r: 3});
  W.text("label", 70, 658, "Hold to add a voice note (optional)", {size: 14, weight: 600});
  W.end();
  W.sec("actions");
  W.button("retake-button", 20, 708, 120, 52, "Retake", "secondary", {size: 16, key: "retake"});
  W.button("send-button", 152, 708, 218, 52, "Send", "primary", {size: 17, key: "send"});
  W.text("queue-note", 20, 772, "Joins the outbox and uploads when there is signal.", {size: 12, color: C.txt2, w: 350, align: "center"});
  W.end();
  W.homeBar();
  return W.finish("m3-capture");
};

  B["m1-onboarding"] = (x, y) => {
  W.mStart("m1-onboarding", x, y); W.statusBar(false);
  W.sec("welcome");
  W.text("title", 20, 60, "Welcome, Emeka", {size: 24, weight: 700});
  W.text("role", 20, 92, "Contractor site manager · CCECC", {size: 14, color: C.txt});
  W.text("lot", 20, 112, "Kaduna–Kano SGR · Lot 2", {size: 13, color: C.txt2});
  W.end();
  W.sec("sms-code");
  W.text("label", 20, 146, "SMS code", {size: 13, weight: 600});
  "481902".split("").forEach((d, i) => { W.rect(`digit-${i + 1}-box`, 20 + i * 56, 168, 48, 48, {fill: C.white, stroke: C.txt2, r: 6, sw: 1.5}); W.text(`digit-${i + 1}`, 20 + i * 56, 168, d, {size: 20, weight: 700, w: 48, h: 48, align: "center", valign: "center"}); });
  W.text("checked", 20, 222, "✓ Code checked", {size: 12, weight: 600, color: C.txt2});
  W.end();
  W.sec("pin");
  W.text("label", 20, 250, "Set a 4-digit PIN", {size: 13, weight: 600});
  [0, 1, 2, 3].forEach(i => W.ellipse(`dot-${i + 1}`, 151 + i * 24, 276, 16, 16, {fill: C.txt}));
  W.keypad(20, 304, 110, 40, 10);
  W.end();
  W.sec("language");
  W.text("label", 20, 512, "Language", {size: 13, weight: 600});
  [["English", 74], ["Hausa", 64], ["Yoruba", 70], ["Igbo", 54], ["Pidgin", 64]].reduce((cx, [l, w], i) => { W.chip(`option-${l.toLowerCase()}`, cx, 534, w, l, {h: 32, size: 13, fill: i === 0 ? C.txt2 : C.white, stroke: i === 0 ? null : C.line, color: i === 0 ? C.white : C.txt}); return cx + w + 8; }, 20);
  W.end();
  W.sec("large-text");
  W.rect("row-bg", 20, 586, 350, 52, {fill: C.panel, r: 8});
  W.text("label", 36, 602, "Large text", {size: 15, weight: 600});
  W.rect("toggle-track", 314, 600, 44, 24, {fill: C.fillMid, r: 12});
  W.ellipse("toggle-knob", 316, 602, 20, 20, {fill: C.white});
  W.end();
  W.sec("permissions");
  W.text("note", 20, 656, "Next, the app asks for camera and location. Photos only work with both switched on.", {size: 13, color: C.txt2, w: 350});
  W.end();
  W.sec("actions");
  W.button("start-button", 20, 740, 350, 56, "Start", "primary", {size: 18, key: "start"});
  W.end();
  W.homeBar();
  return W.finish("m1-onboarding");
};

  B["m4-report"] = (x, y) => {
  W.mStart("m4-report", x, y); W.statusBar(false); W.mTopBar("Today's report");
  W.sec("prefill");
  W.chip("note", 20, 116, 196, "Prefilled from yesterday", {h: 24, size: 12, fill: C.panel, weight: 600});
  W.end();
  W.sec("workers");
  W.text("label", 20, 156, "Workers on site", {size: 14, weight: 700});
  W.button("minus-button", 20, 180, 56, 48, "−", "ghost", {size: 22});
  W.rect("value-box", 88, 180, 214, 48, {fill: C.white, stroke: C.line, r: 6});
  W.text("value", 88, 180, "46", {size: 24, weight: 700, w: 214, h: 48, align: "center", valign: "center"});
  W.button("plus-button", 314, 180, 56, 48, "+", "ghost", {size: 22});
  W.end();
  W.sec("machines");
  W.text("label", 20, 248, "Machines", {size: 14, weight: 700});
  [["Excavators ×2", true], ["Grader", true], ["Roller", true], ["Water bowser", false], ["Tipper trucks ×6", true]].forEach(([m, on], i) => {
    const yy = 274 + i * 34;
    W.checkbox(`item-${i + 1}`, 20, yy, on);
    W.text(`item-${i + 1}-label`, 48, yy, m, {size: 14});
  });
  W.end();
  W.sec("weather");
  W.text("label", 20, 452, "Weather", {size: 14, weight: 700});
  ["Sunny", "Cloudy", "Rain", "Harmattan"].forEach((w, i) => {
    const tx = 20 + i * 89, sel = i === 0;
    W.rect(`tile-${w.toLowerCase()}`, tx, 476, 81, 64, {fill: sel ? C.panel : C.white, stroke: sel ? C.txt : C.line, sw: sel ? 2 : 1, r: 8});
    W.rect(`tile-${w.toLowerCase()}-icon`, tx + 30, 484, 20, 20, {fill: sel ? C.txt2 : C.fillMid, r: 10});
    W.text(`tile-${w.toLowerCase()}-label`, tx, 512, w, {size: 12, weight: sel ? 700 : 400, w: 81, align: "center"});
  });
  W.end();
  W.sec("problem");
  W.text("label", 20, 560, "Any problem today?", {size: 14, weight: 700});
  W.chip("no", 20, 584, 80, "No", {h: 36, size: 14, fill: C.txt2, color: C.white});
  W.chip("yes", 108, 584, 80, "Yes", {h: 36, size: 14, fill: C.white, stroke: C.line, weight: 400});
  W.rect("voice-bg", 20, 632, 350, 48, {fill: C.white, stroke: C.line, r: 24});
  W.ellipse("mic-icon", 36, 644, 24, 24, {fill: C.fillMid});
  W.rect("mic-icon-body", 45, 649, 6, 11, {fill: C.txt2, r: 3});
  W.text("voice-label", 70, 646, "Hold to add a voice note", {size: 14, weight: 600});
  W.end();
  W.sec("actions");
  W.button("send-button", 20, 740, 350, 56, "Send", "primary", {size: 18, key: "send"});
  W.end();
  W.homeBar();
  return W.finish("m4-report");
};

  B["m6-incident"] = (x, y) => {
  W.mStart("m6-incident", x, y); W.statusBar(false); W.mTopBar("Report incident");
  W.sec("type");
  W.text("label", 20, 120, "What happened?", {size: 14, weight: 700});
  ["Accident", "Security", "Community", "Equipment"].forEach((t, i) => {
    const tx = 20 + (i % 2) * 181, ty = 146 + Math.floor(i / 2) * 108, sel = i === 0, k = `tile-${t.toLowerCase()}`;
    W.rect(`${k}-bg`, tx, ty, 169, 96, {fill: sel ? C.panel : C.white, stroke: sel ? C.red : C.line, sw: sel ? 2 : 1, r: 8});
    W.rect(`${k}-icon`, tx + 16, ty + 16, 32, 32, {fill: sel ? C.red : C.fillMid, r: 6});
    W.text(`${k}-label`, tx + 16, ty + 60, t, {size: 16, weight: 700});
  });
  W.end();
  W.sec("evidence");
  W.button("photo-button", 20, 374, 169, 48, "Add a photo", "secondary", {size: 14});
  W.button("voice-button", 201, 374, 169, 48, "Voice note", "secondary", {size: 14});
  W.rect("location-bg", 20, 438, 350, 44, {fill: C.panel, r: 8});
  W.ellipse("location-dot", 34, 455, 10, 10, {fill: C.txt});
  W.text("location", 52, 450, "km 104+350 · location locked ±4 m", {size: 13, weight: 600});
  W.end();
  W.sec("notified");
  W.rect("bg", 20, 498, 350, 68, {fill: C.white, stroke: C.line, r: 8});
  W.text("text", 36, 510, "The RE, PM and security desk get an SMS as soon as you send.", {size: 13, w: 318});
  W.end();
  W.sec("actions");
  W.button("send-button", 20, 740, 350, 56, "Send", "primary", {size: 18, key: "send"});
  W.end();
  W.homeBar();
  return W.finish("m6-incident");
};

  B["m5-milestones"] = (x, y) => {
  W.mStart("m5-milestones", x, y); W.statusBar(false); W.mTopBar("Milestones");
  W.sec("lot");
  W.text("lot", 20, 116, "Lot 2 · ordered by chainage", {size: 13, color: C.txt2});
  W.end();
  W.sec("list");
  const rows = [["km 98+200", "Culvert C-14", "Verified"], ["km 104+800", "Embankment section 12", "Claimed"], ["km 106+000", "Culvert C-15", "Open"], ["km 112+500", "Bridge B-3 deck", "Open"], ["km 120+000", "Earthworks to formation", "Not started"]];
  let yy = 144;
  rows.forEach(([ch, name, st], i) => {
    const exp = i === 2, h = exp ? 196 : 64, k = `row-${i + 1}`;
    W.rect(`${k}-bg`, 20, yy, 350, h, {fill: C.white, stroke: exp ? C.txt2 : C.line, sw: exp ? 1.5 : 1, r: 8});
    W.text(`${k}-chainage`, 36, yy + 12, ch, {size: 12, weight: 700, color: C.txt2});
    W.text(`${k}-name`, 36, yy + 32, name, {size: 15, weight: 700});
    W.chip(`${k}-status`, 270, yy + 12, 88, st, {fill: st === "Verified" ? C.fillMid : st === "Claimed" ? C.fillSoft : C.white, stroke: st === "Open" || st === "Not started" ? C.line : null});
    if (exp) {
      W.text(`${k}-definition`, 36, yy + 60, "Culvert barrel and headwalls complete, backfilled to formation level.", {size: 13, w: 318});
      W.text(`${k}-photos-needed`, 36, yy + 104, "Needs two photos: upstream and downstream.", {size: 12, color: C.txt2});
      W.button("mark-complete-button", 36, yy + 132, 318, 48, "Mark complete", "primary", {size: 16, key: "mark-complete"});
    }
    yy += h + 12;
  });
  W.end();
  W.homeBar();
  return W.finish("m5-milestones");
};

  B["m7-sent-back"] = (x, y) => {
  W.mStart("m7-sent-back", x, y); W.statusBar(false); W.mTopBar("Sent back");
  W.sec("intro");
  W.text("text", 20, 116, "2 items returned by the RE. Retake and send again.", {size: 13, color: C.txt2});
  W.end();
  W.sec("items");
  [["km 103+900 · Earthworks", "Photo unclear", "Engr. K. Adeyemi · yesterday 16:10"], ["km 104+350 · Bridge or culvert", "Wrong chainage", "Engr. K. Adeyemi · today 08:45"]].forEach(([t, reason, by], i) => {
    const yy = 148 + i * 236, k = `item-${i + 1}`;
    W.rect(`${k}-bg`, 20, yy, 350, 220, {fill: C.white, stroke: C.line, r: 8});
    W.placeholder(`${k}-thumbnail`, 36, yy + 16, 120, 90);
    W.text(`${k}-title`, 168, yy + 16, t, {size: 14, weight: 700, w: 190});
    W.text(`${k}-reason-label`, 168, yy + 58, "Reason", {size: 11, weight: 700, color: C.txt2});
    W.text(`${k}-reason`, 168, yy + 74, reason, {size: 14, weight: 600});
    W.text(`${k}-by`, 36, yy + 120, by, {size: 12, color: C.txt2});
    W.button(`${k}-retake-button`, 36, yy + 152, 318, 48, "Retake", "primary", {size: 16, key: i === 0 ? "retake" : "retake-2"});
  });
  W.end();
  W.homeBar();
  return W.finish("m7-sent-back");
};

  B["w1-sign-in"] = (x, y) => {
  const b = W.newBoard("screens/w1-sign-in", x, y, 1440, 1024, C.bg); W.start(b);
  W.sec("top-bar");
  W.text("app-title", 40, 32, "FMoT Rail Project Tracker", {size: 20, weight: 700});
  W.text("ministry", 40, 60, "Federal Ministry of Transportation", {size: 13, color: C.txt2});
  W.end();
  W.sec("sign-in-card");
  const cx = 500, cw = 440;
  const card = W.rect("card", cx, 140, cw, 760, {fill: C.white, stroke: C.line, r: 10});
  card.shadows = [{style: "drop-shadow", offsetX: 0, offsetY: 4, blur: 16, spread: 0, color: {color: "#000000", opacity: 0.06}, hidden: false}];
  W.text("title", cx + 40, 176, "Sign in", {size: 26, weight: 700});
  W.text("intro", cx + 40, 214, "Phone number, then the SMS code. After the first time, just your PIN.", {size: 13, color: C.txt2, w: cw - 80});
  W.field("phone", cx + 40, 262, cw - 80, "Phone number", "0803 412 7781");
  W.field("sms-code", cx + 40, 344, cw - 80, "SMS code", "4 8 1 9 0 2");
  W.text("resend", cx + 300, 344, "Resend code", {size: 13, weight: 600, w: 100, align: "right"});
  W.text("pin-label", cx + 40, 428, "PIN", {size: 13, weight: 600});
  [0, 1, 2, 3].forEach(i => W.ellipse(`pin-dot-${i + 1}`, cx + 172 + i * 28, 452, 16, 16, {fill: i < 3 ? C.txt : C.white, stroke: i < 3 ? null : C.txt2, sw: 1.5}));
  W.keypad(cx + 40, 484, 112, 48, 12);
  W.button("enter-button", cx + 40, 728, cw - 80, 52, "Enter", "primary", {size: 17, key: "enter"});
  W.text("call-support", cx + 40, 800, "Trouble signing in? Call support · 0700 RAIL 000", {size: 13, weight: 600, w: cw - 80, align: "center"});
  W.text("legal", cx + 40, 850, "Use of this system is recorded under the Nigeria Data Protection Act.", {size: 11, color: C.txt3, w: cw - 80, align: "center"});
  W.end();
  return W.finish("w1-sign-in");
};

  B["w5-gates"] = (x, y) => {
  W.w5Start("w5-gates", x, y, 1);
  W.sec("gates");
  W.secTitle("Gates", "External loan template · 15 gates · gate 13 current");
  const cols = [["Gate", 288], ["Kind", 448], ["Approver", 528], ["Status", 676], ["Date passed", 768], ["Days", 856], ["Evidence", 902], ["Uploaded by", 994], ["Confirmed by", 1100], ["Action", 1212]];
  W.rect("table-bg", 272, 180, 1144, 784, {fill: C.white, stroke: C.line, r: 6});
  W.rect("header-row", 272, 180, 1144, 34, {fill: C.panel, r: 6});
  cols.forEach(([c, cx]) => W.text(`col-${c.toLowerCase().replace(/ /g, "-")}`, cx, 189, c, {size: 12, weight: 700, color: C.txt2}));
  const P = "Passed";
  const rows = [
    ["1 Initiation", "Approve", "Minister", P, "12 Mar 2019", "—", "D01, D02", "A. Bello", "Minister's office", ""],
    ["2 Feasibility accepted", "Approve", "PS and Minister", P, "30 Sep 2019", "—", "D04", "A. Bello", "PS office", ""],
    ["3 Funding route", "Approve", "Minister", P, "18 Dec 2019", "—", "D05", "A. Bello", "Minister's office", ""],
    ["4 Funding approved", "Evidence", "FEC, NASS, lender", P, "22 Jul 2020", "—", "D07, D08", "G. Eze", "H. Danjuma", "Open evidence"],
    ["5 Tender", "Evidence", "Tenders Board", P, "14 Oct 2020", "—", "D10", "Procurement", "H. Danjuma", "Open evidence"],
    ["6 BPP no objection", "Evidence", "BPP", P, "2 Dec 2020", "—", "D11", "Procurement", "H. Danjuma", "Open evidence"],
    ["7 FEC award", "Evidence", "FEC", P, "20 Jan 2021", "—", "D12", "Procurement", "H. Danjuma", "Open evidence"],
    ["8 Contract executed", "Evidence", "Minister or PS", P, "15 Mar 2021", "—", "D13", "Legal", "H. Danjuma", "Open evidence"],
    ["9 Environment", "Evidence", "FMEnv", P, "9 Jun 2021", "—", "D14", "Finance", "H. Danjuma", "Open evidence"],
    ["10 Right-of-way", "Evidence", "State governors", "Blocked", "—", "41", "D16 (part)", "A. Bello", "—", "Attach evidence"],
    ["11 Financial close", "Evidence", "Lender", P, "30 Nov 2021", "—", "D19", "Finance", "H. Danjuma", "Open evidence"],
    ["12 Design approved", "Approve", "NRC engineer", P, "14 Apr 2022", "—", "D21", "CCECC", "F. Musa", ""],
    ["13 Certify and pay", "Approve", "RE, NRC, Dir., PS", "Current", "—", "12", "IPC 14", "Li Wei", "—", "Confirm"],
    ["14 Commissioning", "Approve", "NRC", "Not started", "—", "—", "—", "—", "—", ""],
    ["15 Handover", "Approve", "Ministry, NRC", "Not started", "—", "—", "—", "—", "—", ""]];
  rows.forEach((r, i) => {
    const ry = 214 + i * 49, k = `row-${i + 1}`, cur = r[3] === "Current";
    if (cur) { W.rect(`${k}-highlight`, 273, ry, 1142, 48, {fill: C.panel}); W.rect(`${k}-marker`, 273, ry, 4, 48, {fill: C.txt}); }
    if (i) W.rect(`${k}-rule`, 272, ry, 1144, 1, {fill: C.lineSoft});
    W.text(`${k}-gate`, 288, ry + 15, r[0], {size: 13, weight: cur ? 700 : 600});
    W.text(`${k}-kind`, 448, ry + 15, r[1], {size: 12, color: C.txt2});
    W.text(`${k}-approver`, 528, ry + 15, r[2], {size: 12});
    const stc = {Passed: [C.fillSoft, null, false], Current: [C.white, C.txt, false], Blocked: [C.fillMid, null, false], "Not started": [C.white, C.line, true]}[r[3]];
    W.chip(`${k}-status`, 676, ry + 13, 80, r[3], {fill: stc[0], stroke: stc[1], sw: 1.5, weight: r[3] === "Current" ? 700 : 600, color: r[3] === "Not started" ? C.txt3 : C.txt});
    W.text(`${k}-date`, 768, ry + 15, r[4], {size: 12});
    W.text(`${k}-days`, 856, ry + 15, r[5], {size: 12, weight: r[5] !== "—" ? 700 : 400});
    W.text(`${k}-evidence`, 902, ry + 15, r[6], {size: 12});
    W.text(`${k}-uploaded-by`, 994, ry + 15, r[7], {size: 12});
    W.text(`${k}-confirmed-by`, 1100, ry + 15, r[8], {size: 12});
    if (r[9] === "Confirm") W.button(`${k}-confirm-button`, 1212, ry + 9, 92, 30, "Confirm", "secondary", {size: 13, key: "confirm-13"});
    else if (r[9]) W.clickText(`${k}-${r[9].toLowerCase().replace(/ /g, "-")}`, 1212, ry + 15, r[9], {size: 12, weight: 700}, `${r[9] === "Open evidence" ? "open-evidence" : "attach-evidence"}-${i + 1}`);
  });
  W.end();
  return W.finish("w5-gates");
};

  B["w5-payments"] = (x, y) => {
  W.w5Start("w5-payments", x, y, 5);
  W.sec("payments");
  W.secTitle("Payments", "Interim payment certificates · amounts shown with the financial permission");
  W.button("new-valuation-button", 756, 120, 148, 36, "+ New valuation", "secondary", {size: 14, key: "new-valuation"});
  W.rect("table-bg", 272, 180, 632, 252, {fill: C.white, stroke: C.line, r: 6});
  W.rect("header-row", 272, 180, 632, 34, {fill: C.panel, r: 6});
  [["IPC", 288], ["Period", 352], ["Amount", 448], ["Chain", 580], ["Status", 800]].forEach(([c, cx]) => W.text(`col-${c.toLowerCase()}`, cx, 189, c, {size: 12, weight: 700, color: C.txt2}));
  W.text("chain-legend", 640, 189, "Rec · Cert · Appr · Paid", {size: 11, color: C.txt3});
  [["IPC 12", "Jul 2026", "₦3,912,400,000", 4, "Paid"], ["IPC 13", "Aug 2026", "₦4,406,100,000", 3, "Approved"], ["IPC 14", "Sep 2026", "₦4,812,650,000", 2, "Certified"], ["IPC 15", "Oct 2026", "—", 0, "Draft"]].forEach(([n, p, a, steps, st], i) => {
    const ry = 214 + i * 54, k = `row-${i + 1}`;
    if (i) W.rect(`${k}-rule`, 272, ry, 632, 1, {fill: C.lineSoft});
    W.text(`${k}-ipc`, 288, ry + 18, n, {size: 13, weight: 700});
    W.text(`${k}-period`, 352, ry + 18, p, {size: 13});
    W.text(`${k}-amount`, 448, ry + 18, a, {size: 13});
    [0, 1, 2, 3].forEach(s => { W.ellipse(`${k}-chain-${s + 1}`, 580 + s * 26, ry + 20, 14, 14, {fill: s < steps ? C.txt2 : C.white, stroke: s < steps ? null : C.line, sw: 1.5}); if (s < 3) W.rect(`${k}-chain-link-${s + 1}`, 594 + s * 26, ry + 26, 12, 2, {fill: C.line}); });
    W.chip(`${k}-status`, 800, ry + 16, 88, st, {fill: st === "Paid" ? C.fillMid : st === "Draft" ? C.white : C.fillSoft, stroke: st === "Draft" ? C.line : null, dash: st === "Draft"});
  });
  W.card("deductions", 272, 452, 632, 152, "Retention and advance recovery to date");
  W.kv("deductions", 288, 488, [["Retention held", "₦1,124,080,000 (5%)"], ["Advance paid", "₦8,400,000,000"], ["Advance recovered", "₦2,698,400,000 (32%)"], ["Next release", "At commissioning (gate 14)"]], 160, 400, 26);
  W.end();
  W.sec("valuation-panel");
  const X = 936, PW = 464;
  W.rect("panel", X, 120, PW, 844, {fill: C.white, stroke: C.txt2, sw: 1.5, r: 8});
  W.text("title", X + 20, 140, "Valuation · October 2026", {size: 18, weight: 700});
  W.text("subtitle", X + 20, 168, "Lot 2 · draft by Li Wei, CCECC commercial manager", {size: 13, color: C.txt2});
  W.chip("prefill", X + 20, 196, 300, "Quantities prefilled from verified measurement MS-10", {h: 24, fill: C.panel, size: 12});
  W.rect("qty-header", X + 20, 236, PW - 40, 30, {fill: C.panel, r: 4});
  W.text("qty-col-item", X + 32, 242, "Item", {size: 12, weight: 700, color: C.txt2});
  W.text("qty-col-qty", X + 220, 242, "Quantity", {size: 12, weight: 700, color: C.txt2});
  W.text("qty-col-value", X + 300, 242, "Value", {size: 12, weight: 700, color: C.txt2, w: 132, align: "right"});
  [["Earthworks", "38,900 m³", "₦1,945,000,000"], ["Culverts", "2 no.", "₦412,000,000"], ["Track laying", "7.1 km", "₦2,201,000,000"], ["Stations (Zaria)", "6%", "₦546,000,000"]].forEach(([it, q, v], i) => {
    const ry = 266 + i * 36;
    W.text(`qty-${i + 1}-item`, X + 32, ry + 10, it, {size: 13});
    W.text(`qty-${i + 1}-quantity`, X + 220, ry + 10, q, {size: 13});
    W.text(`qty-${i + 1}-value`, X + 300, ry + 10, v, {size: 13, w: 132, align: "right"});
    W.rect(`qty-${i + 1}-rule`, X + 20, ry + 35, PW - 40, 1, {fill: C.lineSoft});
  });
  W.text("gross-label", X + 32, 418, "Gross this period", {size: 14, weight: 700});
  W.text("gross-value", X + 300, 418, "₦5,104,000,000", {size: 14, weight: 700, w: 132, align: "right"});
  W.text("attach-label", X + 20, 470, "Valuation file", {size: 13, weight: 600});
  W.rect("attach-row", X + 20, 492, PW - 40, 64, {fill: C.bg, stroke: C.line, dash: true, sw: 1.5, r: 6});
  W.rect("attach-icon", X + 36, 504, 30, 40, {fill: C.fillMid, r: 3});
  W.text("attach-file", X + 80, 506, "V-15 October valuation.xlsx", {size: 14, weight: 700});
  W.text("attach-meta", X + 80, 528, "184 KB · attached just now", {size: 12, color: C.txt2});
  W.button("attach-button", X + PW - 20 - 156, 506, 140, 36, "Attach valuation file", "secondary", {size: 12, key: "attach"});
  W.rect("note-bg", X + 20, 580, PW - 40, 72, {fill: C.panel, r: 6});
  W.text("note", X + 36, 592, "On Submit the valuation is locked as Submitted and the RE gets Recommend certificate.", {size: 13, w: PW - 72});
  W.rect("footer-rule", X, 884, PW, 1, {fill: C.line});
  W.button("save-draft-button", X + 20, 900, 140, 44, "Save draft", "secondary", {key: "save"});
  W.button("submit-button", X + PW - 20 - 160, 900, 160, 44, "Submit", "primary", {key: "submit"});
  W.end();
  return W.finish("w5-payments");
};

  B["w5-documents"] = (x, y) => {
  W.w5Start("w5-documents", x, y, 7);
  W.sec("documents");
  W.secTitle("Documents", "Register grouped by gate · you see what your sensitivity clearance allows");
  W.button("upload-button", 1288, 120, 112, 36, "Upload", "secondary", {size: 14, key: "upload"});
  W.rect("table-bg", 272, 180, 1144, 664, {fill: C.white, stroke: C.line, r: 6});
  W.rect("header-row", 272, 180, 1144, 34, {fill: C.panel, r: 6});
  [["Code", 288], ["Title", 352], ["Version", 664], ["Uploader", 736], ["Date", 900], ["Actions", 1000]].forEach(([c, cx]) => W.text(`col-${c.toLowerCase()}`, cx, 189, c, {size: 12, weight: 700, color: C.txt2}));
  const groups = [["Gate 1 · Initiation", [["D01", "Concept note", "v3", "A. Bello · PM", "21 Oct 2019"], ["D02", "Minister's approval minute", "v1", "A. Bello · PM", "12 Mar 2019"]]],
    ["Gate 4 · Funding approved", [["D07", "Loan agreement (China Exim)", "v1", "G. Eze · Finance", "22 Jul 2020"], ["D08", "FEC conclusion extract", "v1", "G. Eze · Finance", "22 Jul 2020"]]],
    ["Gate 6 · BPP no objection", [["D11", "BPP Certificate of No Objection", "v1", "Procurement", "2 Dec 2020"]]],
    ["Gate 8 · Contract executed", [["D13", "Contract agreement", "v2", "Legal", "15 Mar 2021"]]],
    ["Gate 10 · Right-of-way", [["D16", "Compensation register", "v5", "A. Bello · PM", "18 Oct 2026"]]],
    ["Gate 13 · Certify and pay", [["D24", "Payment advice, IPC 12", "v1", "G. Eze · Finance", "9 Sep 2026"]]]];
  let ry = 214, n = 0;
  groups.forEach(([g, rows], gi) => {
    W.rect(`group-${gi + 1}-bg`, 273, ry, 1142, 30, {fill: C.bg});
    W.text(`group-${gi + 1}-label`, 288, ry + 7, g.toUpperCase(), {size: 11, weight: 700, color: C.txt2});
    ry += 30;
    rows.forEach(([code, t, v, up, d]) => {
      n++; const k = `row-${code.toLowerCase()}`;
      W.chip(`${k}-code`, 288, ry + 11, 44, code, {fill: C.fillMid});
      W.text(`${k}-title`, 352, ry + 13, t, {size: 13, weight: 600});
      W.text(`${k}-version`, 664, ry + 13, v, {size: 13});
      W.text(`${k}-uploader`, 736, ry + 13, up, {size: 13, color: C.txt2});
      W.text(`${k}-date`, 900, ry + 13, d, {size: 13, color: C.txt2});
      W.clickText(`${k}-download`, 1000, ry + 13, "Download", {size: 12, weight: 600}, `download-${code}`);
      W.clickText(`${k}-open`, 1072, ry + 13, "Open", {size: 12, weight: 600}, `open-${code}`);
      W.clickText(`${k}-link-to-gate`, 1116, ry + 13, "Link to gate", {size: 12, weight: 600}, `link-${code}`);
      W.clickText(`${k}-upload-new-version`, 1204, ry + 13, "Upload new version", {size: 12, weight: 600}, `newver-${code}`);
      W.rect(`${k}-rule`, 272, ry + 43, 1144, 1, {fill: C.lineSoft});
      ry += 44;
    });
  });
  W.end();
  return W.finish("w5-documents");
};

  B["s2-users"] = (x, y, opts = {}) => {
  const inv = !!opts.invited, key = inv ? "s2-users-invited" : "s2-users";
  const b = W.newBoard(`screens/${key}`, x, y, 1440, 1024, C.white); W.start(b);
  W.webHeader("Setup", "Setup and administration", "Ade Ogun · IT administrator", "Call support");
  W.sec("admin-nav");
  W.rect("panel", 0, 64, 220, 960, {fill: C.panel});
  ["Organisations", "Users", "Roles and permissions", "Gate templates", "Reference data", "Map and layers", "Reminders", "Audit log", "Integrations and health", "Security desk console"].forEach((n, i) => {
    const ny = 88 + i * 44, active = i === 1, k = `s${i + 1}-${n.toLowerCase().replace(/ /g, "-")}`;
    if (active) { W.rect(`${k}-highlight`, 0, ny, 220, 40, {fill: C.white}); W.rect(`${k}-marker`, 0, ny, 4, 40, {fill: C.txt2}); }
    W.text(`${k}-code`, 20, ny + 11, `S${i + 1}`, {size: 12, weight: 700, color: active ? C.txt : C.txt3});
    W.text(`${k}-label`, 52, ny + 10, n, {size: 14, weight: active ? 700 : 400, color: active ? C.txt : C.txt2});
  });
  W.end();
  const right = inv ? 1416 : 944;
  W.sec("users-toolbar");
  W.text("title", 244, 88, "Users", {size: 24, weight: 700});
  W.text("count", 244, 122, inv ? "215 people · 13 invited · 3 locked" : "214 people · 12 invited · 3 locked", {size: 13, color: C.txt2});
  W.button("add-person-button", right - 8 - 136, 88, 136, 40, "+ Add person", "primary", {key: "add-person"});
  W.rect("search-input", 244, 152, 300, 36, {fill: C.white, stroke: C.line, r: 4});
  W.text("search-placeholder", 256, 161, "Search name, phone or organisation", {size: 13, color: C.txt3});
  [["Organisation", 556, 120], ["Role", 686, 64], ["Status", 760, 78], ["Project", 848, 85]].forEach(([f, fx, w]) => W.chip(`filter-${f.toLowerCase()}`, fx, 156, w, f + " ▾", {h: 28, fill: C.white, stroke: C.line, weight: 400}));
  W.end();
  W.sec("users-table");
  const cols = inv ? [244, 520, 820, 960, 1100, 1304] : [244, 432, 636, 732, 812, 888];
  W.rect("header-row", 236, 204, right - 236, 32, {fill: C.panel, r: 4});
  ["Person", "Organisation and role", "Status", "Last login", "Last upload", "Pending"].forEach((c, i) => W.text(`header-${c.toLowerCase().replace(/ /g, "-")}`, cols[i], 212, c, {size: 12, weight: 700, color: C.txt2, w: i === 5 ? 48 : undefined, align: i === 5 ? "right" : undefined}));
  const users = [
    ["Aisha Bello", "0803 412 7781", "FMoT Rail directorate", "Ministry project manager", "Active", "Today 09:12", "Yesterday", "3"],
    ["Engr. H. Danjuma", "0805 220 1934", "FMoT Rail directorate", "Director, rail", "Active", "Today 08:40", "—", "6"],
    ["Engr. F. Musa", "0806 771 0452", "NRC", "NRC project engineer", "Active", "Yesterday", "2 days ago", "1"],
    ["Engr. K. Adeyemi", "0802 315 8890", "TEAM Consultants", "Consultant resident engineer", "Active", "Today 07:55", "Today 11:02", "14"],
    ["Li Wei", "0809 004 2217", "CCECC", "Contractor commercial manager", "Active", "3 days ago", "3 days ago", "0"],
    ["Musa Garba", "0813 664 0128", "CCECC", "Contractor site manager", "Active", "Today 06:30", "Today 10:47", "0"],
    ["Chinedu Okafor", "0817 902 3346", "CCECC", "Contractor site manager", "Invited", "Never", "—", "0"],
    ["Grace Eze", "0803 558 6610", "FMoT Finance", "Finance officer", "Active", "2 days ago", "5 days ago", "2"],
    ["Tunde Bakare", "0816 237 9905", "Mota-Engil", "Contractor site manager", "Locked", "12 days ago", "12 days ago", "0"],
    ["Ibrahim Sule", "0807 441 2093", "FMoT Security unit", "Security desk officer", "Active", "Today 08:05", "—", "1"],
    ["Ngozi Obi", "0802 119 7764", "AfDB", "Lender viewer", "Deactivated", "2 months ago", "—", "0"]];
  if (inv) users.unshift(["Emeka Nwosu", "+234 812 445 0193", "CCECC", "Contractor site manager", "Invited", "Never", "—", "0", true]);
  users.forEach((u, i) => {
    const ry = 244 + i * 56, k = `row-${i + 1}`, isNew = u[8];
    const m = W.mark();
    if (isNew) W.rect(`${k}-new-highlight`, 236, ry, right - 236, 55, {fill: C.panel});
    W.text(`${k}-name`, cols[0], ry + 8, u[0], {size: 14, weight: 600});
    W.text(`${k}-phone`, cols[0], ry + 28, u[1], {size: 12, color: C.txt2});
    W.text(`${k}-organisation`, cols[1], ry + 8, u[2], {size: 13});
    W.text(`${k}-role`, cols[1], ry + 28, u[3], {size: 12, color: C.txt2});
    const st = u[4];
    W.chip(`${k}-status`, cols[2], ry + 14, 84, st, {h: 24, fill: {Active: C.fillSoft, Invited: C.white, Locked: C.fillMid, Deactivated: C.panel}[st], stroke: st === "Invited" ? C.txt3 : null, dash: st === "Invited", color: st === "Deactivated" ? C.txt3 : C.txt});
    W.text(`${k}-last-login`, cols[3], ry + 18, u[5], {size: 12, color: C.txt2});
    W.text(`${k}-last-upload`, cols[4], ry + 18, u[6], {size: 12, color: C.txt2});
    W.text(`${k}-pending`, cols[5], ry + 17, u[7], {size: 13, weight: u[7] !== "0" ? 700 : 400, w: 48, align: "right", color: u[7] !== "0" ? C.txt : C.txt3});
    W.rect(`${k}-rule`, 236, ry + 55, right - 236, 1, {fill: C.lineSoft});
    if (isNew) W.reg("invited-row", W.groupFrom(m, `${k}-new-person`));
  });
  const endY = 244 + users.length * 56;
  W.text("pagination", 244, endY + 12, `Showing ${users.length} of ${inv ? 215 : 214} · Next page →`, {size: 13, color: C.txt2});
  if (!inv) W.text("row-hint", 244, endY + 36, "Open a row for the user page: memberships, device, invite history, Reset PIN, Move to another lot, Deactivate.", {size: 12, color: C.txt3, w: 692});
  W.end();
  if (!inv) {
    const X = 992, FW = 416;
    W.sec("add-person-drawer");
    const panel = W.rect("panel", 960, 64, 480, 960, {fill: C.white});
    panel.shadows = [{style: "drop-shadow", offsetX: -6, offsetY: 0, blur: 18, spread: 0, color: {color: "#000000", opacity: 0.12}, hidden: false}];
    W.rect("panel-edge", 960, 64, 1, 960, {fill: C.line});
    W.text("title", X, 88, "Add person", {size: 22, weight: 700});
    W.text("close", 1392, 90, "✕", {size: 18, color: C.txt2});
    W.text("subtitle", X, 120, "They get an SMS with a one-time link to accept the invite.", {size: 13, color: C.txt2});
    W.field("name", X, 152, FW, "Full name", "Emeka Nwosu");
    W.field("phone", X, 234, FW, "Phone number", "+234 812 445 0193");
    W.field("organisation", X, 316, FW, "Organisation", "CCECC · Contractor", {chevron: true, hint: "The organisation's type decides which roles can be given."});
    W.text("role-label", X, 418, "Role", {size: 13, weight: 600});
    W.text("role-filter-tag", X + 40, 419, "Filtered for contractor organisations", {size: 12, color: C.txt2});
    [["Contractor site manager", true], ["Contractor commercial manager", false]].forEach(([r, on], i) => {
      const ry = 442 + i * 40, k = `role-option-${i + 1}`;
      W.rect(`${k}-row`, X, ry, FW, 34, {fill: on ? C.panel : C.white, stroke: on ? C.txt2 : C.line, r: 4, sw: on ? 1.5 : 1});
      W.ellipse(`${k}-radio`, X + 12, ry + 9, 16, 16, {fill: C.white, stroke: on ? C.txt : C.txt3, sw: on ? 5 : 1.5});
      W.text(`${k}-label`, X + 38, ry + 8, r, {size: 13, weight: on ? 600 : 400});
    });
    W.text("role-hidden-note", X, 524, "Ministry, NRC and consultant roles are hidden for this organisation.", {size: 12, color: C.txt3});
    W.text("lots-label", X, 556, "Projects and lots", {size: 13, weight: 600});
    W.rect("lots-box", X, 578, FW, 196, {fill: C.white, stroke: C.line, r: 4});
    [[0, "Kaduna–Kano SGR", "partial"], [1, "Lot 1 · km 0+000 to 68+000", false], [1, "Lot 2 · km 68+000 to 137+000", true], [1, "Lot 3 · km 137+000 to 203+000", false], [0, "Port Harcourt–Maiduguri", false], [1, "Lot 1 · km 0+000 to 96+000", false]].forEach(([lvl, label, st], i) => {
      const ly = 592 + i * 29, k = `lots-item-${i + 1}`, lx = X + 14 + lvl * 26;
      if (st === "partial") { W.rect(`${k}-box`, lx, ly, 18, 18, {fill: C.white, stroke: C.txt2, r: 3, sw: 1.5}); W.rect(`${k}-dash`, lx + 4, ly + 8, 10, 2, {fill: C.txt2}); }
      else W.checkbox(k, lx, ly, st);
      W.text(`${k}-label`, lx + 28, ly, label, {size: 13, weight: lvl === 0 ? 700 : 400});
    });
    W.text("lots-hint", X, 780, "Only projects where CCECC holds a lot are listed.", {size: 12, color: C.txt2});
    W.rect("confirm-notice-bg", X, 812, FW, 56, {fill: C.panel, r: 4});
    W.text("confirm-notice", X + 14, 820, "External organisation: the Director confirms this account (W7.8) before it becomes active.", {size: 12, w: FW - 28});
    W.rect("footer-divider", 960, 944, 480, 1, {fill: C.line});
    W.button("cancel-button", 1120, 962, 120, 44, "Cancel", "secondary", {key: "cancel"});
    W.button("send-invite-button", 1256, 962, 152, 44, "Send invite", "primary", {key: "send-invite"});
    W.end();
  } else {
    W.sec("toast");
    W.group("toast-message", () => {
      const t = W.rect("bg", 500, 952, 440, 48, {fill: C.accent, r: 8});
      t.shadows = [{style: "drop-shadow", offsetX: 0, offsetY: 4, blur: 12, spread: 0, color: {color: "#000000", opacity: 0.2}, hidden: false}];
      W.text("label", 520, 952, "✓  Invite sent; Director to confirm", {size: 14, weight: 600, color: C.white, w: 300, h: 48, valign: "center"});
      W.text("action", 820, 952, "View task →", {size: 14, weight: 700, color: C.white, w: 104, h: 48, align: "right", valign: "center"});
    }, "toast");
    W.end();
  }
  W.sec("admin-nav-links"); W.reg("admin1", W.hot("s1-organisations-hit", 0, 88, 220, 40)); W.end();
  if (inv) { W.sec("handoff"); W.handoff("next-commercial-manager", 960, 963, "Next: a commercial manager accepts on the web ▸", "handoff-w2", {w: 316}); W.end(); }
  return W.finish(key);
};

  B["s2-users-invited"] = (x, y) => B["s2-users"](x, y, {invited: true});

  B["overlays/return-reasons"] = (x, y) => {
  const b = W.newBoard("overlays/return-reasons", x, y, 480, 420, C.white); b.borderRadius = 10; W.start(b);
  W.sec("reasons");
  W.text("title", 24, 22, "Why are you returning it?", {size: 18, weight: 700});
  W.text("subtitle", 24, 50, "It goes back to the previous person with this reason.", {size: 13, color: C.txt2});
  ["Photo unclear", "Wrong chainage", "Outside corridor", "Missing document", "Amount disputed", "Other (add a short note)"].forEach((r, i) => {
    const ry = 82 + i * 42, sel = i === 0, k = `reason-${i + 1}`;
    W.rect(`${k}-row`, 24, ry, 432, 36, {fill: sel ? C.panel : C.bg, stroke: sel ? C.txt2 : null, sw: 1.5, r: 4});
    W.ellipse(`${k}-radio`, 36, ry + 10, 16, 16, {fill: C.white, stroke: sel ? C.txt : C.txt3, sw: sel ? 5 : 1.5});
    W.text(`${k}-label`, 62, ry + 9, r, {size: 14, weight: sel ? 600 : 400});
  });
  W.end();
  W.sec("actions");
  W.button("cancel-button", 196, 352, 120, 44, "Cancel", "secondary", {key: "cancel"});
  W.button("send-back-button", 328, 352, 128, 44, "Send back", "primary", {key: "send-back"});
  W.end();
  return W.finish("overlays/return-reasons");
};

  B["w3-map-home"] = (x, y) => {
  const {b} = W.importSvgBoard("w3-map-home", storage.svgW3, x, y);
  W.hotspots([["app-title", 16, 12, 260, 40], ["new-project", 1248, 88, 168, 40], ["corridor-kaduna-kano", 880, 322, 64, 128],
    ["open-project", 1064, 768, 160, 44], ["set-current", 1240, 768, 152, 44],
    ["task-confirm-gate", 16, 128, 308, 84], ["task-approve-ipc", 16, 224, 308, 84], ["task-flagged-photo", 16, 320, 308, 84], ["task-confirm-account", 16, 416, 308, 84], ["see-all-tasks", 20, 524, 100, 24]]);
  W.w3Additions(b);
  return W.finish("w3-map-home");
};

  B["w5-project-view"] = (x, y) => {
  W.importSvgBoard("w5-project-view", storage.svgW5, x, y);
  const hs = [["back", 16, 26, 112, 22]];
  W.NAV5.forEach((n, i) => hs.push([`nav${i + 1}`, 0, 113 + i * 44, 240, 44]));
  W.hotspots(hs);
  return W.finish("w5-project-view");
};

  B["w8-portfolio"] = (x, y) => {
  const b = W.newBoard("screens/w8-portfolio", x, y, 1440, 1024, C.white); W.start(b);
  W.webHeader("Portfolio", "← Back to map", "Permanent Secretary's office", "Call support");
  W.sec("toolbar");
  W.text("title", 40, 88, "All projects", {size: 24, weight: 700});
  W.text("subtitle", 40, 122, "8 projects · sorted by days at gate, longest first · W8.2", {size: 13, color: C.txt2});
  W.button("export-button", 1288, 88, 112, 40, "Export", "secondary", {key: "export"});
  W.text("export-hint", 1132, 136, "PDF or Excel of this view", {size: 12, color: C.txt3, w: 268, align: "right"});
  W.end();
  W.sec("projects-table");
  const cols = [["Project", 56], ["Status", 336], ["Gate", 486], ["Days at gate", 676], ["Physical", 786], ["Financial", 866], ["Next milestone", 956], ["Waiting on", 1176]];
  W.rect("table-bg", 40, 160, 1360, 418, {fill: C.white, stroke: C.line, r: 6});
  W.rect("header-row", 40, 160, 1360, 34, {fill: C.panel, r: 6});
  cols.forEach(([c, cx]) => W.text(`col-${c.toLowerCase().replace(/ /g, "-")}`, cx, 169, c + (c === "Days at gate" ? " ▾" : ""), {size: 12, weight: 700, color: C.txt2}));
  [["Port Harcourt–Maiduguri rehabilitation", "Stalled", "10 Right-of-way", "63", "31%", "44%", "Aba–Umuahia handover", "State governors"],
   ["Lagos–Calabar coastal", "Funded", "6 BPP no objection", "9", "0%", "0%", "BPP certificate", "BPP"],
   ["Ibadan–Abuja SGR", "Contracted", "9 Environment", "37", "4%", "9%", "EIA certificate", "FMEnv"],
   ["Kaduna–Kano SGR", "Under construction", "13 Certify and pay", "12", "68%", "71%", "Zaria station", "Director (IPC 14)"],
   ["Abuja–Itakpe extension", "Identified", "2 Feasibility", "9", "0%", "0%", "Feasibility study", "PS and Minister"],
   ["Lagos–Ibadan SGR", "Operational", "15 Handover", "6", "100%", "97%", "Defects close-out", "Auditor-General"],
   ["Abuja–Kaduna SGR", "Operational", "15 Handover", "3", "100%", "100%", "Final account", "NRC"],
   ["Warri–Itakpe SGR", "Operational", "Closed", "—", "100%", "100%", "—", "—"]].forEach((r, i) => {
    const ry = 194 + i * 48, k = `row-${i + 1}`;
    if (i) W.rect(`${k}-rule`, 40, ry, 1360, 1, {fill: C.lineSoft});
    W.text(`${k}-project`, 56, ry + 15, r[0], {size: 13, weight: 600});
    W.chip(`${k}-status`, 336, ry + 13, 132, r[1], {fill: r[1] === "Stalled" ? C.fillMid : C.fillSoft});
    W.text(`${k}-gate`, 486, ry + 15, r[2], {size: 13});
    W.text(`${k}-days`, 676, ry + 15, r[3], {size: 13, weight: 700});
    W.text(`${k}-physical`, 786, ry + 15, r[4], {size: 13});
    W.text(`${k}-financial`, 866, ry + 15, r[5], {size: 13});
    W.text(`${k}-next`, 956, ry + 15, r[6], {size: 13});
    W.text(`${k}-waiting`, 1176, ry + 15, r[7], {size: 13, color: C.txt2});
  });
  W.end();
  W.sec("chart-track-km");
  W.card("track-km", 40, 602, 668, 318, "Track-km laid per month · all projects");
  const vals = [4.2, 5.1, 3.8, 6.0, 6.4, 5.5, 7.1, 6.8, 2.9, 3.4, 6.2, 7.0];
  const months = ["N", "D", "J", "F", "M", "A", "M", "J", "J", "A", "S", "O"];
  W.rect("axis", 72, 880, 616, 1, {fill: C.line});
  vals.forEach((v, i) => { const h = v * 28; W.rect(`bar-${i + 1}`, 84 + i * 50, 880 - h, 30, h, {fill: i === 11 ? C.txt2 : C.fillMid, r: 2}); W.text(`month-${i + 1}`, 84 + i * 50, 888, months[i], {size: 11, color: C.txt2, w: 30, align: "center"}); });
  W.text("max-label", 56, 640, "8 km", {size: 11, color: C.txt3});
  W.end();
  W.sec("chart-spend");
  W.card("spend", 732, 602, 668, 318, "Spend against plan · ₦ billion, cumulative");
  W.rect("axis", 764, 880, 616, 1, {fill: C.line});
  W.path("planned", "M776,860 L828,844 L880,828 L932,811 L984,795 L1036,778 L1088,762 L1140,746 L1192,729 L1244,713 L1296,696 L1348,680", {dash: true, sw: 2, color: C.txt3});
  W.path("actual", "M776,862 L828,850 L880,838 L932,822 L984,808 L1036,794 L1088,778 L1140,764 L1192,754 L1244,744 L1296,730 L1348,718", {sw: 3, color: C.txt});
  W.path("legend-planned", "M764,644 L796,644", {dash: true, sw: 2, color: C.txt3});
  W.text("legend-planned-label", 804, 636, "Planned", {size: 12, color: C.txt2});
  W.path("legend-actual", "M880,644 L912,644", {sw: 3, color: C.txt});
  W.text("legend-actual-label", 920, 636, "Actual", {size: 12, color: C.txt2});
  W.text("gap-note", 1200, 636, "₦96bn behind plan", {size: 12, weight: 700, w: 184, align: "right"});
  W.end();
  return W.finish("w8-portfolio");
};

  B["w5-project-view-draft"] = (x, y) => {
  W.w5Start("w5-project-view-draft", x, y, 0, {draft: true, title: "Kano–Maradi SGR (393 km)", status: "Draft", statusW: 72, statusFill: C.fillMid, gate: "Gate 1 · awaiting publishing", complete: "0% complete", orgs: "No contractor yet"});
  W.sec("draft-banner");
  W.rect("bg", 272, 116, 1144, 64, {fill: C.white, stroke: C.txt3, dash: true, sw: 1.5, r: 6});
  W.chip("draft", 292, 136, 64, "Draft", {fill: C.fillMid, weight: 700});
  W.text("title", 372, 128, "Not published · publish pending", {size: 15, weight: 700});
  W.text("detail", 372, 150, "Only you and the Director see this page. Engr. H. Danjuma has had the Publish project task since today 09:40.", {size: 13, color: C.txt2});
  W.clickText("back-to-review", 1236, 139, "Back to review →", {size: 13, weight: 700, w: 160, align: "right"}, "back-to-review");
  W.end();
  W.sec("gates");
  W.card("gates", 272, 200, 1144, 168, "Gates · external loan template");
  W.text("subtitle", 288, 236, "Gate 1 awaiting the Director · gates 2 to 15 not started", {size: 13, color: C.txt2});
  for (let i = 0; i < 15; i++) {
    const gx = 288 + i * 74, first = i === 0;
    W.rect(`gate-${i + 1}`, gx, 270, 68, 80, {fill: first ? C.panel : C.white, stroke: first ? C.txt2 : C.line, dash: !first, sw: first ? 1.5 : 1, r: 4});
    W.text(`gate-${i + 1}-number`, gx, 284, String(i + 1), {size: 18, weight: 700, color: first ? C.txt : C.txt3, w: 68, align: "center"});
    W.text(`gate-${i + 1}-status`, gx, 318, first ? "Awaiting" : "Not started", {size: 11, weight: first ? 700 : 400, color: first ? C.txt : C.txt3, w: 68, align: "center"});
  }
  W.end();
  W.sec("corridor");
  W.card("corridor", 272, 388, 560, 400, "Corridor (draft)");
  W.rect("map", 288, 424, 528, 304, {fill: C.fillSoft, r: 4});
  W.path("line", "M360,690 L560,560 L760,460", {sw: 4, dash: true, color: "#8A8A8A"});
  [["kano", 360, 690, "Kano 0+000", 374, 690], ["katsina", 560, 560, "Katsina 190+000", 574, 560], ["maradi", 760, 460, "Maradi 393+000", 640, 438]].forEach(([k, px, py, l, lx, ly]) => {
    W.ellipse(`station-${k}`, px - 7, py - 7, 14, 14, {fill: C.white, stroke: C.txt2, sw: 2});
    W.text(`station-${k}-label`, lx, ly, l, {size: 12, weight: 600});
  });
  W.path("legend-line", "M288,752 L320,752", {sw: 3, dash: true, color: "#8A8A8A"});
  W.text("legend", 330, 744, "Draft corridor · visible to you and the Director", {size: 12, color: C.txt2});
  W.end();
  W.sec("progress");
  W.card("progress", 852, 388, 564, 190, "Progress");
  W.text("summary", 868, 424, "Physical 0% · Financial 0%", {size: 14});
  ["Earthworks", "Structures", "Track laying"].forEach((n, i) => {
    W.text(`${n.toLowerCase().replace(/ /g, "-")}-label`, 868, 452 + i * 28, n, {size: 13});
    W.rect(`${n.toLowerCase().replace(/ /g, "-")}-bar`, 1000, 456 + i * 28, 396, 12, {fill: C.fillSoft, r: 2});
  });
  W.text("note", 868, 544, "Progress starts after mobilisation (gate 11).", {size: 12, color: C.txt2});
  W.end();
  W.sec("photos");
  W.card("photos", 852, 598, 564, 190, "Latest verified photo");
  W.rect("empty", 868, 630, 532, 110, {fill: C.panel, stroke: C.line, dash: true, r: 4});
  W.text("empty-label", 868, 676, "No photos yet", {size: 14, weight: 600, color: C.txt2, w: 532, align: "center"});
  W.text("note", 868, 754, "Field photos start when lots are created at gate 8.", {size: 12, color: C.txt2});
  W.end();
  W.sec("on-publishing");
  W.rect("bg", 272, 808, 1144, 136, {fill: C.panel, r: 6});
  W.text("title", 292, 824, "What publishing does", {size: 14, weight: 700});
  [["Confirms gate 1", "With the Director's PIN; written to the audit log."], ["Draws the corridor", "Status Identified, visible to every member of the project."], ["Opens gates 2 to 15", "The PS and the Minister can see the project from then on."]].forEach(([t, d], i) => {
    W.text(`point-${i + 1}-title`, 292 + i * 376, 858, t, {size: 13, weight: 700});
    W.text(`point-${i + 1}-detail`, 292 + i * 376, 880, d, {size: 13, color: C.txt2, w: 340});
  });
  W.end();
  return W.finish("w5-project-view-draft");
};

  B["w5-people"] = (x, y) => {
  W.w5Start("w5-people", x, y, 10);
  W.sec("people");
  W.secTitle("People", "Kaduna–Kano SGR · 11 members from 6 organisations · responsibilities come from the gate template");
  W.button("add-member-button", 1272, 116, 144, 40, "+ Add member", "primary", {key: "add-member", size: 14});
  W.end();
  W.sec("members");
  W.card("members", 272, 180, 360, 764, "Members");
  [["Engr. A. Bello", "Project manager · FMoT Rail directorate"], ["Engr. H. Danjuma", "Director, rail · FMoT Rail directorate"], ["Engr. F. Musa", "NRC project engineer · NRC"], ["Engr. K. Adeyemi", "Consultant resident engineer · TEAM"], ["Li Wei", "Contractor commercial manager · CCECC"], ["Musa Garba", "Site manager, Lot 2 · CCECC"], ["Emeka Nwosu", "Site manager, Lot 2 · CCECC · invited"], ["Grace Eze", "Finance officer · FMoT Finance"], ["Bola Ade", "Procurement officer · FMoT Procurement"], ["N. Okoro", "Legal officer · FMoT Legal"], ["China Exim viewers (2)", "Lender viewer · read-only"]].forEach(([n, r], i) => {
    const ry = 216 + i * 64, k = `member-${i + 1}`;
    if (i) W.rect(`${k}-rule`, 288, ry - 8, 328, 1, {fill: C.lineSoft});
    W.ellipse(`${k}-avatar`, 288, ry + 4, 36, 36, {fill: C.fillMid});
    W.text(`${k}-name`, 336, ry + 2, n, {size: 14, weight: 700});
    W.text(`${k}-role`, 336, ry + 24, r, {size: 12, color: C.txt2});
  });
  W.end();
  W.sec("responsibility-matrix");
  W.card("matrix", 652, 180, 764, 764, "Who does what at each gate");
  W.text("source", 668, 218, "External-loan template · names from project membership · current gate highlighted", {size: 12, color: C.txt2});
  W.matrix("matrix", 668, 246, 732, [
    ["1 Initiation", "A. Bello", "—", "Minister's office", "Passed"],
    ["2 Feasibility", "A. Bello", "F. Musa (NRC)", "PS and Minister", "Passed"],
    ["3 Funding route", "A. Bello", "—", "Minister", "Passed"],
    ["4 Funding approved", "G. Eze (Finance)", "—", "H. Danjuma confirms", "Passed"],
    ["5 Tender", "B. Ade (Procurement)", "—", "H. Danjuma confirms", "Passed"],
    ["6 BPP no objection", "B. Ade (Procurement)", "—", "H. Danjuma confirms", "Passed"],
    ["7 FEC award", "B. Ade (Procurement)", "—", "H. Danjuma confirms", "Passed"],
    ["8 Contract executed", "N. Okoro (Legal)", "—", "H. Danjuma confirms", "Passed"],
    ["9 Environment", "A. Bello", "—", "H. Danjuma confirms", "Passed"],
    ["10 Right-of-way", "A. Bello", "—", "H. Danjuma confirms", "Blocked"],
    ["11 Financial close", "G. Eze (Finance)", "—", "H. Danjuma confirms", "Passed"],
    ["12 Design", "Li Wei (CCECC)", "K. Adeyemi (TEAM)", "F. Musa (NRC)", "Passed"],
    ["13 Certify and pay", "Li Wei (CCECC)", "K. Adeyemi (TEAM)", "F. Musa, H. Danjuma, PS", "Current"],
    ["14 Commissioning", "Li Wei (CCECC)", "F. Musa (NRC)", "NRC", "Not started"],
    ["15 Handover", "NRC asset manager", "—", "Ministry, NRC, A-G", "Not started"]],
    {heads: ["Gate", "Uploads", "Verifies", "Approves", "Status"], cols: [0, 0.22, 0.44, 0.62, 0.86], rh: 40, fs: 12, highlight: 12});
  W.text("rules", 668, 886, "Separation of duties: on one IPC the submitter, verifier, certifier and payment approver are four people from at least three organisations. Evidence gates need an uploader and a different confirmer.", {size: 12, color: C.txt2, w: 732});
  W.end();
  return W.finish("w5-people");
};

  B["w5-land"] = (x, y) => {
  W.w5Start("w5-land", x, y, 8);
  W.sec("land");
  W.secTitle("Land and community", "Gate 10 Right-of-way · blocked 41 days · compensation for km 140–152 not yet paid");
  W.button("add-parcel-button", 1272, 116, 144, 40, "+ Add parcel", "primary", {key: "add-parcel", size: 14});
  W.end();
  W.sec("section-availability");
  W.card("availability", 272, 180, 1144, 150, "Section availability · km 0 to 203");
  const kx = km => 296 + Math.round(km * 1096 / 203);
  W.rect("bar-available-1", kx(0), 222, kx(140) - kx(0), 28, {fill: C.fillMid});
  W.rect("bar-blocked", kx(140), 222, kx(152) - kx(140), 28, {fill: C.red});
  W.rect("bar-available-2", kx(152), 222, kx(203) - kx(152), 28, {fill: C.fillMid});
  [[0, "km 0"], [140, "km 140"], [152, "km 152"], [203, "km 203"]].forEach(([km, l], i) => W.text(`tick-${km}`, i === 3 ? kx(km) - 46 : i === 1 ? kx(km) - 44 : kx(km), 258, l, {size: 12, color: C.txt2}));
  W.rect("legend-available", 296, 292, 14, 14, {fill: C.fillMid});
  W.text("legend-available-label", 316, 290, "Available to the contractor · 191 km", {size: 12});
  W.rect("legend-blocked", 576, 292, 14, 14, {fill: C.red});
  W.text("legend-blocked-label", 596, 290, "Blocked: compensation unpaid · 12 km · Lot 3", {size: 12});
  W.end();
  W.sec("parcel-register");
  W.card("parcels", 272, 350, 744, 594, "Parcel register · km 140 to 152");
  W.text("parcels-count", 816, 365, "Showing 8 of 64 parcels", {size: 12, color: C.txt2, w: 184, align: "right"});
  const cx = [288, 372, 476, 680, 780, 868];
  W.rect("header-row", 280, 396, 728, 28, {fill: C.panel, r: 4});
  ["Parcel", "Chainage", "Owner or community", "Valuation", "Paid", "Status"].forEach((c, i) => W.text(`col-${c.toLowerCase().replace(/ /g, "-")}`, cx[i], 402, c, {size: 12, weight: 700, color: C.txt2}));
  [["P-140-01", "km 140+050", "Malam Sani Garba", "₦4.2m", "₦0", "Unpaid"],
   ["P-140-02", "km 140+620", "Kofar Gabas community", "₦18.6m", "₦0", "Disputed"],
   ["P-141-03", "km 141+300", "Hajiya Amina Yusuf", "₦3.1m", "₦3.1m", "Paid"],
   ["P-143-01", "km 143+900", "Unguwar Rimi farmers", "₦26.0m", "₦0", "Unpaid"],
   ["P-146-02", "km 146+150", "Alhaji Bello Musa", "₦7.8m", "₦0", "Unpaid"],
   ["P-148-04", "km 148+700", "Dan Kade community", "₦12.4m", "₦0", "Valuation queried"],
   ["P-150-01", "km 150+200", "Ibrahim Lawan", "₦2.9m", "₦2.9m", "Paid"],
   ["P-151-02", "km 151+800", "Gidan Waya church", "₦5.5m", "₦0", "Unpaid"]].forEach((r, i) => {
    const ry = 424 + i * 50, k = `row-${i + 1}`;
    if (i) W.rect(`${k}-rule`, 280, ry, 728, 1, {fill: C.lineSoft});
    r.forEach((c, ci) => W.text(`${k}-${["parcel", "chainage", "owner", "valuation", "paid", "status"][ci]}`, cx[ci], ry + 16, c, {size: 13, weight: ci === 0 || (ci === 5 && c !== "Paid") ? 700 : 400, color: ci === 5 && c === "Paid" ? C.txt2 : C.txt}));
  });
  W.text("summary", 288, 838, "64 parcels · 51 paid · 13 unpaid, ₦96.4m · funds requested from Finance on 2 Oct 2026", {size: 13});
  W.text("source", 288, 862, "Valuations by the State Land Bureau under the Land Use Act; payments released by Finance.", {size: 12, color: C.txt2});
  W.end();
  W.sec("grievance-log");
  W.card("grievances", 1036, 350, 380, 594, "Grievance log");
  W.text("grievances-count", 1236, 365, "3 open", {size: 12, color: C.txt2, w: 164, align: "right"});
  [["G-031", "Open", "Kofar Gabas community disputes the farmland valuation", "km 140+620 · 12 days"],
   ["G-029", "Escalated", "Crops destroyed before compensation was paid", "km 143+900 · 20 days"],
   ["G-027", "Open", "Access road to the market cut by the embankment", "km 145+400 · 26 days"],
   ["G-022", "Resolved", "Wrong name on the compensation list", "km 141+300 · closed 3 Oct"],
   ["G-019", "Resolved", "Grave relocation agreed with the family", "km 150+200 · closed 18 Sep"]].forEach(([ref, st, t, m], i) => {
    const gy = 396 + i * 104, k = `grievance-${i + 1}`;
    W.rect(`${k}-bg`, 1052, gy, 348, 92, {fill: st === "Resolved" ? C.white : C.bg, stroke: C.lineSoft, r: 4});
    W.text(`${k}-ref`, 1068, gy + 12, ref, {size: 13, weight: 700});
    W.chip(`${k}-status`, 1300, gy + 10, 84, st, {fill: st === "Escalated" ? C.fillMid : st === "Open" ? C.white : C.fillSoft, stroke: st === "Open" ? C.txt2 : null, color: st === "Resolved" ? C.txt2 : C.txt});
    W.text(`${k}-text`, 1068, gy + 38, t, {size: 13, w: 316});
    W.text(`${k}-meta`, 1068, gy + 64, m, {size: 12, color: C.txt2});
  });
  W.end();
  return W.finish("w5-land");
};

  B["s1-organisations"] = (x, y) => {
  const b = W.newBoard("screens/s1-organisations", x, y, 1440, 1024, C.white); W.start(b);
  W.webHeader("Setup", "Setup and administration", "Ade Ogun · IT administrator", "Call support");
  W.adminNav(0);
  W.sec("organisations-toolbar");
  W.text("title", 244, 88, "Organisations", {size: 24, weight: 700});
  W.text("count", 244, 122, "38 organisations · 2 external awaiting the Director", {size: 13, color: C.txt2});
  W.button("add-organisation-button", 744, 88, 192, 40, "+ Add organisation", "primary", {key: "add-org"});
  W.rect("search-input", 244, 152, 300, 36, {fill: C.white, stroke: C.line, r: 4});
  W.text("search-placeholder", 256, 161, "Search name or registration number", {size: 13, color: C.txt3});
  [["Type", 556, 76], ["Status", 644, 82]].forEach(([f, fx, w]) => W.chip(`filter-${f.toLowerCase()}`, fx, 156, w, f + " ▾", {h: 28, fill: C.white, stroke: C.line, weight: 400}));
  W.end();
  W.sec("organisations-table");
  const cols = [244, 452, 588, 868];
  W.rect("header-row", 236, 204, 708, 32, {fill: C.panel, r: 4});
  ["Organisation", "Type", "Projects and lots", "People"].forEach((c, i) => W.text(`header-${c.toLowerCase().replace(/ /g, "-")}`, cols[i], 212, c, {size: 12, weight: 700, color: C.txt2, w: i === 3 ? 60 : undefined, align: i === 3 ? "right" : undefined}));
  [["FMoT Rail directorate", "Ministry unit", "All rail projects", "24", "Internal"],
   ["FMoT Finance", "Ministry unit", "Assigned projects", "9", "Internal"],
   ["FMoT Procurement", "Ministry unit", "Assigned projects", "7", "Internal"],
   ["NRC", "Agency", "All corridors", "31", "Internal"],
   ["TEAM Consultants", "Supervising consultant", "Kaduna–Kano · Lots 1 to 3", "12", "Confirmed"],
   ["CCECC", "Contractor", "Kaduna–Kano · Lots 1 to 3", "46", "Confirmed"],
   ["Mota-Engil", "Contractor", "Port Harcourt–Maiduguri · Lot 2", "18", "Confirmed"],
   ["China Exim Bank", "Lender", "Kaduna–Kano (read-only)", "2", "Confirmed"],
   ["AfDB", "Lender", "Lagos–Calabar (read-only)", "3", "Confirmed"],
   ["Auditor-General", "Oversight", "All projects (audit log)", "4", "Confirmed"],
   ["Eastern Rail JV", "Contractor", "Port Harcourt–Maiduguri · Lot 3", "0", "Awaiting Director"]].forEach((r, i) => {
    const ry = 244 + i * 56, k = `row-${i + 1}`, isNew = i === 10;
    if (isNew) W.rect(`${k}-new-highlight`, 236, ry, 708, 55, {fill: C.panel});
    W.text(`${k}-name`, cols[0], ry + 8, r[0], {size: 14, weight: 600});
    W.text(`${k}-status`, cols[0], ry + 28, r[4], {size: 12, color: isNew ? C.txt : C.txt2, weight: isNew ? 700 : 400});
    W.text(`${k}-type`, cols[1], ry + 18, r[1], {size: 12});
    W.text(`${k}-scope`, cols[2], ry + 18, r[2], {size: 12, color: C.txt2});
    W.text(`${k}-people`, cols[3], ry + 17, r[3], {size: 13, w: 60, align: "right", color: r[3] === "0" ? C.txt3 : C.txt});
    W.rect(`${k}-rule`, 236, ry + 55, 708, 1, {fill: C.lineSoft});
  });
  W.text("pagination", 244, 872, "Showing 11 of 38 · Next page →", {size: 13, color: C.txt2});
  W.end();
  W.sec("add-organisation-drawer");
  const X = 968, FW = 424;
  const d = W.rect("panel", 944, 64, 496, 960, {fill: C.white, stroke: C.line});
  d.shadows = [{style: "drop-shadow", offsetX: -4, offsetY: 0, blur: 16, spread: 0, color: {color: "#000000", opacity: 0.08}, hidden: false}];
  W.text("title", X, 88, "Add organisation", {size: 20, weight: 700});
  W.text("intro", X, 118, "Organisations come first; people are then added to one. External organisations need the Director to confirm them.", {size: 13, color: C.txt2, w: FW});
  W.field("name", X, 172, FW, "Name", "Eastern Rail JV");
  W.field("type", X, 254, FW, "Type", "Contractor", {chevron: true});
  W.field("registration", X, 336, FW, "CAC registration number", "RC 1984 552");
  W.text("scope-label", X, 418, "Projects and lots", {size: 13, weight: 600});
  W.rect("scope-box", X, 440, FW, 112, {fill: C.white, stroke: C.line, r: 4});
  [[0, "Port Harcourt–Maiduguri", "partial"], [1, "Lot 3 · km 600+000 to 900+000", true], [1, "Lot 4 · km 900+000 to 1,443+000", false]].forEach(([lvl, label, st], i) => {
    const ty = 452 + i * 32, tx = X + 12 + lvl * 24;
    W.checkbox(`scope-${i + 1}`, tx, ty, st === true);
    if (st === "partial") W.rect(`scope-${i + 1}-partial`, tx + 4, ty + 8, 10, 2, {fill: C.txt2});
    W.text(`scope-${i + 1}-label`, tx + 28, ty, label, {size: 13});
  });
  W.field("contact", X, 572, FW, "Main contact (becomes the first person)", "Musa Lawal · 0812 330 7781");
  W.rect("note-bg", X, 664, FW, 64, {fill: C.panel, r: 6});
  W.text("note", X + 16, 676, "Saving sends a Confirm organisation task to the Director, rail. People can be added now; they stay invited until it is confirmed.", {size: 13, w: FW - 32});
  W.button("cancel-button", X, 960, 120, 44, "Cancel", "secondary", {key: "cancel"});
  W.button("save-button", X + FW - 220, 960, 220, 44, "Save and add people", "primary", {key: "save-add-people"});
  W.end();
  return W.finish("s1-organisations");
};

  B["w2-accept-invite"] = (x, y) => {
  const b = W.newBoard("screens/w2-accept-invite", x, y, 1440, 1024, C.bg); W.start(b);
  W.sec("top-bar");
  W.text("app-title", 40, 32, "FMoT Rail Project Tracker", {size: 20, weight: 700});
  W.text("ministry", 40, 60, "Federal Ministry of Transportation", {size: 13, color: C.txt2});
  W.end();
  W.sec("accept-card");
  const cx = 500, cw = 440;
  const card = W.rect("card", cx, 120, cw, 820, {fill: C.white, stroke: C.line, r: 10});
  card.shadows = [{style: "drop-shadow", offsetX: 0, offsetY: 4, blur: 16, spread: 0, color: {color: "#000000", opacity: 0.06}, hidden: false}];
  W.text("title", cx + 40, 152, "Accept your invitation", {size: 26, weight: 700});
  W.text("intro", cx + 40, 190, "CCECC asked for this account and the Director, rail confirmed it on 29 Oct 2026.", {size: 13, color: C.txt2, w: cw - 80});
  W.rect("summary-bg", cx + 40, 232, cw - 80, 112, {fill: C.panel, r: 6});
  W.kv("summary", cx + 56, 244, [["Name", "Zhang Min"], ["Role", "Contractor commercial manager"], ["Organisation", "CCECC"], ["Projects", "Kaduna–Kano SGR · Lots 1 to 3"]], 104, 220, 22);
  W.field("phone", cx + 40, 364, cw - 80, "Phone number", "0809 118 4420 · from the invite", {fill: C.panel});
  W.field("sms-code", cx + 40, 446, cw - 80, "SMS code", "4 8 1 9 0 2", {hint: "Sent to 0809 118 4420 at 10:31 · valid for 15 minutes"});
  W.text("pin-label", cx + 40, 548, "Set a 4-digit PIN", {size: 13, weight: 600});
  [0, 1, 2, 3].forEach(i => W.ellipse(`pin-dot-${i + 1}`, cx + 172 + i * 28, 572, 16, 16, {fill: i < 2 ? C.txt : C.white, stroke: i < 2 ? null : C.txt2, sw: 1.5}));
  W.text("pin-hint", cx + 40, 600, "You use the PIN to sign in and to approve; never share it.", {size: 12, color: C.txt2});
  W.checkbox("terms", cx + 40, 640, true);
  W.text("terms-label", cx + 68, 639, "I accept the terms of use; every action I take is recorded in the audit log.", {size: 13, w: cw - 108});
  W.button("accept-button", cx + 40, 700, cw - 80, 52, "Accept and sign in", "primary", {size: 17, key: "accept"});
  W.rect("field-note-bg", cx + 40, 772, cw - 80, 64, {fill: C.panel, r: 6});
  W.text("field-note", cx + 56, 784, "Site staff use the phone app instead: the invite SMS opens it (M1).", {size: 13, w: cw - 112});
  W.text("call-support", cx + 40, 860, "Problem with the code? Call support · 0700 RAIL 000", {size: 13, weight: 600, w: cw - 80, align: "center"});
  W.text("legal", cx + 40, 896, "Use of this system is recorded under the Nigeria Data Protection Act.", {size: 11, color: C.txt3, w: cw - 80, align: "center"});
  W.end();
  return W.finish("w2-accept-invite");
};

  B["m8-outbox"] = (x, y) => {
  W.mStart("m8-outbox", x, y); W.statusBar(false);
  W.mTopBar("Your photos");
  W.sec("summary");
  W.text("subtitle", 20, 112, "Lot 2 · Kaduna–Kano SGR · last sync just now", {size: 13, color: C.txt2});
  [["Queued 1", 78], ["Sent 3", 62], ["Verified 12", 88], ["Sent back 2", 92]].reduce((cx, [l, w]) => { const s = W.STATUS_STYLE[l.replace(/ \d+$/, "")]; W.chip(`filter-${l.toLowerCase().replace(/ /g, "-")}`, cx, 140, w, l, {h: 28, size: 12, fill: s.fill, stroke: s.stroke, dash: s.dash, color: s.color}); return cx + w + 6; }, 20);
  W.end();
  W.sec("status-ladder");
  W.rect("bg", 20, 184, 350, 228, {fill: C.panel, r: 8});
  W.text("title", 36, 196, "What each status means", {size: 14, weight: 700});
  [["Queued", "On this phone; sends when there is signal"], ["Sent", "On the server; checks running"], ["Checked, pending RE", "Waiting for the resident engineer"], ["Verified", "Counts toward progress and payment"], ["Sent back", "Returned with a reason; take it again"]].forEach(([st, d], i) => {
    const ry = 226 + i * 36, k = st.toLowerCase().replace(/[^a-z]+/g, "-");
    W.statusChip(`${k}`, 36, ry, 124, st);
    W.text(`${k}-meaning`, 172, ry + 3, d, {size: 12, w: 186});
  });
  W.end();
  W.sec("list");
  W.text("heading", 20, 428, "TODAY AND YESTERDAY", {size: 11, weight: 700, color: C.txt2});
  [["km 142+600 · Drainage", "10:58 · waiting for signal", "Queued"], ["km 142+300 · Earthworks", "10:52 · checks running", "Sent"], ["km 141+900 · Culvert C-15", "10:31 · in the RE's queue", "Pending RE"], ["km 140+100 · Embankment", "09:58 · Engr. K. Adeyemi", "Verified"], ["km 103+900 · Earthworks", "Yesterday · photo unclear", "Sent back"]].forEach(([t, m, st], i) => {
    const ry = 452 + i * 64, k = `item-${i + 1}`;
    const g = W.group(k, () => {
      W.rect(`${k}-bg`, 20, ry, 350, 56, {fill: C.white, stroke: C.lineSoft, r: 6});
      W.placeholder(`${k}-thumbnail`, 28, ry + 6, 44, 44);
      W.text(`${k}-title`, 84, ry + 9, t, {size: 13, weight: 700});
      W.text(`${k}-meta`, 84, ry + 29, m, {size: 12, color: C.txt2});
      W.statusChip(`${k}-status`, 278, ry + 17, 84, st);
    }, st === "Sent back" ? "sent-back-item" : null);
  });
  W.end();
  W.homeBar();
  return W.finish("m8-outbox");
};

  B["m9-re-home"] = (x, y) => {
  W.mStart("m9-re-home", x, y); W.statusBar(false);
  W.sec("top-bar");
  W.text("greeting", 20, 56, "Good morning, Engr. Adeyemi", {size: 18, weight: 700});
  W.text("menu", 342, 56, "☰", {size: 20, color: C.txt2});
  W.text("role", 20, 82, "Resident engineer · TEAM Consultants · Lots 1 to 3", {size: 12, color: C.txt2});
  W.end();
  W.sec("verify-queue");
  W.rect("bg", 20, 108, 350, 330, {fill: C.panel, r: 8});
  W.text("title", 36, 120, "To verify · 14 photos", {size: 15, weight: 700});
  W.text("hint", 36, 142, "Swipe right to verify, left to send back", {size: 12, color: C.txt2});
  W.placeholder("photo", 36, 166, 318, 148);
  W.text("photo-meta", 36, 322, "km 142+300 · Earthworks · Musa Garba · 10:52", {size: 13, weight: 700});
  W.text("checks", 36, 344, "✓ In corridor  ✓ Time  ✓ Device  ✓ Not a duplicate", {size: 12, color: C.txt2});
  W.button("send-back-button", 36, 376, 150, 48, "Send back", "secondary", {key: "send-back"});
  W.button("verify-button", 204, 376, 150, 48, "Verify", "primary", {key: "verify"});
  W.end();
  W.sec("handoff");
  W.handoff("next-valuation", 238, 116, "Next: valuation ▸", "handoff-valuation", {w: 116, h: 24, fs: 11});
  W.end();
  W.sec("milestones");
  W.rect("bg", 20, 454, 350, 104, {fill: C.white, stroke: C.line, r: 8});
  W.text("title", 36, 466, "Milestones to verify · 2", {size: 15, weight: 700});
  W.text("item", 36, 492, "Embankment section 12", {size: 13});
  W.text("item-meta", 36, 512, "km 104+800 · claimed 08:15", {size: 12, color: C.txt2});
  W.button("verify-on-site-button", 222, 494, 132, 40, "Verify on site", "secondary", {key: "verify-on-site", size: 14});
  W.end();
  W.sec("tests");
  W.rect("bg", 20, 574, 350, 96, {fill: C.white, stroke: C.line, r: 8});
  W.text("title", 36, 586, "Tests witnessed this week", {size: 15, weight: 700});
  W.text("next", 36, 612, "Concrete cubes · culvert C-15 · Thu 10:00", {size: 13});
  W.text("done", 36, 634, "Compaction · embankment 12 · done, 98%", {size: 12, color: C.txt2});
  W.end();
  W.sec("call-support");
  W.group("call-support-button", () => {
    W.rect("button-bg", 20, 722, 350, 52, {fill: C.white, stroke: C.accent, r: 8, sw: 1.5});
    W.text("label", 20, 722, "☎  Call support", {size: 16, weight: 600, color: C.accent, w: 350, h: 52, align: "center", valign: "center"});
  }, "call-support");
  W.end();
  W.homeBar();
  return W.finish("m9-re-home");
};

  B["w7-verify-milestone"] = (x, y) => {
  W.w7Start("w7-verify-milestone", x, y); W.w7Inbox("verify-milestone");
  W.sec("milestone");
  W.detailHead("Kaduna–Kano SGR · Lot 2 · Milestones · W7.2", "Verify milestone · Embankment section 12", "Claimed by Musa Garba (CCECC site manager) · today 08:15 · km 104+300 to 104+800");
  W.end();
  W.sec("evidence");
  W.card("photos", L, 184, CW, 330, "Claim photos · 4");
  [[0, 0], [1, 0], [0, 1], [1, 1]].forEach(([cx, cy], i) => {
    W.placeholder(`photo-${i + 1}`, L + 16 + cx * 198, 216 + cy * 136, 190, 104);
    W.text(`photo-${i + 1}-meta`, L + 16 + cx * 198, 324 + cy * 136, ["km 104+320 · 27 Oct", "km 104+480 · 28 Oct", "km 104+650 · 29 Oct", "km 104+790 · 29 Oct"][i], {size: 12, color: C.txt2});
  });
  W.text("photos-checks", L + 16, 488, "All four inside the corridor · time, device and duplicate checks passed", {size: 12, color: C.txt2});
  W.card("claim", L, 534, CW, 196, "Claim");
  W.kv("claim", L + 16, 570, [["Milestone", "Embankment section 12"], ["Chainage", "km 104+300 to 104+800"], ["Quantity", "48,000 m³ of fill"], ["BOQ item", "2.3.1 Embankment fill"], ["Value", "₦412,000,000"]], 120, 268, 28);
  W.end();
  W.sec("checks");
  W.card("checklist", R, 184, CW, 236, "Check before verifying");
  [["Photos match the claimed chainage", true], ["Level survey attached (LS-12)", true], ["Compaction test 98%, witnessed by you", true], ["No open sent-back items on this section", false]].forEach(([t, on], i) => {
    W.checkbox(`item-${i + 1}`, R + 16, 222 + i * 44, on);
    W.text(`item-${i + 1}-label`, R + 44, 222 + i * 44, t, {size: 13, w: CW - 60});
  });
  W.text("open-item-note", R + 44, 386, "1 open: photo unclear at km 103+900", {size: 12, color: C.red});
  W.card("tests", R, 440, CW, 150, "Tests on this section");
  W.kv("tests", R + 16, 476, [["Compaction", "98% · passed · 27 Oct"], ["Level survey", "Within ±25 mm · 28 Oct"], ["Witnessed by", "Engr. K. Adeyemi (TEAM)"]], 120, 268, 28);
  W.rect("on-verify-bg", R, 610, CW, 120, {fill: C.panel, r: 6});
  W.text("on-verify-title", R + 16, 624, "On Verify", {size: 14, weight: 700});
  W.text("on-verify-text", R + 16, 648, "The milestone counts toward progress and goes into this month's measurement sheet (MS-10). Send back returns it to Musa Garba with a reason.", {size: 13, w: CW - 32});
  W.end();
  W.w7Actions("Verifying writes an audit row with your PIN.", ["send-back-button", "Send back…", 150], ["verify-button", "Verify (PIN)", 180]);
  return W.finish("w7-verify-milestone");
};

  // ---- checks, rebuild and prototype wiring ----
  storage.checkOverlaps = (board) => {
  const texts = penpotUtils.findShapes(s => s.type === "text", board).filter(t => storage.isShown(t, board));
  const bb = t => { const r = t.textBounds || t.bounds; return {x: r.x, y: r.y, w: r.width, h: r.height}; };
  const issues = [];
  for (let i = 0; i < texts.length; i++) {
    const a = bb(texts[i]);
    if (a.x < board.x || a.y < board.y || a.x + a.w > board.x + board.width + 0.5 || a.y + a.h > board.y + board.height + 0.5) issues.push({out: texts[i].name});
    for (let j = i + 1; j < texts.length; j++) {
      const b = bb(texts[j]);
      const ox = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x), oy = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
      if (ox > 1 && oy > 1) issues.push({a: texts[i].name, b: texts[j].name, ox: Math.round(ox), oy: Math.round(oy)});
    }
  }
  return {texts: texts.length, issues};
};

  storage.find = (root, name) => penpotUtils.findShape(s => s.name.replace(/ \/ /g, "/") === name, root);

  storage.origText = (name, x, y, str, o = {}) => {
  const t = penpot.createText(str); W.add(t);
  t.name = W.nm(name);
  SSP.applyToText(t, V[o.weight || 400]);
  t.fontSize = String(o.size || 14);
  t.fills = [{fillColor: o.color || C.txt, fillOpacity: 1}];
  t.lineHeight = String(o.lh || 1.25);
  if (o.w) { t.resize(o.w, o.h || 20); t.growType = o.h ? "fixed" : "auto-height"; if (o.align) t.align = o.align; if (o.valign) t.verticalAlign = o.valign; }
  else t.growType = "auto-width";
  t.x = W.ctx.bx + x; t.y = W.ctx.by + y;
  return t;
};

  storage.patch = (name, from, to) => {
  const W = storage.W, C = W.C, B = storage.B, L = 520, R = 980, CW = 420;
  const s = B[name].toString();
  if (from && !s.includes(from)) throw new Error("patch target not found in " + name);
  B[name] = eval("(" + (from ? s.replace(from, to) : s) + ")");
  return true;
};

  storage.buildOn = async (pageId, list) => {
  await penpot.openPage(pageId);
  await new Promise(res => setTimeout(res, 300));
  if (penpot.currentPage.id !== pageId) throw new Error("page switch failed");
  const out = {};
  for (const [k, x, yy] of list) out[k] = storage.B[k](x, yy || 0).id;
  const zeroOf = id => penpotUtils.findShapes(s => s.type === "text" && (s.width < 2 || s.height < 2), penpotUtils.findShapeById(id)).length;
  for (let i = 0; i < 20; i++) { await new Promise(res => setTimeout(res, 500)); if (Object.values(out).every(id => zeroOf(id) === 0)) break; }
  const res = {};
  for (const [k, id] of Object.entries(out)) res[k] = {id, zero: zeroOf(id), issues: storage.checkOverlaps(penpotUtils.findShapeById(id)).issues};
  return res;
};

  storage.rebind = (src) => new Function("W", "C", "B", "L", "R", "CW", "return (" + src + ")")(storage.W, storage.W.C, storage.B, 520, 980, 420);

  storage.boardOf = key => { const r = storage.reg[p7][key]; return r ? penpot.currentPage.getShapeById(r.id) : null; };

  storage.elOf = (key, el) => { const r = storage.reg[p7][key]; if (!r) return null; const id = r.els[el]; return id ? penpot.currentPage.getShapeById(id) : null; };

  storage.actionFor = (kind, to) => {
  if (kind === "nav") { const d = storage.boardOf(to); if (!d) throw new Error("no board " + to); return {type: "navigate-to", destination: d}; }
  if (kind === "ovl") { const d = storage.boardOf(to); if (!d) throw new Error("no overlay " + to); return {type: "open-overlay", destination: d, position: "center", closeWhenClickOutside: true, addBackgroundOverlay: true}; }
  if (kind === "prev") return {type: "previous-screen"};
  if (kind === "close") return {type: "close-overlay"};
  throw new Error("kind " + kind);
};

  storage.wire = (rows) => {
  const errs = [], done = [];
  for (const [flow, from, el, kind, to, temp] of rows) {
    const s = storage.elOf(from, el);
    if (!s) { errs.push(`${from}:${el} missing`); continue; }
    try {
      const act = storage.actionFor(kind, to);
      const ex = s.interactions.find(i => i.trigger === "click");
      if (ex) ex.action = act; else s.addInteraction("click", act);
      storage.wires = storage.wires.filter(w => !(w.from === from && w.el === el));
      storage.wires.push({flow, from, el, kind, to, temp: !!temp});
      done.push(`${from}:${el}`);
    } catch (e) { errs.push(`${from}:${el} ${e}`); }
  }
  return {done: done.length, errs};
};

  storage.keyOfBoard = id => Object.entries(storage.reg[p7]).find(([k, v]) => v.id === id)?.[0] || id;

  storage.walk = (startKey) => {
  const seen = new Set([startKey]), queue = [startKey], broken = [], edges = [];
  while (queue.length) {
    const k = queue.shift(), b = storage.boardOf(k);
    const shapes = penpotUtils.findShapes(s => (s.interactions || []).length > 0, b);
    for (const s of shapes) for (const it of s.interactions) {
      const a = it.action;
      if (a.type === "navigate-to" || a.type === "open-overlay") {
        const d = a.destination;
        if (!d || !d.id || !penpot.currentPage.getShapeById(d.id)) { broken.push(`${k}:${s.name}`); continue; }
        const dk = storage.keyOfBoard(d.id);
        edges.push(`${k} → ${dk}`);
        if (!seen.has(dk)) { seen.add(dk); queue.push(dk); }
      }
    }
  }
  return {reached: [...seen], broken, edges: edges.length};
};

  storage.dead = (keys) => {
  const out = {};
  for (const k of keys) {
    const els = storage.reg[p7][k]?.els || {};
    const d = Object.entries(els).filter(([e, id]) => { const s = penpot.currentPage.getShapeById(id); return !s || !(s.interactions || []).some(i => i.trigger === "click"); }).map(([e]) => e);
    if (d.length) out[k] = d;
  }
  return out;
};

  storage.expect = (rows) => rows.map(([from, el, to]) => {
  const s = storage.elOf(from, el); const it = s && s.interactions.find(i => i.trigger === "click");
  const got = it ? (it.action.destination ? storage.keyOfBoard(it.action.destination.id) : it.action.type) : null;
  return got === to ? null : `${from}:${el} expected ${to}, got ${got}`;
}).filter(Boolean);

  storage.mkFlow = (name, key) => { const ex = page.flows.find(f => f.name === name); if (ex) { ex.startingBoard = storage.boardOf(key); return ex; } return page.createFlow(name, storage.boardOf(key)); };

  storage.archive = (board, label) => {
  const kids = board.children.slice();
  if (!kids.length) return null;
  const g = penpot.group(kids); g.name = "archive/" + label + " (hidden, replaced " + "29 Oct 2026)";
  board.insertChild(0, g); g.hidden = true;
  return g;
};

  storage.isShown = (s, board) => { let p = s; while (p && p.id !== board.id) { if (p.hidden) return false; p = p.parent; } return true; };

  storage.settle = async (ids) => {
  const zeroOf = id => penpotUtils.findShapes(s => s.type === "text" && (s.width < 2 || s.height < 2), penpot.currentPage.getShapeById(id)).length;
  for (let i = 0; i < 24; i++) { await new Promise(r => setTimeout(r, 500)); if (ids.every(id => zeroOf(id) === 0)) break; }
  const res = {};
  for (const id of ids) { const b = penpot.currentPage.getShapeById(id); res[b.name] = {zero: zeroOf(id), issues: storage.checkOverlaps(b).issues}; }
  return res;
};

  storage.rebuild = async (keys) => {
  await penpot.openPage(storage.p7);
  if (penpot.currentPage.id !== storage.p7) throw new Error("not on page 07");
  const ids = [];
  for (const k of keys) {
    const b = storage.boardOf(k);
    storage.archive(b, k + "-v1");
    storage.W.into = b;
    storage.B[k](b.x, b.y);
    storage.W.into = null;
    storage.wires = storage.wires.filter(w => w.from !== k);
    ids.push(b.id);
  }
  return storage.settle(ids);
};

  storage.boardByName = (key) => penpot.currentPage.root.children.find(s => s.type === "board" && s.name.replace(/\s/g, "") === "screens/" + key);

  storage.rebuildOn = async (pageId, keys = [], news = []) => {
  await penpot.openPage(pageId);
  await new Promise(r => setTimeout(r, 400));
  if (penpot.currentPage.id !== pageId) throw new Error("page switch failed");
  const ids = [], log = [];
  for (const k of keys) {
    const b = storage.boardByName(k);
    if (!b) { log.push("missing " + k); continue; }
    storage.archive(b, k + "-v1");
    storage.W.into = b;
    storage.B[k](b.x, b.y);
    storage.W.into = null;
    ids.push(b.id); log.push("rebuilt " + k);
  }
  for (const [k, x, y] of news) {
    if (storage.boardByName(k)) { log.push("exists " + k); continue; }
    const r = storage.B[k](x, y); ids.push(r.id); log.push(`new ${k} at ${x},${y}`);
  }
  await storage.settle(ids);
  await new Promise(r => setTimeout(r, 1200));
  const issues = {};
  for (const id of ids) { const b = penpot.currentPage.getShapeById(id); const iss = storage.checkOverlaps(b).issues.filter(i => !/pin-sheet/.test(JSON.stringify(i))); const z = penpotUtils.findShapes(s => s.type === "text" && (s.width < 2 || s.height < 2), b).filter(s => storage.isShown(s, b)).length; if (iss.length || z) issues[b.name] = {iss: iss.slice(0, 4), n: iss.length, z}; }
  return {log, issues, ids};
};

  storage.textsOf = (b) => penpotUtils.findShapes(s => s.type === "text", b).filter(s => storage.isShown(s, b)).map(s => s.characters).sort();

  return storage;
}

// ==== Design system file (FMoT Rail Tracker: Design System) — phases 1 and 2 ====
// Load in the design-system file: paste this section, then installDS(storage).
// Tokens: D.tok/val/typo; drawing: D.board/rect/text/line (absolute) and D.fx/tx/ic/vi (flex layout, token-bound); await D.flush() applies queued token bindings.
// Components: D.mk(board, path, name); D.vset(path, name, items, x, y, title) builds a variant set; D.vi(parent, 'atoms/button', {kind, size, state}) places a variant instance.
// Pages can only be changed with await D.onPage(name); a shape cannot be moved between pages.
function installDS(storage) {
  const D = storage.D = storage.D || {}; D.pending = [];
  storage.SETS = storage.SETS || {}; storage.VC = storage.VC || {};
  storage.LUCIDE = {"camera":"<path d=\"M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z\"/><circle cx=\"12\" cy=\"13\" r=\"3\"/>","photo":"<rect width=\"18\" height=\"18\" x=\"3\" y=\"3\" rx=\"2\" ry=\"2\"/><circle cx=\"9\" cy=\"9\" r=\"2\"/><path d=\"m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21\"/>","map-pin":"<path d=\"M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z\"/><circle cx=\"12\" cy=\"10\" r=\"3\"/>","train":"<path d=\"M8 3.1V7a4 4 0 0 0 8 0V3.1\"/><path d=\"m9 15-1-1\"/><path d=\"m15 15 1-1\"/><path d=\"M9 19c-2.8 0-5-2.2-5-5v-4a8 8 0 0 1 16 0v4c0 2.8-2.2 5-5 5Z\"/><path d=\"m8 19-2 3\"/><path d=\"m16 19 2 3\"/>","gate":"<path d=\"M12 13v8\"/><path d=\"M12 3v3\"/><path d=\"M4 6a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h13a2 2 0 0 0 1.152-.365l3.424-2.317a1 1 0 0 0 0-1.635l-3.424-2.318A2 2 0 0 0 17 6z\"/>","tick":"<path d=\"M20 6 9 17l-5-5\"/>","flag":"<path d=\"M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z\"/><line x1=\"4\" x2=\"4\" y1=\"22\" y2=\"15\"/>","bell":"<path d=\"M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9\"/><path d=\"M10.3 21a1.94 1.94 0 0 0 3.4 0\"/>","document":"<path d=\"M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z\"/><path d=\"M14 2v4a2 2 0 0 0 2 2h4\"/><path d=\"M10 9H8\"/><path d=\"M16 13H8\"/><path d=\"M16 17H8\"/>","upload":"<path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"/><polyline points=\"17 8 12 3 7 8\"/><line x1=\"12\" x2=\"12\" y1=\"3\" y2=\"15\"/>","download":"<path d=\"M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4\"/><polyline points=\"7 10 12 15 17 10\"/><line x1=\"12\" x2=\"12\" y1=\"15\" y2=\"3\"/>","user":"<path d=\"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2\"/><circle cx=\"12\" cy=\"7\" r=\"4\"/>","users":"<path d=\"M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2\"/><circle cx=\"9\" cy=\"7\" r=\"4\"/><path d=\"M22 21v-2a4 4 0 0 0-3-3.87\"/><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"/>","lock":"<rect width=\"18\" height=\"11\" x=\"3\" y=\"11\" rx=\"2\" ry=\"2\"/><path d=\"M7 11V7a5 5 0 0 1 10 0v4\"/>","pin":"<rect width=\"20\" height=\"12\" x=\"2\" y=\"6\" rx=\"2\"/><path d=\"M12 12h.01\"/><path d=\"M17 12h.01\"/><path d=\"M7 12h.01\"/>","warning":"<path d=\"m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3\"/><path d=\"M12 9v4\"/><path d=\"M12 17h.01\"/>","search":"<circle cx=\"11\" cy=\"11\" r=\"8\"/><path d=\"m21 21-4.3-4.3\"/>","filter":"<polygon points=\"22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3\"/>","layers":"<path d=\"m12.83 2.18a2 2 0 0 0-1.66 0L2.6 6.08a1 1 0 0 0 0 1.83l8.58 3.91a2 2 0 0 0 1.66 0l8.58-3.9a1 1 0 0 0 0-1.83Z\"/><path d=\"m22 17.65-9.17 4.16a2 2 0 0 1-1.66 0L2 17.65\"/><path d=\"m22 12.65-9.17 4.16a2 2 0 0 1-1.66 0L2 12.65\"/>","phone":"<path d=\"M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z\"/>"};
  D.BTN = {"primary":{"default":{"bg":"button.primary.bg","fg":"button.primary.fg"},"hover":{"bg":"button.primary.bg-hover","fg":"button.primary.fg"},"pressed":{"bg":"button.primary.bg-pressed","fg":"button.primary.fg"},"disabled":{"bg":"button.disabled.bg","fg":"button.disabled.fg"},"loading":{"bg":"button.primary.bg","fg":"button.primary.fg"}},"secondary":{"default":{"bg":"button.secondary.bg","fg":"button.secondary.fg","border":"button.secondary.border"},"hover":{"bg":"button.secondary.bg-hover","fg":"button.secondary.fg","border":"button.secondary.border"},"pressed":{"bg":"button.secondary.bg-pressed","fg":"button.secondary.fg","border":"button.secondary.border"},"disabled":{"bg":"button.disabled.bg","fg":"button.disabled.fg"},"loading":{"bg":"button.secondary.bg","fg":"button.secondary.fg","border":"button.secondary.border"}},"danger":{"default":{"bg":"button.danger.bg","fg":"button.danger.fg"},"hover":{"bg":"button.danger.bg-hover","fg":"button.danger.fg"},"pressed":{"bg":"button.danger.bg-hover","fg":"button.danger.fg"},"disabled":{"bg":"button.disabled.bg","fg":"button.disabled.fg"},"loading":{"bg":"button.danger.bg","fg":"button.danger.fg"}},"text":{"default":{"fg":"button.text.fg"},"hover":{"bg":"button.text.bg-hover","fg":"button.text.fg"},"pressed":{"bg":"color.interactive.secondary.bg-pressed","fg":"button.text.fg"},"disabled":{"fg":"button.disabled.fg"},"loading":{"fg":"button.text.fg"}}};
  D.T = () => penpot.library.local.tokens;

  D.tok = (n) => { const sets = D.T().sets.filter(s => s.active); for (const s of sets.slice().reverse()) { const t = s.tokens.find(x => x.name === n); if (t) return t; } throw new Error("no token " + n); };

  D.val = (n) => D.tok(n).resolvedValueString;

  D.typo = (n) => penpot.library.local.typographies.find(y => y.getPluginData("token") === n);

  D.L = (h) => { const c = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };

  D.cr = (a, b) => { const [x, y] = [D.L(a), D.L(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

  D.apply = (shape, tokenName, props) => D.pending.push([shape, tokenName, props]);

  D.flush = async () => { const errs = []; for (const [s, n, p] of D.pending) { try { s.applyToken(D.tok(n), p); } catch (e) { errs.push(`${s.name}: ${n} ${e}`); } } D.pending = []; await new Promise(r => setTimeout(r, 600)); return errs; };

  D.board = (name, x, y, w, h, fillTok = "color.surface.page") => { const b = penpot.createBoard(); b.name = name; b.resize(w, h); b.x = x; b.y = y; penpot.root.appendChild(b); b.fills = [{fillColor: D.val(fillTok), fillOpacity: 1}]; D.apply(b, fillTok, ["fill"]); return b; };

  D.rect = (parent, name, x, y, w, h, o = {}) => {
  const r = penpot.createRectangle(); parent.appendChild(r); r.name = name; r.resize(w, h); r.x = parent.x + x; r.y = parent.y + y;
  if (o.fill) { r.fills = [{fillColor: D.val(o.fill).slice(0, 7), fillOpacity: o.alpha || 1}]; D.apply(r, o.fill, ["fill"]); } else r.fills = [];
  if (o.stroke) { r.strokes = [{strokeColor: D.val(o.stroke).slice(0, 7), strokeWidth: o.sw || 1, strokeAlignment: "inner", strokeStyle: o.dash ? "dashed" : "solid"}]; D.apply(r, o.stroke, ["strokeColor"]); if (o.swTok) D.apply(r, o.swTok, ["strokeWidth"]); }
  if (o.radius) D.apply(r, o.radius, ["borderRadiusTopLeft", "borderRadiusTopRight", "borderRadiusBottomRight", "borderRadiusBottomLeft"]);
  if (o.shadow) D.apply(r, o.shadow, ["shadow"]);
  return r;
};

  D.text = (parent, name, x, y, str, typoTok = "type.body", colTok = "color.text.primary", o = {}) => {
  const t = penpot.createText(str); parent.appendChild(t); t.name = name;
  const y0 = D.typo(typoTok); if (y0) t.applyTypography(y0);
  t.fills = [{fillColor: D.val(colTok).slice(0, 7), fillOpacity: 1}];
  D.apply(t, typoTok, ["typography"]); D.apply(t, colTok, ["fill"]);
  if (o.w) { t.resize(o.w, 20); t.growType = "auto-height"; if (o.align) t.align = o.align; } else t.growType = "auto-width";
  t.x = parent.x + x; t.y = parent.y + y;
  return t;
};

  D.line = (parent, name, x1, y1, x2, y2, colTok, wTok, o = {}) => {
  const p = penpot.createPath(); parent.appendChild(p); p.name = name;
  p.content = `M${parent.x + x1},${parent.y + y1} L${parent.x + x2},${parent.y + y2}`; p.fills = [];
  p.strokes = [{strokeColor: D.val(colTok).slice(0, 7), strokeWidth: +(D.val(wTok) || 6), strokeStyle: o.dash ? "dashed" : "solid", strokeAlignment: "center", strokeCapStart: "round", strokeCapEnd: "round"}];
  D.apply(p, colTok, ["strokeColor"]); D.apply(p, wTok, ["strokeWidth"]);
  return p;
};

  D.group = (shapes, name) => { const g = penpot.group(shapes); g.name = name; return g; };

  D.pageByName = (n) => penpot.currentFile.pages.find(p => p.name === n);

  D.archive = (board, label) => { const kids = board.children.slice(); if (!kids.length) return null; const g = penpot.group(kids); g.name = "archive/" + label + " (hidden)"; board.insertChild(0, g); g.hidden = true; return g; };

  D.put = (set, type, name, value, description) => {
  let t = set.tokens.find(x => x.name === name);
  if (t) { if (JSON.stringify(t.value) !== JSON.stringify(value)) t.value = value; }
  else t = set.addToken({type, name, value});
  if (description) try { t.description = description; } catch (e) {}
  return t;
};

  D.installTokens = async (data) => {
  const T = penpot.library.local.tokens;
  for (const s of data.sets) {
    const set = T.sets.find(x => x.name === s.name) || T.addSet({name: s.name, active: false});
    for (const t of s.tokens) if (!set.tokens.some(x => x.name === t.name)) set.addToken({type: t.type, name: t.name, value: t.value});
  }
  for (const th of data.themes) {
    const theme = T.themes.find(x => x.group === th.group && x.name === th.name) || T.addTheme({group: th.group, name: th.name});
    for (const n of th.sets) if (!theme.activeSets.some(a => a.name === n)) theme.addSet(T.sets.find(x => x.name === n));
  }
  const light = T.themes.find(t => t.name === "Light"); if (light && !light.active) light.toggleActive();
  await new Promise(r => setTimeout(r, 400));
};

  D.genColors = () => {
  const lib = penpot.library.local, T = lib.tokens, made = [];
  for (const setName of ["core", "semantic"]) for (const t of T.sets.find(s => s.name === setName).tokens.filter(x => x.type === "color")) {
    const parts = t.name.replace(/^color\./, "").split("."), name = parts.pop(), path = [setName, ...parts].join("/");
    let c = lib.colors.find(x => x.getPluginData("token") === t.name);
    if (!c) { c = lib.createColor(); c.setPluginData("token", t.name); }
    c.name = name; c.path = path;
    const raw = String(D.tok(t.name).value), m = raw.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
    c.color = D.val(t.name).slice(0, 7).toUpperCase(); c.opacity = m ? +m[4] : (/grey\.900-a60|surface\.scrim/.test(t.name) ? 0.6 : 1);
    made.push(path + "/" + name);
  }
  return made.length;
};

  D.genTypos = () => {
  const lib = penpot.library.local, T = lib.tokens, inter = penpot.fonts.all.find(f => f.name === "Inter");
  const deref = v => { let x = Array.isArray(v) ? v[0] : v, g = 0; while (typeof x === "string" && /^\{.*\}$/.test(x) && g++ < 6) { const t = D.tok(x.slice(1, -1)); x = t.resolvedValueString ?? t.value; } return x; };
  const variantFor = w => inter.variants.find(v => v.fontVariantId === ({"400": "regular", "600": "600", "700": "700"})[String(w)]);
  let n = 0;
  for (const t of T.sets.find(s => s.name === "semantic").tokens.filter(x => x.type === "typography")) {
    const v = t.value, size = deref(v.fontSize), weight = deref(v.fontWeight), lh = deref(v.lineHeight), ls = deref(v.letterSpacing);
    let y = lib.typographies.find(x => x.getPluginData("token") === t.name);
    if (!y) { y = lib.createTypography(); y.setPluginData("token", t.name); }
    const parts = t.name.split("."); y.name = parts.pop(); y.path = parts.join("/");
    y.setFont(inter, variantFor(weight)); y.fontSize = String(size); y.lineHeight = String(lh); y.letterSpacing = String(ls || 0);
    if (v.textCase === "uppercase") y.textTransform = "uppercase";
    n++;
  }
  return n;
};

  D.fx = (parent, name, o = {}) => {
  const b = penpot.createBoard(); b.name = name; b.fills = [];
  (parent || penpot.root).appendChild(b);
  if (o.x !== undefined && !parent) { b.x = o.x; b.y = o.y; }
  if (o.w || o.h) b.resize(o.w || 100, o.h || 40);
  const f = b.addFlexLayout(); f.dir = o.dir || "row"; f.alignItems = o.align || "center"; f.justifyContent = o.justify || "start"; f.wrap = "nowrap";
  const num = t => t === undefined ? 0 : (typeof t === "number" ? t : +D.val(t));
  f.rowGap = num(o.gap); f.columnGap = num(o.gap);
  f.leftPadding = f.rightPadding = num(o.px); f.topPadding = f.bottomPadding = num(o.py);
  if (typeof o.gap === "string") D.apply(b, o.gap, ["rowGap", "columnGap"]);
  if (typeof o.px === "string") D.apply(b, o.px, ["paddingLeft", "paddingRight"]);
  if (typeof o.py === "string") D.apply(b, o.py, ["paddingTop", "paddingBottom"]);
  f.horizontalSizing = o.hs || "auto"; f.verticalSizing = o.vs || "auto";
  if (o.fill) { b.fills = [{fillColor: D.val(o.fill).slice(0, 7), fillOpacity: 1}]; D.apply(b, o.fill, ["fill"]); }
  if (o.stroke) { b.strokes = [{strokeColor: D.val(o.stroke).slice(0, 7), strokeWidth: o.sw || 1, strokeAlignment: "inner", strokeStyle: o.dash ? "dashed" : "solid"}]; D.apply(b, o.stroke, ["strokeColor"]); }
  if (o.radius) D.apply(b, o.radius, ["borderRadiusTopLeft", "borderRadiusTopRight", "borderRadiusBottomRight", "borderRadiusBottomLeft"]);
  if (o.hTok) D.apply(b, o.hTok, ["height"]);
  if (o.wTok) D.apply(b, o.wTok, ["width"]);
  if (o.shadow) D.apply(b, o.shadow, ["shadow"]);
  if (parent && parent.flex && o.fillW) b.layoutChild.horizontalSizing = "fill";
  if (parent && parent.flex && o.fillH) b.layoutChild.verticalSizing = "fill";
  b.clipContent = !!o.clip;
  return b;
};

  D.tx = (parent, name, str, typoTok, colTok, o = {}) => {
  const t = penpot.createText(str); parent.appendChild(t); t.name = name;
  const y0 = D.typo(typoTok); if (y0) t.applyTypography(y0);
  t.fills = [{fillColor: D.val(colTok).slice(0, 7), fillOpacity: 1}];
  D.apply(t, typoTok, ["typography"]); D.apply(t, colTok, ["fill"]);
  if (o.w) { t.resize(o.w, 20); t.growType = "auto-height"; } else t.growType = "auto-width";
  if (o.align) t.align = o.align;
  if (o.fillW && parent.flex) { t.growType = "auto-height"; t.layoutChild.horizontalSizing = "fill"; }
  return t;
};

  D.icomp = (n) => penpot.library.local.components.find(c => c.path.replace(/\s/g, "") === "icon" && c.name === n);

  D.ic = (parent, n, colTok = "color.text.primary", size) => {
  const inst = D.icomp(n).instance(); parent.appendChild(inst); inst.name = "icon/" + n;
  penpotUtils.findShapes(s => s.id !== inst.id, inst).forEach(s => { s.constraintsHorizontal = "scale"; s.constraintsVertical = "scale"; });
  if (size) inst.resize(size, size);
  penpotUtils.findShapes(s => s.type !== "group" && s.type !== "board" && (s.strokes || []).length > 0 && !s.hidden, inst).forEach(s => D.apply(s, colTok, ["strokeColor"]));
  return inst;
};

  D.mk = (board, path, name) => { const c = penpot.library.local.createComponent([board]); c.name = name; c.path = path; return c; };

  D.spinner = (parent, colTok) => {
  const b = D.fx(parent, "spinner", {w: 16, h: 16, hs: "fix", vs: "fix"});
  b.flex.remove();
  const ring = penpot.createEllipse(); b.appendChild(ring); ring.name = "track"; ring.resize(16, 16); ring.x = b.x; ring.y = b.y; ring.fills = [];
  ring.strokes = [{strokeColor: D.val(colTok), strokeWidth: 2, strokeAlignment: "inner", strokeStyle: "solid"}]; ring.opacity = 0.35; D.apply(ring, colTok, ["strokeColor"]);
  const arc = penpot.createPath(); b.appendChild(arc); arc.name = "arc";
  arc.content = `M${b.x + 8},${b.y + 1} C${b.x + 11.87},${b.y + 1} ${b.x + 15},${b.y + 4.13} ${b.x + 15},${b.y + 8}`; arc.fills = [];
  arc.strokes = [{strokeColor: D.val(colTok), strokeWidth: 2, strokeAlignment: "center", strokeStyle: "solid", strokeCapStart: "round", strokeCapEnd: "round"}]; D.apply(arc, colTok, ["strokeColor"]);
  return b;
};

  D.button = (kind, size, state, x, y) => {
  const s = D.BTN[kind][state], large = size === "large";
  const b = D.fx(null, `kind=${kind}, size=${size}, state=${state}`, {x, y, h: large ? 56 : 44, vs: "fix", hs: "auto", gap: "button.gap", px: kind === "text" ? "spacing.16" : "button.padding-x", fill: s.bg, stroke: s.border, sw: 2, radius: "button.radius", hTok: large ? "button.height.large" : "button.height.default", justify: "center"});
  if (state === "loading") D.spinner(b, s.fg);
  D.tx(b, "label", state === "loading" ? "Working…" : "Button", large ? "type.body-strong" : "type.label", s.fg);
  return b;
};

  D.addVariant = (container, board, path, name, props, x, y) => {
  const comp = D.mk(board, path, name);
  container.appendChild(board);
  board.x = container.x + x; board.y = container.y + y;
  const keys = container.variants.properties;
  const vc = container.variants.variantComponents().find(v => v.mainInstance().id === board.id) || comp;
  keys.forEach((k, i) => { if (props[k] !== undefined) vc.setVariantProperty(i, props[k]); });
  return vc;
};

  D.vset = async (path, name, items, x0, y0, title) => {
  const built = items.map(it => [it.build(x0 + 30 + it.x, y0 + 30 + it.y), it.props]);
  const errs = await D.flush();
  for (const [b] of built) D.mk(b, path, name);
  const cont = penpotUtils.createVariantContainer(built.map(([shape, properties]) => ({shape, properties})));
  cont.name = `${path}/${name}`;
  if (title) D.text(penpot.root, `heading/${path}-${name}`, x0, y0 - 48, title, "type.title-sm", "color.text.secondary");
  await D.flush();
  storage.SETS[`${path}/${name}`] = cont.id; storage.VC[`${path}/${name}`] = cont.variants.variantComponents();
  D.fitCont(cont);
  return {cont: cont.id, n: storage.VC[`${path}/${name}`].length, errs, bad: storage.VC[`${path}/${name}`].filter(v => v.variantError).length};
};

  D.fitCont = (cont, pad = 30) => {
  const ks = cont.children; if (!ks.length) return;
  const maxX = Math.max(...ks.map(k => k.x + k.width)), maxY = Math.max(...ks.map(k => k.y + k.height));
  cont.resize(Math.ceil(maxX - cont.x + pad), Math.ceil(maxY - cont.y + pad));
};

  D.vc = (full, props = {}) => {
  if (storage.VC[full]) { const hit = storage.VC[full].find(c => Object.entries(props).every(([k, v]) => c.variantProps[k] === v)); if (hit) return hit; throw new Error("no variant " + full + JSON.stringify(props)); }
  const [path, name] = full.split("/"); const c = penpot.library.local.components.find(c => c.path.replace(/\s/g, "") === path && c.name === name); if (!c) throw new Error("no component " + full); return c;
};

  D.vi = (parent, full, props, name) => { const inst = D.vc(full, props).instance(); parent.appendChild(inst); if (name) inst.name = name; return inst; };

  D.setText = (inst, textName, str) => { const t = penpotUtils.findShape(s => s.type === "text" && s.name.replace(/\s/g, "").endsWith(textName), inst); if (t) t.characters = str; return t; };

  D.cacheSets = async (pageName) => {
  await penpot.openPage(D.pageByName(pageName));
  for (const [full, id] of Object.entries(storage.SETS)) { const c = penpot.currentPage.getShapeById(id); if (c) storage.VC[full] = c.variants.variantComponents(); }
};

  D.onPage = async (name) => { await penpot.openPage(D.pageByName(name)); await new Promise(r => setTimeout(r, 200)); if (penpot.currentPage.name !== name) throw new Error("not on " + name); };

  D.org = (b, name, hx, hy) => { D.mk(b, "organisms", name); D.text(penpot.root, "heading/organisms-" + name, hx, hy - 48, "organisms/" + name, "type.title-sm", "color.text.secondary"); };

  D.card = (parent, name, o = {}) => D.fx(parent, name, Object.assign({dir: "column", align: "stretch", px: "card.padding", py: "card.padding", gap: "spacing.12", fill: "card.bg", stroke: "card.border", radius: "card.radius", shadow: "card.shadow"}, o));

  D.slot = (parent, name, label, o = {}) => { const s = D.fx(parent, "slot/" + name, Object.assign({dir: "column", justify: "center", align: "center", px: "spacing.24", stroke: "color.border.strong", dash: true, radius: "radius.8", fill: "color.surface.page"}, o)); const t = D.tx(s, "label", label, "type.body", "color.text.secondary", {fillW: true}); t.align = "center"; return s; };

  D.tpl = (b, name) => { D.mk(b, "templates", name); D.text(penpot.root, "heading/templates-" + name, b.x, b.y - 48, "templates/" + name, "type.title-sm", "color.text.secondary"); };

  return D;
}

// ==== Design system file — helpers as of step 1 of the final run (29 Oct 2026) ====
// Paste, then installDS2(storage). It rebuilds storage.SETS/VC by scanning pages 04 to 06.
async function installDS2(storage) {
  const D = storage.D = {}; storage.SETS = {}; storage.VC = {}; D.pending = [];
  D.T = () => penpot.library.local.tokens;

  D.tok = n => { for (const s of D.T().sets.filter(s => s.active).reverse()) { const t = s.tokens.find(x => x.name === n); if (t) return t; } throw new Error("no token " + n); };

  D.val = n => D.tok(n).resolvedValueString;

  D.typo = n => penpot.library.local.typographies.find(y => y.getPluginData("token") === n);

  D.L = h => { const c = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };

  D.cr = (a, b) => { const [x, y] = [D.L(a), D.L(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

  D.apply = (s, n, p) => D.pending.push([s, n, p]);

  D.flush = async () => { const errs = []; for (const [s, n, p] of D.pending) { try { s.applyToken(D.tok(n), p); } catch (e) { errs.push(`${s.name}: ${n} ${e}`); } } D.pending = []; await new Promise(r => setTimeout(r, 600)); return errs; };

  D.pageByName = n => penpot.currentFile.pages.find(p => p.name === n);

  D.onPage = async name => { await penpot.openPage(D.pageByName(name)); await new Promise(r => setTimeout(r, 250)); if (penpot.currentPage.name !== name) throw new Error("not on " + name); };

  D.paint = (s, o) => {
  if (o.fill) { s.fills = [{fillColor: D.val(o.fill).slice(0, 7), fillOpacity: 1}]; D.apply(s, o.fill, ["fill"]); }
  if (o.stroke) { s.strokes = [{strokeColor: D.val(o.stroke).slice(0, 7), strokeWidth: o.sw || 1, strokeAlignment: "inner", strokeStyle: o.dash ? "dashed" : "solid"}]; D.apply(s, o.stroke, ["strokeColor"]); }
  if (o.radius) D.apply(s, o.radius, ["borderRadiusTopLeft", "borderRadiusTopRight", "borderRadiusBottomRight", "borderRadiusBottomLeft"]);
  if (o.shadow) D.apply(s, o.shadow, ["shadow"]);
};

  D.text = (p, name, x, y, str, typoTok = "type.body", colTok = "color.text.primary", o = {}) => { const t = penpot.createText(str); p.appendChild(t); t.name = name; const y0 = D.typo(typoTok); if (y0) t.applyTypography(y0); t.fills = [{fillColor: D.val(colTok).slice(0, 7), fillOpacity: 1}]; D.apply(t, typoTok, ["typography"]); D.apply(t, colTok, ["fill"]); if (o.w) { t.resize(o.w, 20); t.growType = "auto-height"; if (o.align) t.align = o.align; } else t.growType = "auto-width"; t.x = p.x + x; t.y = p.y + y; return t; };

  D.fx = (p, name, o = {}) => {
  const b = penpot.createBoard(); b.name = name; b.fills = []; (p || penpot.root).appendChild(b);
  if (o.w || o.h) b.resize(o.w || 100, o.h || 40);
  if (o.x !== undefined && !p) { b.x = o.x; b.y = o.y; }
  const f = b.addFlexLayout(); f.dir = o.dir || "row"; f.alignItems = o.align || "center"; f.justifyContent = o.justify || "start"; f.wrap = "nowrap";
  const num = t => t === undefined ? 0 : (typeof t === "number" ? t : +D.val(t));
  f.rowGap = f.columnGap = num(o.gap); f.leftPadding = f.rightPadding = num(o.px); f.topPadding = f.bottomPadding = num(o.py);
  if (typeof o.gap === "string") D.apply(b, o.gap, ["rowGap", "columnGap"]);
  if (typeof o.px === "string") D.apply(b, o.px, ["paddingLeft", "paddingRight"]);
  if (typeof o.py === "string") D.apply(b, o.py, ["paddingTop", "paddingBottom"]);
  f.horizontalSizing = o.hs || "auto"; f.verticalSizing = o.vs || "auto";
  D.paint(b, o);
  if (o.hTok) D.apply(b, o.hTok, ["height"]);
  if (p && p.flex && o.fillW) b.layoutChild.horizontalSizing = "fill";
  if (p && p.flex && o.fillH) b.layoutChild.verticalSizing = "fill";
  b.clipContent = !!o.clip; return b;
};

  D.tx = (p, name, str, typoTok, colTok, o = {}) => { if (str === "" || str == null) str = "—"; const t = penpot.createText(str); p.appendChild(t); t.name = name; const y0 = D.typo(typoTok); if (y0) t.applyTypography(y0); t.fills = [{fillColor: D.val(colTok).slice(0, 7), fillOpacity: 1}]; D.apply(t, typoTok, ["typography"]); D.apply(t, colTok, ["fill"]); if (o.w) { t.resize(o.w, 20); t.growType = "auto-height"; } else t.growType = "auto-width"; if (o.align) t.align = o.align; if (o.fillW && p.flex) { t.growType = "auto-height"; t.layoutChild.horizontalSizing = "fill"; } return t; };

  D.icomp = n => penpot.library.local.components.find(c => c.path.replace(/\s/g, "") === "icon" && c.name === n);

  D.ic = (p, n, colTok = "color.text.primary", size) => { const i = D.icomp(n).instance(); p.appendChild(i); i.name = "icon/" + n; penpotUtils.findShapes(s => s.id !== i.id, i).forEach(s => { s.constraintsHorizontal = "scale"; s.constraintsVertical = "scale"; }); if (size) i.resize(size, size); penpotUtils.findShapes(s => s.type !== "group" && s.type !== "board" && (s.strokes || []).length > 0 && !s.hidden, i).forEach(s => D.apply(s, colTok, ["strokeColor"])); return i; };

  D.mk = (b, path, name) => { const c = penpot.library.local.createComponent([b]); c.name = name; c.path = path; return c; };

  D.fitCont = (c, pad = 30) => { const ks = c.children; if (!ks.length) return; const mx = Math.max(...ks.map(k => k.x + k.width)), my = Math.max(...ks.map(k => k.y + k.height)); c.resize(Math.ceil(mx - c.x + pad), Math.ceil(my - c.y + pad)); };

  D.vset = async (path, name, items, x0, y0, title) => {
  const built = items.map(it => [it.build(x0 + 30 + it.x, y0 + 30 + it.y), it.props]);
  const errs = await D.flush();
  for (const [b] of built) D.mk(b, path, name);
  const cont = penpotUtils.createVariantContainer(built.map(([shape, properties]) => ({shape, properties}))); cont.name = `${path}/${name}`;
  if (title) D.text(penpot.root, `heading/${path}-${name}`, x0, y0 - 48, title, "type.title-sm", "color.text.secondary");
  await D.flush(); storage.SETS[`${path}/${name}`] = cont.id; storage.VC[`${path}/${name}`] = cont.variants.variantComponents(); D.fitCont(cont);
  return {cont: cont.id, n: storage.VC[`${path}/${name}`].length, errs};
};

  D.vc = (full, props = {}) => { const [path, name] = full.split("/"); if (storage.VC[full]) { const hit = storage.VC[full].find(c => Object.entries(props).every(([k, v]) => c.variantProps[k] === v)); if (hit) return hit; throw new Error("no variant " + full + JSON.stringify(props)); } const c = penpot.library.local.components.find(c => c.path.replace(/\s/g, "") === path && c.name === name); if (!c) throw new Error("no component " + full); if (c.isVariant && c.isVariant()) { const h = c.variants.variantComponents().find(v => Object.entries(props).every(([k, val]) => v.variantProps[k] === val)); if (h) return h; } return c; };

  D.vi = (p, full, props, name) => { const i = D.vc(full, props).instance(); p.appendChild(i); if (name) i.name = name; return i; };

  D.setText = (inst, tn, str) => { const t = penpotUtils.findShape(s => s.type === "text" && s.name.replace(/\s/g, "").endsWith(tn), inst); if (t) t.characters = str; return t; };

  D.card = (p, name, o = {}) => D.fx(p, name, Object.assign({dir: "column", align: "stretch", px: "card.padding", py: "card.padding", gap: "spacing.12", fill: "card.bg", stroke: "card.border", radius: "card.radius", shadow: "card.shadow"}, o));

  D.trow = (name, cells, kind, x, y, W, o = {}) => { const b = D.fx(null, name, {x, y, w: W, h: 52, hs: "fix", vs: "fix", px: "spacing.12", gap: o.gap === undefined ? 12 : o.gap}); D.trowStyle(b, kind, W, o.h || 52); return D.trowFill(b, cells, kind, o.linkCol); };

  D.trowFill = (b, cells, kind, link) => {
  const hdr = kind === "header";
  cells.forEach(([k, v, w, align, strong]) => {
    if (Array.isArray(v)) { if (hdr) { D.tx(b, k, v[0], "type.overline", "table.header-fg", {w}); return; } const col = D.fx(b, k, {w, hs: "fix", dir: "column", align: "start"}); D.tx(col, "primary", v[1], "type.body-strong", "color.text.primary", {w}); D.tx(col, "secondary", v[2], "type.caption", "color.text.secondary", {w}); return; }
    if (v && typeof v === "object") { if (hdr) { D.tx(b, k, v.h, "type.overline", "table.header-fg", {w}); return; } const slot = D.fx(b, k + "-cell", {w, hs: "fix"}); const c = D.vi(slot, "atoms/chip", {kind: v.chip}, k); D.setText(c, "label", v.label); return; }
    const t = D.tx(b, k, v, hdr ? "type.overline" : (strong ? "type.body-strong" : "type.body-sm"), hdr ? "table.header-fg" : (link === k ? "color.text.link" : "color.text.primary"), {w}); if (align) t.align = align;
  });
  return b;
};

  D.trowStyle = (b, kind, W, h) => { const hdr = kind === "header", hi = /new|highlight/.test(kind); b.resize(W, hdr ? 36 : h); D.paint(b, {fill: hdr ? "table.header-bg" : (hi ? "color.interactive.selected.bg" : "color.surface.raised")}); b.strokes = []; if (!hdr) D.paint(b, {stroke: "table.border"}); };

  for (const pg of ["04 Atoms", "05 Molecules", "06 Organisms"]) { await D.onPage(pg); penpotUtils.findShapes(s => s.isVariantContainer && s.isVariantContainer(), penpot.root).forEach(c => { const k = c.name.replace(/\s/g, ""); storage.SETS[k] = c.id; storage.VC[k] = c.variants.variantComponents(); }); }
  return D;
}

// ==== UI file (FMoT Rail Tracker: UI) — phase 3 screen helpers ====
// Load in the UI file: paste this section, then installUI(storage). The Design System library must be connected;
// call penpot.library.connectLibrary(<design-system id>) once per session so its components load.
// Tokens are not shared through the library: the UI file carries the same catalogue (tools/penpot-ds-tokens.json).
// U.vi(parent, 'organisms/top-bar', {}, name, [x, y]) places a library instance; U.text/rect/ellipse/poly draw token-bound shapes.
function installUI(storage) {
  const U = storage.U = storage.U || {}; U.pending = [];
  storage.MAPP = {"S":70,"LON0":2.27,"LAT0":16.04}; // W3 map projection: x = (lon - LON0) * S, y = (LAT0 - lat) * S
  U.lib = () => penpot.library.connected.find(l => l.name === "FMoT Rail Tracker: Design System");

  U.T = () => penpot.library.local.tokens;

  U.tok = n => { for (const s of U.T().sets.filter(s => s.active).reverse()) { const t = s.tokens.find(x => x.name === n); if (t) return t; } throw new Error("no token " + n); };

  U.val = n => U.tok(n).resolvedValueString;

  U.typo = n => { const parts = n.split("."), name = parts.pop(), path = parts.join("/"); return U.lib().typographies.find(y => y.name === name && y.path.replace(/\s/g, "") === path); };

  U.L = h => { const c = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };

  U.cr = (a, b) => { const [x, y] = [U.L(a), U.L(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

  U.apply = (s, n, p) => U.pending.push([s, n, p]);

  U.flush = async () => { const errs = []; for (const [s, n, p] of U.pending) { try { s.applyToken(U.tok(n), p); } catch (e) { errs.push(`${s.name}: ${n} ${e}`); } } U.pending = []; await new Promise(r => setTimeout(r, 600)); return errs; };

  U.onPage = async name => { await penpot.openPage(penpot.currentFile.pages.find(p => p.name === name)); await new Promise(r => setTimeout(r, 250)); if (penpot.currentPage.name !== name) throw new Error("not on " + name); };

  U.paint = (s, o) => {
  if (o.fill) { s.fills = [{fillColor: U.val(o.fill).slice(0, 7), fillOpacity: o.alpha || 1}]; U.apply(s, o.fill, ["fill"]); } else if (o.fill === null || o.nofill) s.fills = [];
  if (o.stroke) { s.strokes = [{strokeColor: U.val(o.stroke).slice(0, 7), strokeWidth: o.sw || 1, strokeAlignment: o.strokeAlign || "inner", strokeStyle: o.dash ? "dashed" : "solid"}]; U.apply(s, o.stroke, ["strokeColor"]); }
  if (o.radius) U.apply(s, o.radius, ["borderRadiusTopLeft", "borderRadiusTopRight", "borderRadiusBottomRight", "borderRadiusBottomLeft"]);
  if (o.shadow) U.apply(s, o.shadow, ["shadow"]);
};

  U.board = (name, x, y, w, h, fill = "color.surface.page") => { const b = penpot.createBoard(); b.name = name; penpot.root.appendChild(b); b.resize(w, h); b.x = x; b.y = y; b.clipContent = true; U.paint(b, {fill}); return b; };

  U.rect = (p, name, x, y, w, h, o = {}) => { const r = penpot.createRectangle(); p.appendChild(r); r.name = name; r.resize(w, h); r.x = p.x + x; r.y = p.y + y; r.fills = []; U.paint(r, o); return r; };

  U.ellipse = (p, name, cx, cy, d, o = {}) => { const e = penpot.createEllipse(); p.appendChild(e); e.name = name; e.resize(d, d); e.x = p.x + cx - d / 2; e.y = p.y + cy - d / 2; e.fills = []; U.paint(e, o); return e; };

  U.text = (p, name, x, y, str, typoTok = "type.body", colTok = "color.text.primary", o = {}) => {
  const t = penpot.createText(str); p.appendChild(t); t.name = name;
  const y0 = U.typo(typoTok); if (y0) t.applyTypography(y0);
  t.fills = [{fillColor: U.val(colTok).slice(0, 7), fillOpacity: 1}];
  U.apply(t, typoTok, ["typography"]); U.apply(t, colTok, ["fill"]);
  if (o.w) { t.resize(o.w, 20); t.growType = "auto-height"; if (o.align) t.align = o.align; } else t.growType = "auto-width";
  if (p.flex) { if (o.fillW) { t.growType = "auto-height"; t.layoutChild.horizontalSizing = "fill"; } } else { t.x = p.x + x; t.y = p.y + y; }
  return t;
};

  U.poly = (p, name, pts, colTok, wTok, o = {}) => {
  const path = penpot.createPath(); p.appendChild(path); path.name = name;
  path.content = pts.map(([x, y], i) => `${i ? "L" : "M"}${p.x + x},${p.y + y}`).join(" "); path.fills = [];
  path.strokes = [{strokeColor: U.val(colTok).slice(0, 7), strokeWidth: +U.val(wTok), strokeStyle: o.dash ? "dashed" : "solid", strokeAlignment: "center", strokeCapStart: "round", strokeCapEnd: "round"}];
  U.apply(path, colTok, ["strokeColor"]); U.apply(path, wTok, ["strokeWidth"]);
  return path;
};

  U.fx = (p, name, o = {}) => {
  const b = penpot.createBoard(); b.name = name; b.fills = []; (p || penpot.root).appendChild(b);
  if (o.w || o.h) b.resize(o.w || 100, o.h || 40);
  if (o.x !== undefined) { b.x = (p && !p.flex ? p.x : 0) + o.x; b.y = (p && !p.flex ? p.y : 0) + o.y; }
  const f = b.addFlexLayout(); f.dir = o.dir || "row"; f.alignItems = o.align || "center"; f.justifyContent = o.justify || "start"; f.wrap = "nowrap";
  const num = t => t === undefined ? 0 : (typeof t === "number" ? t : +U.val(t));
  f.rowGap = f.columnGap = num(o.gap); f.leftPadding = f.rightPadding = num(o.px); f.topPadding = f.bottomPadding = num(o.py);
  if (typeof o.gap === "string") U.apply(b, o.gap, ["rowGap", "columnGap"]);
  if (typeof o.px === "string") U.apply(b, o.px, ["paddingLeft", "paddingRight"]);
  if (typeof o.py === "string") U.apply(b, o.py, ["paddingTop", "paddingBottom"]);
  f.horizontalSizing = o.hs || "auto"; f.verticalSizing = o.vs || "auto";
  U.paint(b, o);
  if (p && p.flex && o.fillW) b.layoutChild.horizontalSizing = "fill";
  if (p && p.flex && o.fillH) b.layoutChild.verticalSizing = "fill";
  b.clipContent = !!o.clip;
  return b;
};

  U.comp = (full, props = {}) => {
  const [path, name] = full.split("/");
  const c = U.lib().components.find(x => x.path.replace(/\s/g, "") === path && x.name === name);
  if (!c) throw new Error("no component " + full);
  if (c.isVariant && c.isVariant()) { const hit = c.variants.variantComponents().find(v => Object.entries(props).every(([k, val]) => v.variantProps[k] === val)); if (!hit) throw new Error("no variant " + full + JSON.stringify(props)); return hit; }
  return c;
};

  U.vi = (p, full, props, name, pos) => { const i = U.comp(full, props).instance(); (p || penpot.root).appendChild(i); if (name) i.name = name; if (pos && !(p && p.flex)) { i.x = (p ? p.x : 0) + pos[0]; i.y = (p ? p.y : 0) + pos[1]; } return i; };

  U.setText = (inst, textName, str) => { const t = penpotUtils.findShape(s => s.type === "text" && s.name.replace(/\s/g, "").endsWith(textName), inst); if (t) t.characters = str; return t; };

  U.icon = (p, n, colTok = "color.text.primary", size, pos) => {
  const i = U.comp("icon/" + n).instance(); p.appendChild(i); i.name = "icon/" + n;
  penpotUtils.findShapes(s => s.id !== i.id, i).forEach(s => { s.constraintsHorizontal = "scale"; s.constraintsVertical = "scale"; });
  if (size) i.resize(size, size);
  if (pos && !p.flex) { i.x = p.x + pos[0]; i.y = p.y + pos[1]; }
  penpotUtils.findShapes(s => s.type !== "group" && s.type !== "board" && (s.strokes || []).length > 0 && !s.hidden, i).forEach(s => U.apply(s, colTok, ["strokeColor"]));
  return i;
};

  return U;
}

// ==== UI file (FMoT Rail Tracker: UI) — screen builders, final run (29 Oct 2026) ====
// Paste, then installUI2(storage). Needs the Design System library connected. SB[key](x, y) draws screens/<key> on the current page.
function installUI2(storage) {
  const U = storage.U = {}, F = storage.F = {}, SB = storage.SB = {}; U.pending = []; U.typoCache = {}; U.compCache = {}; storage.IDS = storage.IDS || {};
  storage.mkfn = (src) => new Function("U", "F", "penpotUtils", "storage", "return " + src)(U, F, penpotUtils, storage);
  U.lib = () => penpot.library.connected.find(l => l.name === "FMoT Rail Tracker: Design System");

  U.T = () => penpot.library.local.tokens;

  U.tok = n => { for (const s of U.T().sets.filter(s => s.active).reverse()) { const t = s.tokens.find(x => x.name === n); if (t) return t; } throw new Error("no token " + n); };

  U.val = n => U.tok(n).resolvedValueString;

  U.typo = n => { if (U.typoCache[n]) return U.typoCache[n]; const parts = n.split("."), name = parts.pop(), path = parts.join("/"); return (U.typoCache[n] = U.lib().typographies.find(y => y.name === name && y.path.replace(/\s/g, "") === path)); };

  U.L = h => { const c = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };

  U.cr = (a, b) => { const [x, y] = [U.L(a), U.L(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };

  U.apply = (s, n, p) => U.pending.push([s, n, p]);

  U.flush = async () => { const errs = []; for (const [s, n, p] of U.pending) { try { s.applyToken(U.tok(n), p); } catch (e) { errs.push(`${s.name}: ${n} ${e}`); } } U.pending = []; await new Promise(r => setTimeout(r, 500)); return errs; };

  U.onPage = async name => { await penpot.openPage(penpot.currentFile.pages.find(p => p.name === name)); await new Promise(r => setTimeout(r, 250)); if (penpot.currentPage.name !== name) throw new Error("not on " + name); };

  U.paint = (s, o) => {
  if (o.fill) { s.fills = [{fillColor: U.val(o.fill).slice(0, 7), fillOpacity: 1}]; U.apply(s, o.fill, ["fill"]); } else if (o.fill === null) s.fills = [];
  if (o.stroke) { s.strokes = [{strokeColor: U.val(o.stroke).slice(0, 7), strokeWidth: o.sw || 1, strokeAlignment: "inner", strokeStyle: o.dash ? "dashed" : "solid"}]; U.apply(s, o.stroke, ["strokeColor"]); }
  if (o.radius) U.apply(s, o.radius, ["borderRadiusTopLeft", "borderRadiusTopRight", "borderRadiusBottomRight", "borderRadiusBottomLeft"]);
  if (o.shadow) U.apply(s, o.shadow, ["shadow"]);
};

  U.board = (name, x, y, w, h, fill = "color.surface.page") => { const b = penpot.createBoard(); b.name = name; penpot.root.appendChild(b); b.resize(w, h); b.x = x; b.y = y; b.clipContent = true; U.paint(b, {fill}); return b; };

  U.rect = (p, name, x, y, w, h, o = {}) => { const r = penpot.createRectangle(); p.appendChild(r); r.name = name; r.resize(w, h); r.x = p.x + x; r.y = p.y + y; r.fills = []; U.paint(r, o); return r; };

  U.ellipse = (p, name, cx, cy, d, o = {}) => { const e = penpot.createEllipse(); p.appendChild(e); e.name = name; e.resize(d, d); e.x = p.x + cx - d / 2; e.y = p.y + cy - d / 2; e.fills = []; U.paint(e, o); return e; };

  U.text = (p, name, x, y, str, typoTok = "type.body", colTok = "color.text.primary", o = {}) => {
  if (str === "" || str == null) str = "—";
  const t = penpot.createText(str); p.appendChild(t); t.name = name;
  const y0 = U.typo(typoTok); if (y0) t.applyTypography(y0);
  t.fills = [{fillColor: U.val(colTok).slice(0, 7), fillOpacity: 1}];
  U.apply(t, typoTok, ["typography"]); U.apply(t, colTok, ["fill"]);
  if (o.w) { t.resize(o.w, 20); t.growType = "auto-height"; } else t.growType = "auto-width";
  if (o.align) t.align = o.align;
  if (p.flex) { if (o.fillW) { t.growType = "auto-height"; t.layoutChild.horizontalSizing = "fill"; } } else { t.x = p.x + x; t.y = p.y + y; }
  return t;
};

  U.t = (p, name, str, typo, col, o) => U.text(p, name, 0, 0, str, typo, col, o);

  U.poly = (p, name, pts, colTok, wTok, o = {}) => { const path = penpot.createPath(); p.appendChild(path); path.name = name; path.content = pts.map(([x, y], i) => `${i ? "L" : "M"}${p.x + x},${p.y + y}`).join(" "); path.fills = []; path.strokes = [{strokeColor: U.val(colTok).slice(0, 7), strokeWidth: +U.val(wTok), strokeStyle: o.dash ? "dashed" : "solid", strokeAlignment: "center", strokeCapStart: "round", strokeCapEnd: "round"}]; U.apply(path, colTok, ["strokeColor"]); U.apply(path, wTok, ["strokeWidth"]); return path; };

  U.fx = (p, name, o = {}) => {
  const b = penpot.createBoard(); b.name = name; b.fills = []; (p || penpot.root).appendChild(b);
  if (o.w || o.h) b.resize(o.w || 100, o.h || 40);
  if (o.x !== undefined) { b.x = (p && !p.flex ? p.x : 0) + o.x; b.y = (p && !p.flex ? p.y : 0) + o.y; }
  const f = b.addFlexLayout(); f.dir = o.dir || "row"; f.alignItems = o.align || "center"; f.justifyContent = o.justify || "start"; f.wrap = o.wrap || "nowrap";
  const num = t => t === undefined ? 0 : (typeof t === "number" ? t : +U.val(t));
  f.rowGap = f.columnGap = num(o.gap); f.leftPadding = f.rightPadding = num(o.px); f.topPadding = f.bottomPadding = num(o.py);
  if (typeof o.gap === "string") U.apply(b, o.gap, ["rowGap", "columnGap"]);
  if (typeof o.px === "string") U.apply(b, o.px, ["paddingLeft", "paddingRight"]);
  if (typeof o.py === "string") U.apply(b, o.py, ["paddingTop", "paddingBottom"]);
  f.horizontalSizing = o.hs || "auto"; f.verticalSizing = o.vs || "auto";
  U.paint(b, o);
  if (p && p.flex && o.fillW) b.layoutChild.horizontalSizing = "fill";
  if (p && p.flex && o.fillH) b.layoutChild.verticalSizing = "fill";
  b.clipContent = !!o.clip; return b;
};

  U.card = (p, name, o = {}) => U.fx(p, name, Object.assign({dir: "column", align: "stretch", px: "card.padding", py: "card.padding", gap: "spacing.12", fill: "card.bg", stroke: "card.border", radius: "card.radius", shadow: "card.shadow"}, o));

  U.comp = (full, props = {}) => { const key = full + JSON.stringify(props); if (U.compCache[key]) return U.compCache[key]; const [path, name] = full.split("/"); const c = U.lib().components.find(x => x.path.replace(/\s/g, "") === path && x.name === name); if (!c) throw new Error("no component " + full); let hit = c; if (c.isVariant && c.isVariant()) { hit = c.variants.variantComponents().find(v => Object.entries(props).every(([k, val]) => v.variantProps[k] === val)); if (!hit) throw new Error("no variant " + full + JSON.stringify(props)); } return (U.compCache[key] = hit); };

  U.vi = (p, full, props, name, pos) => { const i = U.comp(full, props).instance(); (p || penpot.root).appendChild(i); if (name) i.name = name; if (pos && !(p && p.flex)) { i.x = (p ? p.x : 0) + pos[0]; i.y = (p ? p.y : 0) + pos[1]; } return i; };

  U.setText = (inst, tn, str) => { const t = penpotUtils.findShape(s => s.type === "text" && s.name.replace(/\s/g, "").endsWith(tn), inst); if (t) t.characters = str; return t; };

  U.icon = (p, n, colTok = "color.text.primary", size, pos) => { const i = U.comp("icon/" + n).instance(); p.appendChild(i); i.name = "icon/" + n; penpotUtils.findShapes(s => s.id !== i.id, i).forEach(s => { s.constraintsHorizontal = "scale"; s.constraintsVertical = "scale"; }); if (size) i.resize(size, size); if (pos && !p.flex) { i.x = p.x + pos[0]; i.y = p.y + pos[1]; } penpotUtils.findShapes(s => s.type !== "group" && s.type !== "board" && (s.strokes || []).length > 0 && !s.hidden, i).forEach(s => U.apply(s, colTok, ["strokeColor"])); return i; };

  U.fill = i => { i.layoutChild.horizontalSizing = "fill"; return i; };

  U.btn = (p, kind, label, name, size = "default") => { const b = U.vi(p, "atoms/button", {kind, size, state: "default"}, name); U.setText(b, "label", label); return b; };

  U.chip = (p, kind, label, name) => { const c = U.vi(p, "atoms/chip", {kind}, name); U.setText(c, "label", label); return c; };

  U.kv = (p, k, v, name) => { const r = U.vi(p, "molecules/kv-row", {}, name || "kv-" + k.toLowerCase().replace(/[^a-z0-9]+/g, "-")); U.fill(r); U.setText(r, "key", k); U.setText(r, "value", v); return r; };

  F.web = (key, x, y) => { const b = U.board("screens/" + key, x, y, 1440, 1024, "color.surface.page"); const tb = U.vi(b, "organisms/top-bar", {}, "top-bar", [0, 0]); U.setText(penpotUtils.findShape(s => /tasks-badge/.test(s.name), tb), "count", "7"); return b; };

  F.navActive = (nav, idx) => {
  const items = nav.children.filter(c => /item-/.test(c.name));
  items.forEach((it, i) => {
    const on = i === idx, mk = it.children.find(c => /marker/.test(c.name)), lbl = penpotUtils.findShape(s => s.type === "text", it);
    if (on) { U.paint(it, {fill: "color.interactive.selected.bg"}); if (mk) U.paint(mk, {fill: "color.brand.primary"}); U.apply(lbl, "type.body-strong", ["typography"]); lbl.fills = [{fillColor: U.val("color.text.brand"), fillOpacity: 1}]; U.apply(lbl, "color.text.brand", ["fill"]); }
    else if (i === 0 && idx !== 0) { it.fills = []; if (mk) mk.fills = []; U.apply(lbl, "type.body", ["typography"]); lbl.fills = [{fillColor: U.val("color.text.primary"), fillOpacity: 1}]; U.apply(lbl, "color.text.primary", ["fill"]); }
  });
};

  F.w5 = (key, x, y, idx, o = {}) => {
  const b = F.web(key, x, y);
  const ph = U.vi(b, "organisms/project-header", {}, "project-header", [0, 68]);
  if (o.draft) { U.setText(ph, "name", "Kano–Maradi SGR (393 km)"); const st = penpotUtils.findShape(s => s.name.replace(/\s/g, "") === "status", ph); U.setText(st, "label", "Draft"); U.setText(ph, "gate", "Gate 1 · awaiting publishing"); U.setText(ph, "complete", "0% complete"); U.setText(ph, "organisations", "No contractor yet"); }
  const ln = U.vi(b, "organisms/left-nav", {}, "left-nav", [0, 159]); ln.flex.verticalSizing = "fix"; ln.resize(240, 1024 - 159);
  F.navActive(ln, idx);
  if (o.draft) ln.children.filter(c => /item-/.test(c.name)).forEach((it, i) => { if (i) { const l = penpotUtils.findShape(s => s.type === "text", it); l.fills = [{fillColor: U.val("color.text.tertiary"), fillOpacity: 1}]; U.apply(l, "color.text.tertiary", ["fill"]); } });
  return b;
};

  F.TASKS = [["Lagos–Ibadan",[["verify-photo","Flagged photo at km 212+150","2 days","Lagos–Ibadan · Lot 1 · outside corridor","The dot is 180 m outside the corridor buffer"]]],["Kaduna–Kano SGR",[["approve-ipc","Approve payment certificate","1 day","Kaduna–Kano SGR · IPC 14 · Lot 2","NRC engineer certified it; needs your approval"],["confirm-account","Confirm new account","3 hours","Kaduna–Kano SGR · CCECC site manager · Lot 2","Administrator invited Emeka Nwosu"],["verify-milestone","Verify milestone","5 hours","Kaduna–Kano SGR · Embankment section 12 · Lot 2","Claimed complete at km 104+800 · 4 photos"]]],["Lagos–Calabar coastal",[["upload-document","Upload document","1 day","Lagos–Calabar coastal · BPP Certificate of No Objection · gate 6","Procurement to attach BPP's no-objection letter"],["confirm-gate","Confirm gate 6","4 hours","Lagos–Calabar coastal · BPP no objection","Certificate uploaded; confirm the date"]]],["Kano–Maradi SGR",[["publish-project","Publish project","1 hour","Kano–Maradi SGR · from Engr. A. Bello · gate 1","PM sent the draft for publishing"]]]];

  F.w7 = (key, x, y, sel) => {
  const b = F.web(key, x, y);
  const ib = U.fx(b, "inbox", {x: 0, y: 68, w: 480, h: 956, hs: "fix", vs: "fix", dir: "column", align: "stretch", px: "spacing.16", py: "spacing.16", gap: "spacing.8", fill: "color.surface.page", stroke: "color.border.subtle"});
  const hd = U.fx(ib, "heading", {gap: "spacing.12", fillW: true});
  U.t(hd, "title", "Your tasks today", "type.title-sm"); U.chip(hd, "count", "7", "count");
  U.fx(hd, "spacer", {h: 4, vs: "fix", fillW: true}); U.chip(hd, "filter", "Done today: 4", "done-today");
  F.TASKS.forEach(([proj, tasks]) => { U.t(ib, "group/" + proj, proj, "type.overline", "color.text.secondary"); tasks.forEach(([k, type, age, project, why]) => { const r = U.vi(ib, "molecules/task-row", {selected: k === sel ? "yes" : "no"}, "task/" + k); U.fill(r); U.setText(r, "type", type); U.setText(r, "age", age); U.setText(r, "project", project); U.setText(r, "why", why); }); });
  return b;
};

  F.actionBar = (b, note, sec, pri, o = {}) => {
  const bar = U.fx(b, "actions", {x: o.x || 480, y: 944, w: o.w || 960, h: 80, hs: "fix", vs: "fix", px: "spacing.32", gap: "spacing.16", fill: "color.surface.raised", stroke: "color.border.subtle"});
  U.t(bar, "note", note, "type.body-sm", "color.text.secondary", {fillW: true});
  if (sec) U.btn(bar, sec[2] || "secondary", sec[0], "btn/" + sec[1]);
  U.btn(bar, pri[2] || "primary", pri[0], "btn/" + pri[1]);
  return bar;
};

  F.detail = (b, crumb, title, sub, o = {}) => { const h = U.fx(b, "detail-head", {x: 520, y: 92, w: 880, hs: "fix", dir: "column", align: "start", gap: "spacing.4"}); U.t(h, "breadcrumb", crumb, "type.body-sm", "color.text.secondary"); U.t(h, "title", title, "type.headline"); U.t(h, "subtitle", sub, "type.body", "color.text.secondary", {fillW: true}); return h; };

  F.STEPS = ["Basics","Funding route","Geography","People","Documents","Review and publish"];

  F.w6 = (key, x, y, step, primary = "Next") => {
  const b = F.web(key, x, y);
  const tb = U.fx(b, "title-bar", {x: 0, y: 68, w: 1440, h: 72, hs: "fix", vs: "fix", px: "spacing.24", gap: "spacing.16", fill: "color.surface.raised", stroke: "color.border.subtle"});
  const tl = U.fx(tb, "title", {dir: "column", align: "start", fillW: true}); U.t(tl, "link/back-to-map", "← Back to map", "type.label", "color.text.link"); U.t(tl, "heading", "Create project · Kano–Maradi SGR", "type.title-sm");
  U.chip(tb, "status-draft", "Draft · visible to you and the Director", "draft-chip");
  const st = U.fx(b, "stepper", {x: 0, y: 140, w: 280, h: 804, hs: "fix", vs: "fix", dir: "column", align: "stretch", py: "spacing.24", gap: 0, fill: "color.surface.muted"});
  const sh = U.t(st, "heading", "New project · 6 steps", "type.label", "color.text.secondary"); sh.layoutChild.leftMargin = 24; sh.layoutChild.bottomMargin = 8;
  F.STEPS.forEach((n, i) => { const s = U.vi(st, "molecules/stepper-step", {state: i < step ? "done" : i === step ? "active" : "todo"}, "nav/step-" + (i + 1)); U.setText(s, "name", n); U.setText(s, "number", String(i + 1)); });
  const ft = U.fx(b, "footer", {x: 0, y: 944, w: 1440, h: 80, hs: "fix", vs: "fix", px: "spacing.32", gap: "spacing.16", fill: "color.surface.raised", stroke: "color.border.subtle"});
  const sp = U.fx(ft, "stepper-gap", {w: 248, h: 8, hs: "fix", vs: "fix"});
  U.btn(ft, "secondary", "Back", "btn/back"); U.t(ft, "step-count", `Step ${step + 1} of 6`, "type.body-sm", "color.text.secondary", {fillW: true});
  U.btn(ft, "text", "Save draft", "btn/save-draft"); U.btn(ft, "primary", primary, "btn/next");
  storage.fixStepHead(b); storage.fixStepHead(b); return b; };

  F.admin = (key, x, y, idx) => {
  const b = F.web(key, x, y);
  const an = U.vi(b, "organisms/admin-nav", {}, "admin-nav", [0, 68]); an.flex.verticalSizing = "fix"; an.resize(240, 956);
  if (idx !== 1) F.navActive(an, idx);
  if (idx === 0) { const it = an.children.filter(c => /item-/.test(c.name))[1]; it.fills = []; const mk = it.children.find(c => /marker/.test(c.name)); if (mk) mk.fills = []; const l = penpotUtils.findShape(s => s.type === "text", it); U.apply(l, "type.body", ["typography"]); l.fills = [{fillColor: U.val("color.text.primary"), fillOpacity: 1}]; U.apply(l, "color.text.primary", ["fill"]); }
  return b;
};

  F.phone = (key, x, y, theme = "light", fill = "color.surface.page") => { const b = U.board("screens/" + key, x, y, 390, 844, fill); U.vi(b, "organisms/phone-status-bar", {theme}, "status-bar", [0, 0]); return b; };

  F.homeBar = b => { const hb = U.fx(b, "home-indicator", {x: 0, y: 820, w: 390, h: 24, hs: "fix", vs: "fix", justify: "center"}); U.fx(hb, "bar", {w: 134, h: 5, hs: "fix", vs: "fix", radius: "radius.full", fill: "color.text.primary"}); return hb; };

  F.ptop = (b, back, title, y = 44) => { const t = U.vi(b, "organisms/phone-top-bar", {}, "top-bar", [0, y]); U.setText(t, "label", back); U.setText(t, "title", title); penpotUtils.findShape(s => /back/.test(s.name) && s.type === "board", t) && (penpotUtils.findShape(s => /back/.test(s.name) && s.type === "board", t).name = "back"); return t; };

  F.col = (b, name, x, y, w, o = {}) => U.fx(b, name, Object.assign({x, y, w, hs: "fix", dir: "column", align: "stretch", gap: "spacing.16"}, o));

  F.recap = (p, title, rows, edit, name) => {
  const r = U.vi(p, "molecules/recap-block", {edit: edit ? "yes" : "no"}, name); U.fill(r);
  U.setText(r, "title", title);
  for (let i = 0; i < 5; i++) { const row = r.children.find(c => c.name.replace(/\s/g, "") === "row-" + (i + 1)); if (!row) continue; if (rows[i]) { U.setText(row, "key", rows[i][0]); U.setText(row, "value", rows[i][1]); } else row.hidden = true; }
  const el = penpotUtils.findShape(s => /edit-link/.test(s.name), r); if (el) el.name = "link/edit";
  return r;
};

  F.RECAP = [["1. Basics",[["Name","Kano–Maradi Standard Gauge Railway"],["Type","New line · standard gauge"],["Route","Kano to Maradi (Niger border)"],["States","Kano, Jigawa, Katsina"],["Origin","Master plan"]]],["2. Funding route",[["Route","External loan"],["Template","15 gates"],["Gate 1","Awaiting the Director"],["Gates 2 to 15","Not started"],["Lender","China Exim (proposed)"]]],["3. Geography",[["File","Kano–Maradi.kmz · 688 points"],["Length","393 km"],["Corridor","500 m buffer each side"],["Start","Kano · km 0+000 (terminal)"],["Stations","Katsina km 190+000 · Maradi km 393+000"]]],["4. People",[["Project manager","Engr. A. Bello · owner"],["Director, rail","Engr. H. Danjuma · publishes"],["NRC engineer","Engr. F. Musa"],["Contractor","Added at gate 8"],["Consultant","Added at gate 8"]]],["5. Documents",[["D01","Concept note v3 · 2.4 MB"],["D02","Minister's approval minute · v1"],["Gate 1","Marked passed 21 Oct 2026"],["Note","D02 is evidence, not an in-system approval"]]]];

  F.who = (p, self) => { const c = U.card(p, "who-approves", {fill: "color.surface.muted", shadow: null, gap: "spacing.8", fillW: true}); U.t(c, "title", "Who approves publishing", "type.body-strong"); [self ? "The Director, rail publishes with a PIN; that confirms gate 1." : "You publish with your PIN; that confirms gate 1.", self ? "You created this project, so you cannot publish it." : "Engr. A. Bello created it, so cannot publish it.", "The NRC alignment check is optional and never blocks publishing.", "The PS and the Minister see it after publishing; they do not approve it."].forEach((t, i) => U.t(c, "point-" + (i + 1), "• " + t, "type.body-sm", "color.text.primary", {fillW: true})); return c; };

  F.sec = (b, title, sub, y = 183) => { const h = U.fx(b, "section-head", {x: 268, y, w: 1144, hs: "fix", gap: "spacing.16"}); const c = U.fx(h, "text", {dir: "column", align: "start", fillW: true}); U.t(c, "title", title, "type.title"); if (sub) U.t(c, "subtitle", sub, "type.body-sm", "color.text.secondary"); return h; };

  F.stepTitle = (b, t, intro) => { const h = U.fx(b, "step-title", {x: 320, y: 164, w: 1080, hs: "fix", dir: "column", align: "start", gap: "spacing.4"}); U.t(h, "title", t, "type.title"); U.t(h, "intro", intro, "type.body", "color.text.secondary", {fillW: true}); return h; };

  F.input = (p, type, label, value, hint, name, w) => { const i = U.vi(p, "atoms/input", {type, state: "default"}, name); if (w) i.resize(w, i.height); else U.fill(i); U.setText(i, "label", label); U.setText(i, "value", value); U.setText(i, "hint", hint || " "); return i; };

  F.w6map = (b, mode, sub) => {
  const c = U.card(b, "map-preview", {x: 900, y: 230, w: 516, h: 690, hs: "fix", vs: "fix", gap: "spacing.8"}); U.t(c, "title", "Map preview", "type.body-strong"); U.t(c, "subtitle", sub, "type.body-sm", "color.text.secondary", {fillW: true});
  const mp = penpot.createBoard(); c.appendChild(mp); mp.name = "map"; mp.resize(484, 540); mp.layoutChild.horizontalSizing = "fill"; U.paint(mp, {fill: "color.surface.muted", radius: "radius.8"}); mp.clipContent = true;
  if (mode === "placeholder") U.poly(mp, "line", [[110, 470], [380, 90]], "color.status.draft.line", "map.corridor.width", {dash: true});
  if (mode === "real") U.poly(mp, "line", [[110, 470], [230, 300], [380, 90]], "color.status.planned.line", "map.corridor.width");
  if (mode !== "none") [["kano", 110, 470, "Kano 0+000", 126, 466], ["maradi", 380, 90, "Maradi 393+000", 270, 60]].concat(mode === "real" ? [["katsina", 230, 300, "Katsina 190+000", 246, 296]] : []).forEach(([k, px, py, l, lx, ly]) => { U.ellipse(mp, "station-" + k, px, py, 12, {fill: "map.station.fill", stroke: "map.station.stroke", sw: 2}); U.text(mp, "label-" + k, lx, ly, l, "type.caption", "map.label.fg"); });
  else U.text(mp, "empty", 140, 260, "Nothing on the map yet", "type.body", "color.text.secondary");
  const lg = U.vi(c, "molecules/legend-row", {status: mode === "real" ? "planned" : "draft"}, "legend"); U.setText(lg, "label", mode === "real" ? "Alignment from Kano–Maradi.kmz · 393 km" : "Placeholder line between the two towns");
  return c;
};

  F.adminHead = (b, title, count, btn, btnName) => { const h = U.fx(b, "toolbar-head", {x: 264, y: 92, w: 680, hs: "fix", gap: "spacing.16"}); const c = U.fx(h, "text", {dir: "column", align: "start", fillW: true}); U.t(c, "title", title, "type.headline"); U.t(c, "count", count, "type.body-sm", "color.text.secondary"); U.btn(h, "primary", btn, "btn/" + btnName); return h; };

  F.filters = (b, labels, y = 180) => { const r = U.fx(b, "filters", {x: 264, y, gap: "spacing.12"}); const s = U.vi(r, "molecules/search-box", {}, "search"); s.resize(300, s.height); U.setText(s, "placeholder", "Search name or phone"); labels.forEach(l => U.chip(r, "filter", l + " ▾", "filter-" + l.toLowerCase())); return r; };

  F.arow = (p, st, cells, name) => { const r = U.vi(p, "molecules/admin-row", {status: st}, name); const set = (col, a, b2) => { const c = penpotUtils.findShape(s => s.name.replace(/\s/g, "") === col, r); if (!c) return; if (b2 === undefined) { const t = penpotUtils.findShape(s => s.type === "text", c) || c; if (t.type === "text") t.characters = a; } else { U.setText(c, "primary", a); U.setText(c, "secondary", b2); } }; set("person", cells[0], cells[1]); set("organisation", cells[2], cells[3]); if (cells[4]) { const chip = penpotUtils.findShape(s => s.name.replace(/\s/g, "") === "status", r); if (chip) U.setText(chip, "label", cells[4]); } ["last-login", "last-upload", "pending"].forEach((k, i) => { const t = penpotUtils.findShape(s => s.type === "text" && s.name.replace(/\s/g, "") === k, r); if (t && cells[5 + i] !== undefined) t.characters = cells[5 + i]; }); return r; };

  F.USERS = [["active","Aisha Bello","0803 412 7781","FMoT Rail directorate","Ministry project manager",null,"Today 09:12","Yesterday","3"],["active","Engr. H. Danjuma","0805 220 1934","FMoT Rail directorate","Director, rail",null,"Today 08:40","—","6"],["active","Engr. F. Musa","0806 771 0452","NRC","NRC project engineer",null,"Yesterday","2 days ago","1"],["active","Engr. K. Adeyemi","0802 315 8890","TEAM Consultants","Consultant resident engineer",null,"Today 07:55","Today 11:02","14"],["active","Li Wei","0809 004 2217","CCECC","Contractor commercial manager",null,"3 days ago","3 days ago","0"],["active","Musa Garba","0813 664 0128","CCECC","Contractor site manager",null,"Today 06:30","Today 10:47","0"],["invited","Chinedu Okafor","0817 902 3346","CCECC","Contractor site manager",null,"Never","—","0"],["active","Grace Eze","0803 558 6610","FMoT Finance","Finance officer",null,"2 days ago","5 days ago","2"],["locked","Tunde Bakare","0816 237 9905","Mota-Engil","Contractor site manager",null,"12 days ago","12 days ago","0"],["active","Ibrahim Sule","0807 441 2093","FMoT Security unit","Security desk officer",null,"Today 08:05","—","1"],["deactivated","Ngozi Obi","0802 119 7764","AfDB","Lender viewer",null,"2 months ago","—","0"]];

  F.usersTable = (b, invited) => { const t = U.fx(b, "users-table", {x: 264, y: 236, w: 1000, hs: "fix", dir: "column", align: "stretch"}); U.vi(t, "molecules/admin-row", {status: "header"}, "header"); if (invited) F.arow(t, "invited-new", ["Emeka Nwosu", "+234 812 445 0193", "CCECC", "Contractor site manager", null, "Never", "—", "0"], "row/invited-new"); F.USERS.slice(0, invited ? 10 : 11).forEach((u, i) => F.arow(t, u[0], u.slice(1), "row-" + (i + 1))); U.t(b, "pagination", `Showing ${invited ? 11 : 11} of ${invited ? 215 : 214} · Next page →`, "type.body-sm", "color.text.secondary"); const pg = b.children.find(c => c.name === "pagination"); pg.x = b.x + 264; pg.y = b.y + 1000 - 24; return t; };

  F.signedOut = (key, x, y) => {
  const b = U.board("screens/" + key, x, y, 1440, 1024, "color.surface.page");
  const hb = U.fx(b, "header", {x: 0, y: 0, w: 1440, h: 64, hs: "fix", vs: "fix", px: "spacing.24", gap: "spacing.16", fill: "header.bg"});
  U.fx(hb, "crest-slot (placeholder; do not draw the coat of arms)", {w: 40, h: 40, hs: "fix", vs: "fix", stroke: "header.fg", dash: true, radius: "radius.4"});
  const t = U.fx(hb, "title", {dir: "column", align: "start"}); U.t(t, "app", "Rail Project Tracker", "type.body-strong", "header.fg"); U.t(t, "ministry", "Federal Ministry of Transportation", "type.caption", "header.fg");
  U.rect(b, "stripe", 0, 64, 1440, 4, {fill: "header.stripe"});
  return b;
};

  F.pinRow = (p, label, filled) => { const r = U.fx(p, "pin", {dir: "column", align: "center", gap: "spacing.8", fillW: true}); U.t(r, "label", label, "type.label"); const d = U.fx(r, "dots", {gap: "spacing.12"}); [0, 1, 2, 3].forEach(i => U.vi(d, "atoms/pin-dot", {filled: i < filled ? "yes" : "no"}, "dot-" + (i + 1))); return r; };

  F.pcol = (b, y, o = {}) => U.fx(b, "content", Object.assign({x: 0, y, w: 390, hs: "fix", dir: "column", align: "stretch", px: "spacing.16", gap: "spacing.12"}, o));

  F.pbtn = (p, kind, label, name) => { const bt = U.btn(p, kind, label, name, "large"); U.fill(bt); return bt; };

  F.pinput = (p, type, label, value, hint, name) => { const i = F.input(p, type, label, value, hint, name); const fld = penpotUtils.findShape(s => s.name.replace(/\s/g, "") === "field", i); if (fld) { fld.resize(fld.width, 48); U.apply(fld, "input.height-phone", ["height"]); } return i; };

  storage.fixPeople = (b) => {
  const m = b.children.find(c => c.name === "members"), mx = b.children.find(c => c.name === "responsibility-matrix");
  m.y = b.y + 240; mx.y = b.y + 240;
  penpotUtils.findShapes(s => /member-\d/.test(s.name), m).forEach(pl => { const col = pl.children.find(c => c.name.replace(/\s/g, "") === "text"); if (col) { col.layoutChild.horizontalSizing = "fill"; col.children.forEach(t => { t.layoutChild.horizontalSizing = "fill"; t.growType = "auto-height"; }); } });
  penpotUtils.findShapes(s => /^(row-\d+|header)$/.test(s.name), mx).forEach(r => { const ap = r.children.find(c => c.name.replace(/\s/g, "").endsWith("approves")), st = r.children.find(c => c.name.replace(/\s/g, "").endsWith("status")); if (ap) { ap.resize(160, ap.height); ap.growType = "auto-height"; } if (st) { st.resize(106, st.height); st.growType = "auto-height"; } });
};

  storage.queried = b => penpotUtils.findShapes(s => s.type === "text" && s.characters === "Valuation queried", b).forEach(t => t.characters = "Queried");

  storage.draftChip = (b) => { const ph = b.children.find(c => c.name === "project-header"); const st = penpotUtils.findShape(s => s.name.replace(/\s/g, "") === "status", ph); U.paint(st, {fill: "color.status.draft.bg", stroke: "color.status.draft.line", dash: true}); const l = penpotUtils.findShape(s => s.type === "text", st); l.fills = [{fillColor: U.val("color.status.draft.fg"), fillOpacity: 1}]; U.apply(l, "color.status.draft.fg", ["fill"]); };

  storage.fixStepHead = (b) => { const st = b.children.find(c => c.name === "stepper"); const h = st.children.find(c => c.name === "heading"); if (!h) return; const w = U.fx(st, "heading-row", {px: "spacing.24", fillW: true}); st.insertChild(0, w); w.appendChild(h); };

  storage.fixFunding = (b) => { fixF(b); storage.fixFundingMap(b); };

  storage.fixFundingMap = (b) => {
  const mp = b.children.find(c => c.name === "map-preview"), m = mp.children.find(c => c.name === "map");
  const line = m.children.find(c => c.name === "line"); line.content = `M${m.x + 120},${m.y + 210} L${m.x + 360},${m.y + 40}`;
  const P = {kano: [120, 210, 136, 204], maradi: [360, 40, 250, 24]};
  for (const [k, [px, py, lx, ly]] of Object.entries(P)) { const s = m.children.find(c => c.name === "station-" + k), l = m.children.find(c => c.name === "label-" + k); if (s) { s.x = m.x + px - 6; s.y = m.y + py - 6; } if (l) { l.x = m.x + lx; l.y = m.y + ly; } }
};

  storage.fixRowAuto = (row) => { row.flex.alignItems = "start"; row.flex.verticalSizing = "auto"; row.children.forEach(c => { if (c.flex) c.flex.verticalSizing = "auto"; c.layoutChild.horizontalSizing = "fill"; }); };

  storage.fixPublish = (b) => { fp(b); const r3 = penpotUtils.findShape(s => s.name === "recap-3", b); const row = r3.children.find(c => c.name.replace(/\s/g, "") === "row-3"); if (row) row.hidden = true; };

  storage.vis = (s, top) => { let p = s; while (p && p.id !== top.id) { if (p.hidden) return false; p = p.parent; } return true; };

  storage.fixOrgs = (b) => {
  const hd = penpotUtils.findShape(s => s.name === "header", b);
  const map = {person: "Organisation", organisation: "Type and projects", "last-login": "People", "last-upload": "Confirmed by", pending: "Tasks"};
  penpotUtils.findShapes(s => s.type === "text" && storage.vis(s, hd), hd).forEach(t => { const k = t.name.replace(/\s/g, ""); if (map[k]) t.characters = map[k]; });
  penpotUtils.findShapes(s => s.type === "text" && s.characters === "Awaiting Director", b).forEach(t => t.characters = "Awaiting");
  U.setText(penpotUtils.findShape(s => s.name === "search", b), "placeholder", "Search organisation");
};

  storage.phoneChips = (bb) => { pc(bb); if (bb.name.includes("m4-report")) { const cc = bb.children.find(x => x.name === "content"); cc.flex.rowGap = 6; } };

  storage.fixSent = (b) => {
  const c = b.children.find(x => x.name === "content");
  const tp = c.children.find(x => x.name.replace(/\s/g, "") === "btn/take-photo"); tp.resize(tp.width, 96);
  const cs = c.children.find(x => x.name.replace(/\s/g, "") === "btn/call-support"); cs.hidden = true;
  const ho = b.children.find(x => /handoff/.test(x.name)), ts = b.children.find(x => x.name === "toast");
  ho.x = b.x + 16; ho.y = b.y + 724; ts.x = b.x + 8; ts.y = b.y + 768; b.appendChild(ho); b.appendChild(ts);
};

  storage.fixOutbox = (bb) => { f(bb); bb.children.find(x => x.name === "content").flex.rowGap = 6; };

  SB["w7-tasks"] = async (x, y) => {
  const b = F.w7("w7-tasks", x, y, "approve-ipc");
  const fr = U.vi(b, "organisms/task-detail-frame", {}, "detail", [480, 68]);
  fr.flex.verticalSizing = "fix"; fr.resize(960, 956);
  const body = fr.children.find(c => /body/.test(c.name)); body.layoutChild.verticalSizing = "fill";
  const act = fr.children.find(c => /actions/.test(c.name)); act.name = "actions";
  ["secondary", "primary"].forEach(k => { const bt = penpotUtils.findShape(s => s.name.replace(/\s/g, "") === k, act); if (bt) bt.name = "btn/" + (k === "primary" ? "approve" : "return"); });
  // extra cards under the amount card
  const ex = F.col(b, "measurement", 512, 366, 436, {gap: "spacing.16"});
  const ms = U.card(ex, "measurement-summary", {gap: "spacing.8", fillW: true}); U.t(ms, "title", "Measurement summary · MS-09", "type.body-strong");
  [["Earthworks", "42,300 m³ · 61% to date"], ["Bridges and culverts", "3 culverts · 48%"], ["Track laying", "6.4 km · 22%"], ["Stations", "Zaria 15% · 9%"]].forEach(([k, v]) => U.kv(ms, k, v));
  const dd = U.card(ex, "deductions", {gap: "spacing.8", fillW: true}); U.t(dd, "title", "Deductions", "type.body-strong");
  [["Gross value", "₦5,620,400,000"], ["Retention (5%)", "− ₦281,020,000"], ["Advance recovery", "− ₦449,632,000"], ["Net payable", "₦4,812,650,000"]].forEach(([k, v]) => U.kv(dd, k, v));
  const ho = U.vi(b, "molecules/handoff-chip", {}, "handoff/next-valuation", [1236, 84]); U.setText(ho, "label", "Next: valuation");
  await U.flush(); return b.id;
};

  SB["w7-publish-project"] = async (x, y) => {
  const b = F.w7("w7-publish-project", x, y, "publish-project");
  F.detail(b, "Kano–Maradi SGR · Gate 1 Initiation · Publish project", "Publish project · Kano–Maradi SGR", "Sent by Engr. A. Bello (Ministry project manager) · today 09:40 · 1 hour ago");
  const pl = U.fx(b, "previews", {x: 1180, y: 92, w: 220, hs: "fix", dir: "column", align: "end", gap: "spacing.8"});
  U.t(pl, "link/preview-map", "Preview on map →", "type.label", "color.text.link"); U.t(pl, "link/preview-page", "Preview project page →", "type.label", "color.text.link");
  const L = F.col(b, "recap-left", 520, 208, 420, {gap: "spacing.12"}), R = F.col(b, "recap-right", 980, 208, 420, {gap: "spacing.12"});
  F.RECAP.slice(0, 3).forEach(([t, rows], i) => F.recap(L, t, rows, false, "recap-" + (i + 1)));
  F.RECAP.slice(3).forEach(([t, rows], i) => F.recap(R, t, rows, false, "recap-" + (i + 4)));
  F.who(R, false);
  F.actionBar(b, "Publishing confirms gate 1, sets status Identified and draws the corridor for every member.", ["Return…", "return"], ["Publish (PIN)", "publish"]);
  await U.flush(); return b.id;
};

  SB["w7-confirm-account"] = async (x, y) => {
  const b = F.w7("w7-confirm-account", x, y, "confirm-account");
  F.detail(b, "Kaduna–Kano SGR · Lot 2 · Confirm new account · W7.8", "Confirm new account · Emeka Nwosu", "Invited by Ade Ogun (IT administrator) · today 07:15 · 3 hours ago");
  const L = F.col(b, "left", 520, 208, 420), R = F.col(b, "right", 980, 208, 420);
  const pc = U.card(L, "person", {fillW: true}); const pl = U.vi(pc, "molecules/person-line", {}, "person-line"); U.fill(pl); U.setText(pl, "name", "Emeka Nwosu"); U.setText(pl, "role", "Contractor site manager · CCECC"); U.setText(pl, "number", "+234 812 445 0193"); U.setText(pl, "initials", "EN");
  [["Organisation", "CCECC (contractor, external)"], ["Role", "Contractor site manager"], ["Lots requested", "Kaduna–Kano SGR · Lot 2"], ["Chainage", "km 68+000 to 137+000"], ["Requested by", "Li Wei, CCECC commercial manager"], ["Invite", "SMS sent 07:15, not yet accepted"]].forEach(([k, v]) => U.kv(pc, k, v));
  const wc = U.card(R, "why-you-confirm", {fill: "color.surface.muted", shadow: null, fillW: true}); U.t(wc, "title", "Why you confirm", "type.body-strong"); U.t(wc, "text", "CCECC is an external organisation. The Director confirms its people before they can upload photos or reports. Confirming lets Emeka sign in on the phone app (M1).", "type.body", "color.text.primary", {fillW: true});
  const rc = U.card(R, "rules", {fillW: true}); U.t(rc, "title", "Checks", "type.body-strong"); ["Phone number is not used by another account", "Lot 2 belongs to CCECC's contract", "Role matches the organisation type"].forEach((t, i) => { const r = U.vi(rc, "atoms/checkbox", {checked: "yes", disabled: "no"}, "check-" + (i + 1)); U.setText(r, "label", t); });
  F.actionBar(b, "Confirming writes an audit row with your PIN.", ["Decline…", "decline"], ["Confirm (PIN)", "confirm"]);
  await U.flush(); return b.id;
};

  SB["w7-verify-photo"] = async (x, y) => {
  const b = F.w7("w7-verify-photo", x, y, "verify-photo");
  F.detail(b, "Lagos–Ibadan · Lot 1 · Photos and reports · W7.1", "Verify photo · km 212+150", "Flagged: outside the corridor · taken 27 Oct 2026 14:32 · Ade Bakare");
  const L = F.col(b, "left", 520, 208, 500), R = F.col(b, "right", 1044, 208, 356);
  const ph = U.card(L, "photo", {fillW: true}); const img = U.fx(ph, "image", {h: 300, vs: "fix", justify: "center", fill: "color.surface.muted", radius: "radius.8", fillW: true}); U.icon(img, "photo", "color.text.secondary", 48);
  [["Taken", "27 Oct 2026 14:32 · heading NE"], ["By", "Ade Bakare · CCECC site manager"], ["Device", "Tecno Spark 10 · app 1.4.2"], ["Accuracy", "GPS ±6 m"]].forEach(([k, v]) => U.kv(ph, k, v));
  const ci = U.vi(R, "organisms/corridor-inset", {}, "corridor-inset"); U.fill(ci);
  const ck = U.card(R, "checks", {fillW: true, gap: "spacing.8"}); U.t(ck, "title", "Automatic checks", "type.body-strong");
  [["under-construction", "Corridor: 180 m outside the buffer"], ["operational", "Time: matches the upload"], ["operational", "Device: registered to Ade Bakare"], ["operational", "Duplicate: none found"]].forEach(([s, t], i) => { const r = U.fx(ck, "check-" + (i + 1), {gap: "spacing.8", fillW: true}); U.vi(r, "atoms/status-dot", {status: s}, "dot"); U.t(r, "text", t, "type.body-sm", "color.text.primary", {fillW: true}); });
  const pv = U.vi(R, "molecules/photo-thumbnail", {status: "verified"}, "previous-photo"); U.setText(pv, "chainage", "Previous at km 212+150"); U.setText(pv, "date", "13 Oct 2026");
  F.actionBar(b, "Verifying counts it toward progress; Send back returns it with a reason.", ["Send back…", "send-back"], ["Verify", "verify"]);
  await U.flush(); return b.id;
};

  SB["w7-verify-milestone"] = async (x, y) => {
  const b = F.w7("w7-verify-milestone", x, y, "verify-milestone");
  F.detail(b, "Kaduna–Kano SGR · Lot 2 · Milestones · W7.2", "Verify milestone · Embankment section 12", "Claimed by Musa Garba (CCECC site manager) · today 08:15 · km 104+300 to 104+800");
  const L = F.col(b, "left", 520, 208, 420), R = F.col(b, "right", 980, 208, 420);
  const pc = U.card(L, "claim-photos", {fillW: true}); U.t(pc, "title", "Claim photos · 4", "type.body-strong");
  for (let r = 0; r < 2; r++) { const row = U.fx(pc, "row-" + (r + 1), {gap: "spacing.12", fillW: true}); [["km 104+320", "27 Oct 2026"], ["km 104+480", "28 Oct 2026"], ["km 104+650", "29 Oct 2026"], ["km 104+790", "29 Oct 2026"]].slice(r * 2, r * 2 + 2).forEach(([c, d], i) => { const t = U.vi(row, "molecules/photo-thumbnail", {status: "pending"}, "photo-" + (r * 2 + i + 1)); t.resize(186, t.height); U.setText(t, "chainage", c); U.setText(t, "date", d); }); }
  const cl = U.card(L, "claim", {fillW: true, gap: "spacing.8"}); U.t(cl, "title", "Claim", "type.body-strong");
  [["Quantity", "48,000 m³ of fill"], ["BOQ item", "2.3.1 Embankment fill"], ["Value", "₦412,000,000"]].forEach(([k, v]) => U.kv(cl, k, v));
  const ck = U.card(R, "checklist", {fillW: true, gap: "spacing.4"}); U.t(ck, "title", "Check before verifying", "type.body-strong");
  [["Photos match the claimed chainage", "yes"], ["Level survey attached (LS-12)", "yes"], ["Compaction test 98%, witnessed by you", "yes"], ["No open sent-back items on this section", "no"]].forEach(([t, c], i) => { const r = U.vi(ck, "atoms/checkbox", {checked: c, disabled: "no"}, "check-" + (i + 1)); U.setText(r, "label", t); });
  U.t(ck, "open-item", "1 open: photo unclear at km 103+900", "type.body-sm", "color.text.error");
  const ts = U.card(R, "tests", {fillW: true, gap: "spacing.8"}); U.t(ts, "title", "Tests on this section", "type.body-strong");
  [["Compaction", "98% · passed · 27 Oct"], ["Level survey", "Within ±25 mm · 28 Oct"], ["Witnessed by", "Engr. K. Adeyemi (TEAM)"]].forEach(([k, v]) => U.kv(ts, k, v));
  F.actionBar(b, "Verifying adds it to this month's measurement sheet (MS-10) and writes an audit row.", ["Send back…", "send-back"], ["Verify (PIN)", "verify"]);
  await U.flush(); return b.id;
};

  SB["w7-upload-document"] = async (x, y) => {
  const b = F.w7("w7-upload-document", x, y, "upload-document");
  F.detail(b, "Lagos–Calabar coastal · Gate 6 BPP no objection · W7.7", "Upload document · BPP Certificate of No Objection", "Requested by the gate 6 template · due today");
  const L = F.col(b, "left", 520, 208, 520), R = F.col(b, "right", 1080, 208, 320);
  const ex = U.card(L, "expected", {fillW: true, gap: "spacing.8"}); U.t(ex, "title", "Expected document", "type.body-strong");
  [["Code", "D11 · BPP Certificate of No Objection"], ["Gate", "6 BPP no objection"], ["Uploader", "Bola Ade, Procurement (you)"], ["Confirmer", "Engr. H. Danjuma, Director, rail"]].forEach(([k, v]) => U.kv(ex, k, v));
  const f1 = U.vi(L, "atoms/input", {type: "file", state: "default"}, "file"); U.fill(f1); U.setText(f1, "label", "Certificate file"); U.setText(f1, "value", "BPP-CNO-LC-2026-044.pdf · 1.2 MB"); U.setText(f1, "hint", "PDF, up to 20 MB · chosen just now");
  const f2 = U.vi(L, "atoms/input", {type: "date", state: "default"}, "date"); U.fill(f2); U.setText(f2, "label", "Date on the certificate"); U.setText(f2, "value", "24 Oct 2026"); U.setText(f2, "hint", "Becomes the date gate 6 passed once confirmed");
  const nx = U.card(R, "what-next", {fill: "color.surface.muted", shadow: null, fillW: true}); U.t(nx, "title", "What happens next", "type.body-strong"); U.t(nx, "text", "Submitting stores D11 against gate 6 and sends a Confirm gate task to the Director. Nobody else can change the file afterwards; corrections are new versions.", "type.body", "color.text.primary", {fillW: true});
  F.actionBar(b, "The file is checked for size and type before it is stored.", null, ["Submit", "submit"]);
  await U.flush(); return b.id;
};

  SB["w7-confirm-gate"] = async (x, y) => {
  const b = F.w7("w7-confirm-gate", x, y, "confirm-gate");
  F.detail(b, "Lagos–Calabar coastal · Gate 6 · W7.3", "Confirm gate 6 · BPP no objection", "Evidence uploaded by Bola Ade (Procurement) · today 06:50 · 4 hours ago");
  const v = U.fx(b, "viewer", {x: 520, y: 208, w: 560, h: 712, hs: "fix", vs: "fix", dir: "column", align: "stretch", fill: "color.surface.muted", stroke: "color.border.subtle", radius: "radius.8"});
  const tb = U.fx(v, "toolbar", {h: 44, vs: "fix", px: "spacing.16", gap: "spacing.12", fill: "color.surface.raised", fillW: true}); U.icon(tb, "document", "color.text.secondary", 20); U.t(tb, "file", "BPP-CNO-LC-2026-044.pdf · page 1 of 2", "type.label", "color.text.primary", {fillW: true}); U.t(tb, "zoom", "100%", "type.body-sm", "color.text.secondary");
  const pg = U.fx(v, "page-area", {justify: "center", py: "spacing.24", fillW: true, fillH: true});
  const page = U.fx(pg, "page", {w: 420, h: 600, hs: "fix", vs: "fix", dir: "column", align: "stretch", px: "spacing.32", py: "spacing.32", gap: "spacing.12", fill: "color.surface.raised", stroke: "color.border.subtle"});
  U.t(page, "heading", "BUREAU OF PUBLIC PROCUREMENT", "type.label", "color.text.primary", {fillW: true}).align = "center";
  U.t(page, "doc-title", "Certificate of No Objection", "type.body-strong", "color.text.primary", {fillW: true}).align = "center";
  U.t(page, "ref", "Ref: BPP/CNO/LC/2026/044 · Lagos–Calabar coastal railway, procurement of works", "type.body-sm", "color.text.secondary", {fillW: true});
  U.t(page, "body", "The Bureau has reviewed the procurement process and issues its no objection to the award of the works contract, subject to the conditions in the schedule.", "type.body-sm", "color.text.primary", {fillW: true});
  U.t(page, "date", "Dated 24 October 2026", "type.body-sm", "color.text.secondary");
  const R = F.col(b, "right", 1100, 208, 300);
  const ev = U.card(R, "evidence", {fillW: true, gap: "spacing.8"}); U.t(ev, "title", "Evidence", "type.body-strong");
  [["Uploaded by", "Bola Ade, Procurement"], ["When", "Today 06:50"], ["Date entered", "24 Oct 2026"], ["Register", "D11 · version 1"], ["Approving party", "BPP"]].forEach(([k, v2]) => { const r = U.kv(ev, k, v2); });
  const oc = U.card(R, "on-confirm", {fill: "color.surface.muted", shadow: null, fillW: true}); U.t(oc, "title", "On Confirm", "type.body-strong"); U.t(oc, "text", "Gate 6 becomes Passed with 24 Oct 2026 and its clock stops. Return sends it back to Procurement with your reason.", "type.body-sm", "color.text.primary", {fillW: true});
  F.actionBar(b, "Confirming writes an audit row with your PIN.", ["Return…", "return"], ["Confirm (PIN)", "confirm"]);
  await U.flush(); return b.id;
};

  SB["w7-approve-ipc-pin"] = async (x, y) => {
  const id = await SB["w7-tasks"](x, y);
  const b = penpot.currentPage.getShapeById(id); b.name = "screens/w7-approve-ipc-pin";
  const sc = U.rect(b, "scrim", 0, 0, 1440, 1024, {fill: "color.surface.scrim"}); sc.fills = [{fillColor: "#161B22", fillOpacity: 0.6}]; U.apply(sc, "color.surface.scrim", ["fill"]);
  const ps = U.vi(b, "organisms/pin-sheet", {}, "pin-sheet", [1040, 260]);
  ["confirm", "cancel"].forEach(k => { const s = penpotUtils.findShape(x => x.name.replace(/\s/g, "") === k, ps); if (s) s.name = "btn/" + k; });
  await U.flush(); sc.fills = [{fillColor: sc.fills[0].fillColor, fillOpacity: 0.6}];
  return b.id;
};

  SB["overlays/return-reasons"] = async (x, y) => {
  const b = U.board("overlays/return-reasons", x, y, 480, 560, "color.surface.page"); b.fills = [];
  const rr = U.vi(b, "organisms/return-reasons", {}, "return-reasons", [0, 0]);
  U.setText(rr, "subtitle", "It goes back to the sender with the reason you pick.");
  ["Photo unclear", "Wrong chainage or outside the corridor", "Missing document", "Amount disputed", "Other (add a short note)"].forEach((t, i) => { const r = penpotUtils.findShape(s => s.name.replace(/\s/g, "") === "reason-" + (i + 1), rr); U.setText(r, "title", t); });
  ["cancel", "send-back"].forEach(k => { const s = penpotUtils.findShape(x => x.name.replace(/\s/g, "") === k, rr); if (s) s.name = "btn/" + k; });
  await new Promise(r => setTimeout(r, 300)); b.resize(480, Math.ceil(rr.height));
  await U.flush(); return b.id;
};

  SB["w5-gates"] = async (x, y) => {
  const b = F.w5("w5-gates", x, y, 1);
  U.text(b, "caption", 268, 176, "Gates · external loan template · gate 13 current · gate 10 blocked 41 days", "type.body-strong", "color.text.primary");
  const t = U.fx(b, "gates-table", {x: 268, y: 206, w: 1144, hs: "fix", dir: "column", align: "stretch"});
  U.vi(t, "molecules/gate-row", {status: "header"}, "header");
  G.forEach((g, i) => { const r = U.vi(t, "molecules/gate-row", {status: g[3]}, "row-" + (i + 1)); ["gate", "kind", "approver", null, "date", "days", "evidence", "uploaded", "confirmed", "action"].forEach((k, j) => { if (k) U.setText(r, k, g[j]); }); const a = penpotUtils.findShape(s => s.type === "text" && s.name.replace(/\s/g, "").endsWith("action"), r); if (a) a.name = g[9] === "—" ? "action" : "link/" + g[9].toLowerCase().replace(/ /g, "-") + "-" + (i + 1); });
  await U.flush(); return b.id;
};

  SB["w5-payments"] = async (x, y) => {
  const b = F.w5("w5-payments", x, y, 5);
  const h = F.sec(b, "Payments", "Interim payment certificates · Lot 2 · amounts shown because you hold the financial-amounts permission");
  U.btn(h, "primary", "New valuation", "btn/new-valuation");
  const t = U.fx(b, "ipc-table", {x: 268, y: 250, w: 1144, hs: "fix", dir: "column", align: "stretch"});
  U.vi(t, "molecules/ipc-row", {status: "header"}, "header");
  [["recommended", "IPC 15 · Lot 2", "October 2026", "V-15 · draft", "₦5,104,000,000", "Draft", "Today"], ["waiting", "IPC 14 · Lot 2", "September 2026", "V-14 · Li Wei", "₦4,812,650,000", "Waiting for the Director", "28 Oct 2026"], ["paid", "IPC 13 · Lot 2", "August 2026", "V-13 · Li Wei", "₦4,390,100,000", "Approved", "2 Oct 2026"], ["paid", "IPC 12 · Lot 2", "July 2026", "V-12 · Li Wei", "₦3,978,400,000", "Paid", "5 Sep 2026"]].forEach((r, i) => { const row = U.vi(t, "molecules/ipc-row", {status: r[0]}, "row-" + (i + 1)); ["ipc", "period", "valuation", "amount", null, "updated"].forEach((k, j) => { if (k) U.setText(row, k, r[j + 1]); }); const chip = penpotUtils.findShape(s => s.name.replace(/\s/g, "") === "chain", row); if (chip) U.setText(chip, "label", r[5]); });
  const vp = U.card(b, "valuation-panel", {x: 268, y: 530, w: 700, hs: "fix", gap: "spacing.12"});
  U.t(vp, "title", "Valuation V-15 · October 2026 · prefilled from verified measurement", "type.body-strong");
  [["Earthworks", "38,900 m³"], ["Bridges and culverts", "2 culverts"], ["Track laying", "5.8 km"], ["Stations", "Zaria platform slab"]].forEach(([k, v]) => U.kv(vp, k, v));
  const f = U.vi(vp, "atoms/input", {type: "file", state: "default"}, "valuation-file"); U.fill(f); U.setText(f, "label", "Attach valuation file"); U.setText(f, "value", "V-15 valuation October.xlsx · 640 KB"); U.setText(f, "hint", "The RE recommends it next, then the NRC engineer certifies");
  const sb = U.fx(vp, "submit-row", {justify: "end", fillW: true}); U.btn(sb, "primary", "Submit", "btn/submit");
  const sm = U.card(b, "summary", {x: 992, y: 530, w: 420, hs: "fix", gap: "spacing.8"});
  U.t(sm, "title", "Contract to date · Lot 2", "type.body-strong");
  [["Certified to date", "₦38.2bn"], ["Paid to date", "₦33.4bn"], ["Retention held", "₦1.91bn"], ["Advance recovered", "₦3.06bn of ₦6.1bn"], ["Next in the chain", "IPC 14 · Director, rail"]].forEach(([k, v]) => U.kv(sm, k, v));
  await U.flush(); return b.id;
};

  SB["w5-documents"] = async (x, y) => {
  const b = F.w5("w5-documents", x, y, 7);
  const h = F.sec(b, "Documents", "The register for Kaduna–Kano SGR, grouped by gate");
  U.btn(h, "primary", "Upload", "btn/upload");
  const col = U.fx(b, "register", {x: 268, y: 250, w: 1144, hs: "fix", dir: "column", align: "stretch", gap: "spacing.8"});
  [["Gate 1 Initiation", [["D01", "Concept note", "v3 · Engr. A. Bello · 12 Mar 2019"], ["D02", "Minister's approval minute", "v1 · Minister's office · 12 Mar 2019"]]], ["Gate 4 Funding approved", [["D07", "FEC approval extract", "v1 · G. Eze · 22 Jul 2020"], ["D08", "Loan agreement (China Exim)", "v2 · G. Eze · 22 Jul 2020"]]], ["Gate 6 BPP no objection", [["D11", "BPP Certificate of No Objection", "v1 · Procurement · 2 Dec 2020"]]], ["Gate 13 Certify and pay", [["V-14", "Valuation September 2026", "v1 · Li Wei · 20 Oct 2026"]]]].forEach(([g, docs]) => {
    U.t(col, "group/" + g, g, "type.overline", "color.text.secondary");
    docs.forEach(([c, t, m], i) => { const row = U.fx(col, "doc-" + c.toLowerCase(), {gap: "spacing.16", fillW: true}); const d = U.vi(row, "molecules/document-row", {}, "document"); d.resize(760, d.height); U.setText(d, "label", c); U.setText(d, "title", t); U.setText(d, "meta", m);
      const ac = U.fx(row, "actions", {gap: "spacing.16", fillW: true}); U.t(ac, "link/open", "Open", "type.label", "color.text.link"); U.t(ac, "link/link-to-gate", "Link to gate", "type.label", "color.text.link"); U.t(ac, "link/upload-new-version", "Upload new version", "type.label", "color.text.link"); });
  });
  await U.flush(); return b.id;
};

  SB["w5-people"] = async (x, y) => {
  const b = F.w5("w5-people", x, y, 10);
  const h = F.sec(b, "People", "Kaduna–Kano SGR · 11 members from 6 organisations · responsibilities come from the gate template");
  U.btn(h, "primary", "+ Add member", "btn/add-member");
  const m = U.card(b, "members", {x: 268, y: 250, w: 360, hs: "fix", gap: "spacing.8"}); U.t(m, "title", "Members", "type.body-strong");
  [["AB", "Engr. A. Bello", "Project manager · FMoT Rail", "0803 000 0000"], ["HD", "Engr. H. Danjuma", "Director, rail · FMoT Rail", "0805 220 1934"], ["FM", "Engr. F. Musa", "NRC project engineer", "0806 771 0452"], ["KA", "Engr. K. Adeyemi", "Consultant RE · TEAM", "0802 315 8890"], ["LW", "Li Wei", "Commercial manager · CCECC", "0809 004 2217"], ["MG", "Musa Garba", "Site manager, Lot 2 · CCECC", "0813 664 0128"], ["GE", "Grace Eze", "Finance officer · FMoT", "0803 558 6610"], ["BA", "Bola Ade", "Procurement officer · FMoT", "0807 112 3390"]].forEach(([i, n, r, p], k) => { const pl = U.vi(m, "molecules/person-line", {}, "member-" + (k + 1)); U.fill(pl); U.setText(pl, "initials", i); U.setText(pl, "name", n); U.setText(pl, "role", r); U.setText(pl, "number", p); });
  U.t(m, "more", "+ 3 more: N. Okoro (Legal), Emeka Nwosu (invited), China Exim viewers", "type.body-sm", "color.text.secondary", {fillW: true});
  U.vi(b, "organisms/responsibility-matrix", {scope: "project"}, "responsibility-matrix", [648, 250]);
  await U.flush(); storage.fixPeople(b); return b.id;
};

  SB["w5-land"] = async (x, y) => {
  const b = F.w5("w5-land", x, y, 8);
  const h = F.sec(b, "Land and community", "Gate 10 Right-of-way · blocked 41 days · compensation for km 140–152 not yet paid");
  U.btn(h, "primary", "+ Add parcel", "btn/add-parcel");
  const av = U.card(b, "section-availability", {x: 268, y: 250, w: 1144, hs: "fix", gap: "spacing.12"}); U.t(av, "title", "Section availability · km 0 to 203", "type.body-strong");
  const bar = U.fx(av, "bar", {h: 24, vs: "fix", gap: 2, fillW: true});
  [[140, "operational", "available"], [12, "stalled", "blocked"], [51, "operational", "available-2"]].forEach(([km, s, n]) => { const seg = U.fx(bar, n, {h: 24, vs: "fix", fill: `color.status.${s}.line`, radius: "radius.4"}); seg.resize(Math.round(km / 203 * 1100), 24); seg.flex.horizontalSizing = "fix"; });
  const ax = U.fx(av, "axis", {gap: 0, fillW: true}); [["km 0", 680], ["km 140", 60], ["km 152", 260], ["km 203", 80]].forEach(([l, w]) => U.t(ax, "tick-" + l.replace(" ", ""), l, "type.caption", "color.text.secondary", {w}));
  U.t(av, "legend", "Green: available to the contractor (191 km) · Red: blocked, compensation unpaid (12 km, Lot 3)", "type.body-sm", "color.text.secondary", {fillW: true});
  const pr = U.fx(b, "parcel-register", {x: 268, y: 430, w: 728, hs: "fix", dir: "column", align: "stretch"});
  U.t(pr, "title", "Parcel register · km 140 to 152 · showing 8 of 64", "type.body-strong").layoutChild.bottomMargin = 8;
  U.vi(pr, "molecules/parcel-row", {status: "header"}, "header");
  [["unpaid", "P-140-01", "km 140+050", "Malam Sani Garba", "₦4.2m", "₦0"], ["disputed", "P-140-02", "km 140+620", "Kofar Gabas community", "₦18.6m", "₦0"], ["paid", "P-141-03", "km 141+300", "Hajiya Amina Yusuf", "₦3.1m", "₦3.1m"], ["unpaid", "P-143-01", "km 143+900", "Unguwar Rimi farmers", "₦26.0m", "₦0"], ["unpaid", "P-146-02", "km 146+150", "Alhaji Bello Musa", "₦7.8m", "₦0"], ["queried", "P-148-04", "km 148+700", "Dan Kade community", "₦12.4m", "₦0"], ["paid", "P-150-01", "km 150+200", "Ibrahim Lawan", "₦2.9m", "₦2.9m"], ["unpaid", "P-151-02", "km 151+800", "Gidan Waya church", "₦5.5m", "₦0"]].forEach((r, i) => { const row = U.vi(pr, "molecules/parcel-row", {status: r[0]}, "row-" + (i + 1)); ["parcel", "chainage", "owner", "valuation", "paid"].forEach((k, j) => U.setText(row, k, r[j + 1])); });
  const gl = U.card(b, "grievance-log", {x: 1016, y: 430, w: 396, hs: "fix", gap: "spacing.8"}); U.t(gl, "title", "Grievance log · 3 open", "type.body-strong");
  [["G-031", "status-identified", "Open", "Kofar Gabas community disputes the farmland valuation", "km 140+620 · 12 days"], ["G-029", "status-stalled", "Escalated", "Crops destroyed before compensation was paid", "km 143+900 · 20 days"], ["G-027", "status-identified", "Open", "Access road to the market cut by the embankment", "km 145+400 · 26 days"], ["G-022", "status-operational", "Resolved", "Wrong name on the compensation list", "km 141+300 · closed 3 Oct"]].forEach(([ref, chip, lbl, t, m], i) => { const it = U.fx(gl, "grievance-" + (i + 1), {dir: "column", align: "start", gap: "spacing.4", px: "spacing.12", py: "spacing.12", fill: "color.surface.page", stroke: "color.border.subtle", radius: "radius.8", fillW: true}); const hr = U.fx(it, "head", {gap: "spacing.8", fillW: true}); U.t(hr, "ref", ref, "type.label", "color.text.primary", {fillW: true}); U.chip(hr, chip, lbl, "status"); U.t(it, "text", t, "type.body-sm", "color.text.primary", {fillW: true}); U.t(it, "meta", m, "type.caption", "color.text.secondary"); });
  await U.flush(); storage.queried(b); return b.id;
};

  SB["w5-project-view-draft"] = async (x, y) => {
  const b = F.w5("w5-project-view-draft", x, y, 0, {draft: true});
  const bn = U.fx(b, "draft-banner", {x: 268, y: 183, w: 1144, h: 64, hs: "fix", vs: "fix", px: "spacing.16", gap: "spacing.16", fill: "color.surface.raised", stroke: "color.status.draft.line", dash: true, radius: "radius.8"});
  U.chip(bn, "status-draft", "Draft", "chip");
  const bt = U.fx(bn, "text", {dir: "column", align: "start", fillW: true}); U.t(bt, "title", "Not published · publish pending", "type.body-strong"); U.t(bt, "detail", "Only you and the Director see this page. Engr. H. Danjuma has the Publish project task since today 09:40.", "type.body-sm", "color.text.secondary", {fillW: true});
  U.t(bn, "link/back-to-review", "Back to review →", "type.label", "color.text.link");
  const g = U.card(b, "gates", {x: 268, y: 263, w: 1144, hs: "fix", gap: "spacing.8"}); U.t(g, "title", "Gates · external loan template", "type.overline", "color.text.secondary"); U.vi(g, "molecules/gate-strip", {example: "new-project"}, "gate-strip"); U.t(g, "caption", "Gate 1 awaiting the Director · gates 2 to 15 not started", "type.body-sm", "color.text.secondary");
  const c = U.card(b, "corridor", {x: 268, y: 420, w: 560, hs: "fix", gap: "spacing.8"}); U.t(c, "title", "Corridor (draft)", "type.body-strong");
  const mp = penpot.createBoard(); c.appendChild(mp); mp.name = "map"; mp.resize(528, 300); mp.layoutChild.horizontalSizing = "fill"; U.paint(mp, {fill: "color.surface.muted", radius: "radius.8"}); mp.clipContent = true;
  U.poly(mp, "line", [[80, 250], [250, 150], [450, 60]], "color.status.draft.line", "map.corridor.width", {dash: true});
  [["kano", 80, 250, "Kano 0+000", 94, 248], ["katsina", 250, 150, "Katsina 190+000", 264, 148], ["maradi", 450, 60, "Maradi 393+000", 330, 30]].forEach(([k, px, py, l, lx, ly]) => { U.ellipse(mp, "station-" + k, px, py, 12, {fill: "map.station.fill", stroke: "map.station.stroke", sw: 2}); U.text(mp, "label-" + k, lx, ly, l, "type.caption", "map.label.fg"); });
  const lg = U.vi(c, "molecules/legend-row", {status: "draft"}, "legend"); U.setText(lg, "label", "Draft corridor · visible to you and the Director");
  const pr = U.card(b, "progress", {x: 852, y: 420, w: 560, hs: "fix", gap: "spacing.8"}); U.t(pr, "title", "Progress", "type.body-strong"); U.t(pr, "summary", "Physical 0% · Financial 0%", "type.numeric");
  ["Earthworks", "Structures", "Track laying"].forEach(n => { const d = U.vi(pr, "molecules/discipline-bar", {}, "discipline-" + n.toLowerCase().replace(/ /g, "-")); U.fill(d); U.setText(d, "label", n); U.setText(d, "value", "0%"); const fb = penpotUtils.findShape(s => s.name.replace(/\s/g, "") === "fill", d); if (fb) fb.resize(2, fb.height); });
  U.t(pr, "note", "Progress starts after mobilisation (gate 11).", "type.body-sm", "color.text.secondary");
  const ph = U.card(b, "photos", {x: 852, y: 660, w: 560, hs: "fix", gap: "spacing.8"}); U.t(ph, "title", "Latest verified photos", "type.body-strong");
  const em = U.fx(ph, "empty", {h: 80, vs: "fix", justify: "center", gap: "spacing.8", fill: "color.surface.muted", stroke: "color.border.strong", dash: true, radius: "radius.8", fillW: true}); U.icon(em, "photo", "color.text.secondary"); U.t(em, "label", "No photos yet · they start when lots are created at gate 8", "type.body-sm", "color.text.secondary");
  const wp = U.card(b, "on-publishing", {x: 268, y: 856, w: 1144, hs: "fix", gap: "spacing.4", fill: "color.surface.muted", shadow: null}); U.t(wp, "title", "What publishing does", "type.body-strong"); U.t(wp, "text", "Confirms gate 1 with the Director's PIN · draws the corridor as Identified for every member · opens gates 2 to 15; the PS and the Minister can see the project from then on.", "type.body", "color.text.primary", {fillW: true});
  storage.draftChip(b); await U.flush(); return b.id;
};

  SB["w6-create-project"] = async (x, y) => {
  const b = F.w6("w6-create-project", x, y, 0);
  F.stepTitle(b, "1. Basics", "Name the project and set the two ends of the line. States crossed fill in automatically.");
  const f = F.col(b, "form", 320, 236, 540, {gap: "spacing.16"});
  F.input(f, "text", "Project name", "Kano–Maradi Standard Gauge Railway", "As it will appear on the map", "name");
  const r1 = U.fx(f, "row-type", {gap: "spacing.16", fillW: true}); F.input(r1, "date", "Type", "New line", "New line, rehabilitation, extension, station", "type", 262); F.input(r1, "date", "Gauge", "Standard (1,435 mm)", " ", "gauge", 262);
  const r2 = U.fx(f, "row-towns", {gap: "spacing.16", fillW: true}); F.input(r2, "date", "Start town", "Kano", " ", "start", 262); F.input(r2, "date", "End town", "Maradi (Niger border)", " ", "end", 262);
  U.t(f, "states-label", "States crossed · filled from the line", "type.label");
  const st = U.fx(f, "states", {gap: "spacing.8", fillW: true}); ["Kano", "Jigawa", "Katsina"].forEach(s => U.chip(st, "filter", s, "state-" + s.toLowerCase()));
  F.input(f, "date", "Origin reference", "Master plan", "Master plan, directive, state request, unsolicited proposal", "origin");
  F.input(f, "file", "Concept note (D01)", "Kano-Maradi concept note v3.pdf · 2.4 MB", "Stored as D01 against gate 1", "concept-note");
  F.w6map(b, "placeholder", "A dashed placeholder line between Kano and Maradi");
  await U.flush(); return b.id;
};

  SB["w6-funding-route"] = async (x, y) => {
  const b = F.w6("w6-funding-route", x, y, 1);
  F.stepTitle(b, "2. Funding route", "The route decides the gate template. You can change it until the project is published.");
  const f = F.col(b, "form", 320, 236, 540, {gap: "spacing.16"});
  [[["Budget", "Federal budget appropriation · 15 gates, gate 4 is National Assembly approval", "no"], ["External loan", "China Exim or other lender · gate 4 needs FEC, Senate, House and lender approval", "yes"]], [["PPP", "Private finance · ICRC certificates, then FEC or the Project Approval Board", "no"], ["State or private", "A state or private sponsor · ministry approvals only", "no"]]].forEach((row, i) => { const r = U.fx(f, "row-" + (i + 1), {gap: "spacing.16", fillW: true, align: "stretch"}); row.forEach(([t, d, s]) => { const tile = U.vi(r, "atoms/radio-tile", {selected: s}, "route-" + t.toLowerCase().replace(/ /g, "-")); tile.resize(262, tile.height); U.setText(tile, "title", t); U.setText(tile, "description", d); }); });
  const gp = U.card(f, "template-preview", {fillW: true, gap: "spacing.8"}); U.t(gp, "title", "Gate template preview · external loan · 15 gates", "type.body-strong"); const gs = U.vi(gp, "molecules/gate-strip", {example: "new-project"}, "gate-strip"); gs.resize(508, gs.height); U.t(gp, "note", "Gates 9 and 10 run in parallel with 5 to 8. Approve-in-system and attach-evidence gates come from this template.", "type.body-sm", "color.text.secondary", {fillW: true});
  F.w6map(b, "placeholder", "Nothing new on the map at this step");
  await U.flush(); storage.fixFunding(b); return b.id;
};

  SB["w6-geography"] = async (x, y) => {
  const b = F.w6("w6-geography", x, y, 2);
  F.stepTitle(b, "3. Geography", "Upload the alignment (KMZ or shapefile) or keep the placeholder. The NRC engineer can check it.");
  const f = F.col(b, "form", 320, 236, 540, {gap: "spacing.16"});
  F.input(f, "file", "Alignment file", "Kano–Maradi.kmz · parsed · 393 km · 688 points", "Kano, Jigawa and Katsina states · Replace", "alignment");
  F.input(f, "number", "Expected length", "393", "From the file; edit only if the file is incomplete", "length", 262);
  const st = U.card(f, "stations", {fillW: true, gap: "spacing.4"}); U.t(st, "title", "Stations", "type.body-strong");
  [["Kano", "km 0+000 · terminal"], ["Katsina", "km 190+000 · station"], ["Maradi", "km 393+000 · terminal (Niger border)"]].forEach(([k, v]) => U.kv(st, k, v));
  U.t(st, "link/add-station", "+ Add station", "type.label", "color.text.link");
  const ck = U.vi(f, "atoms/checkbox", {checked: "yes", disabled: "no"}, "ask-nrc"); U.setText(ck, "label", "Ask the NRC engineer to check the alignment (optional, never blocks)");
  F.w6map(b, "real", "Real alignment from Kano–Maradi.kmz with three stations");
  await U.flush(); return b.id;
};

  SB["w6-people"] = async (x, y) => {
  const b = F.w6("w6-people", x, y, 3);
  F.stepTitle(b, "4. People", "Who runs the project. The person in charge shows on the map's hover card.");
  const f = F.col(b, "form", 320, 236, 764, {gap: "spacing.12"});
  const pr = U.fx(f, "people", {gap: "spacing.16", fillW: true, align: "stretch"});
  [["AB", "Engr. A. Bello", "Project manager · owner (you)", "0803 000 0000"], ["HD", "Engr. H. Danjuma", "Director, rail · automatic, locked", "0805 220 1934"]].forEach(([i, n, r, p], k) => { const c = U.card(pr, "person-" + (k + 1), {fillW: true}); const pl = U.vi(c, "molecules/person-line", {}, "person-line"); U.fill(pl); U.setText(pl, "initials", i); U.setText(pl, "name", n); U.setText(pl, "role", r); U.setText(pl, "number", p); });
  U.vi(f, "organisms/responsibility-matrix", {scope: "template"}, "responsibility-matrix");
  const R = F.col(b, "side", 1104, 236, 312, {gap: "spacing.16"});
  F.input(R, "date", "NRC project engineer", "Engr. F. Musa · NRC Kano district", "Picked from the NRC list", "nrc-engineer");
  const nt = U.card(R, "later-note", {fill: "color.surface.muted", shadow: null, fillW: true}); U.t(nt, "text", "Consultant and contractor organisations are added at gate 8, when the lots are created. The Director confirms external organisations.", "type.body-sm", "color.text.primary", {fillW: true});
  const hv = U.card(R, "hover-card-preview", {fillW: true, gap: "spacing.4"}); U.t(hv, "label", "Hover card on the map", "type.overline", "color.text.secondary"); U.t(hv, "name", "Kano–Maradi SGR", "type.body-strong"); U.t(hv, "status", "Draft · 0% complete", "type.body-sm", "color.text.secondary"); U.t(hv, "in-charge", "In charge: Engr. A. Bello · 0803 000 0000", "type.body-sm");
  await U.flush(); storage.fixRowAuto(penpotUtils.findShape(s => s.name === "people", b)); return b.id;
};

  SB["w6-documents"] = async (x, y) => {
  const b = F.w6("w6-documents", x, y, 4);
  F.stepTitle(b, "5. Documents", "Attach the concept note and the Minister's approval minute, then mark gate 1 passed.");
  const f = F.col(b, "form", 320, 236, 540, {gap: "spacing.12"});
  [["D01", "Concept note", "Kano-Maradi concept note v3.pdf · 2.4 MB · attached"], ["D02", "Minister's approval minute", "Minute 2026-114.pdf · 640 KB · attached"]].forEach(([c, t, m]) => { const d = U.vi(f, "molecules/document-row", {}, "doc-" + c.toLowerCase()); U.fill(d); U.setText(d, "label", c); U.setText(d, "title", t); U.setText(d, "meta", m); });
  const g1 = U.card(f, "gate-1", {fillW: true}); const ck = U.vi(g1, "atoms/checkbox", {checked: "yes", disabled: "no"}, "mark-gate-1"); U.setText(ck, "label", "Mark gate 1 passed");
  F.input(g1, "date", "Date passed", "21 Oct 2026", "The date on the Minister's minute", "gate-1-date", 262);
  const nt = U.card(f, "note", {fill: "color.surface.muted", shadow: null, fillW: true}); U.t(nt, "text", "D02 is evidence for gate 1, not an in-system approval. The Director confirms gate 1 when publishing.", "type.body-sm", "color.text.primary", {fillW: true});
  F.w6map(b, "real", "The corridor will show as Identified once published");
  await U.flush(); return b.id;
};

  SB["w6-publish"] = async (x, y) => {
  const b = F.w6("w6-publish", x, y, 5, "Send for publishing");
  F.stepTitle(b, "6. Review and publish", "Read the whole project once. Edit any section or preview it, then send it to the Director.");
  const pv = U.fx(b, "previews", {x: 1000, y: 168, w: 416, hs: "fix", gap: "spacing.12", justify: "end"});
  U.btn(pv, "secondary", "Preview on map", "btn/preview-map"); U.btn(pv, "secondary", "Preview project page", "btn/preview-page");
  const L = F.col(b, "recap-left", 320, 236, 540, {gap: "spacing.12"}), R = F.col(b, "recap-right", 880, 236, 536, {gap: "spacing.12"});
  F.RECAP.slice(0, 3).forEach(([t, rows], i) => { const r = F.recap(L, t, rows, true, "recap-" + (i + 1)); const e = penpotUtils.findShape(s => s.name === "link/edit", r); if (e) e.name = "link/edit-" + (i + 1); });
  F.RECAP.slice(3).forEach(([t, rows], i) => { const r = F.recap(R, t, rows, true, "recap-" + (i + 4)); const e = penpotUtils.findShape(s => s.name === "link/edit", r); if (e) e.name = "link/edit-" + (i + 4); });
  F.who(R, true);
  await U.flush(); storage.fixPublish(b); return b.id;
};

  SB["s2-users"] = async (x, y) => {
  const b = F.admin("s2-users", x, y, 1);
  F.adminHead(b, "Users", "214 people · 12 invited · 3 locked", "+ Add person", "add-person");
  F.filters(b, ["Organisation", "Role"]);
  F.usersTable(b, false);
  const dr = U.vi(b, "organisms/drawer", {}, "drawer", [960, 68]); dr.resize(480, 956);
  ["cancel", "send-invite"].forEach(k => { const s = penpotUtils.findShape(x => x.name.replace(/\s/g, "") === k, dr); if (s) s.name = "btn/" + k; });
  const cl = penpotUtils.findShape(s => s.type === "text" && s.characters === "✕", dr); if (cl) cl.name = "link/close";
  await U.flush(); return b.id;
};

  SB["s2-users-invited"] = async (x, y) => {
  const b = F.admin("s2-users-invited", x, y, 1);
  F.adminHead(b, "Users", "215 people · 13 invited · 3 locked", "+ Add person", "add-person");
  F.filters(b, ["Organisation", "Role", "Status", "Project"]);
  F.usersTable(b, true);
  const ts = U.vi(b, "atoms/toast", {kind: "info"}, "toast", [480, 940]); U.setText(ts, "message", "Invite sent; the Director will confirm"); U.setText(ts, "action", "View task");
  const ho = U.vi(b, "molecules/handoff-chip", {}, "handoff/next-commercial-manager", [960, 948]); U.setText(ho, "label", "Next: a commercial manager accepts on the web");
  await U.flush(); return b.id;
};

  SB["s1-organisations"] = async (x, y) => {
  const b = F.admin("s1-organisations", x, y, 0);
  F.adminHead(b, "Organisations", "38 organisations · 2 external awaiting the Director", "+ Add organisation", "add-organisation");
  F.filters(b, ["Type", "Status"]);
  const t = U.fx(b, "organisations-table", {x: 264, y: 236, w: 1000, hs: "fix", dir: "column", align: "stretch"});
  const hd = U.vi(t, "molecules/admin-row", {status: "header"}, "header"); [["person", "Organisation"], ["organisation", "Type and projects"], ["last-login", "People"], ["last-upload", "Confirmed by"], ["pending", "Tasks"]].forEach(([k, v]) => { const s = penpotUtils.findShape(x => x.type === "text" && x.name.replace(/\s/g, "") === k, hd); if (s) s.characters = v; });
  [["active", "FMoT Rail directorate", "Ministry unit", "Ministry unit", "All rail projects", "Internal", "24", "—", "9"], ["active", "NRC", "Agency", "Agency", "All corridors", "Internal", "31", "—", "4"], ["active", "TEAM Consultants", "Supervising consultant", "Consultant", "Kaduna–Kano · Lots 1 to 3", "Confirmed", "12", "H. Danjuma", "14"], ["active", "CCECC", "Contractor", "Contractor", "Kaduna–Kano · Lots 1 to 3", "Confirmed", "46", "H. Danjuma", "3"], ["active", "Mota-Engil", "Contractor", "Contractor", "Port Harcourt–Maiduguri · Lot 2", "Confirmed", "18", "H. Danjuma", "0"], ["active", "China Exim Bank", "Lender", "Lender", "Kaduna–Kano (read-only)", "Confirmed", "2", "H. Danjuma", "0"], ["active", "Auditor-General", "Oversight", "Oversight", "All projects (audit log)", "Confirmed", "4", "H. Danjuma", "0"], ["invited-new", "Eastern Rail JV", "Contractor · new", "Contractor", "Port Harcourt–Maiduguri · Lot 3", "Awaiting Director", "0", "—", "0"]].forEach((o, i) => F.arow(t, o[0], [o[1], o[2], o[3], o[4], o[5], o[6], o[7], o[8]], "row-" + (i + 1)));
  const dr = U.vi(b, "organisms/drawer", {}, "drawer", [960, 68]); dr.resize(480, 956);
  U.setText(dr, "title", "Add organisation");
  [["Name", "Eastern Rail JV", "As registered with the CAC"], ["Type", "Contractor", "The type decides which roles its people can hold"], ["CAC registration number", "RC 1984 552", "External organisations need the Director to confirm them"]].forEach(([l, v, h], i) => { const f = penpotUtils.findShape(s => s.name.replace(/\s/g, "") === "field-" + (i + 1), dr); U.setText(f, "label", l); U.setText(f, "value", v); U.setText(f, "hint", h); });
  const sv = penpotUtils.findShape(s => s.name.replace(/\s/g, "") === "send-invite", dr); U.setText(sv, "label", "Save and add people"); sv.name = "btn/save-add-people";
  const cn = penpotUtils.findShape(s => s.name.replace(/\s/g, "") === "cancel", dr); cn.name = "btn/cancel";
  await U.flush(); storage.fixOrgs(b); return b.id;
};

  SB["w1-sign-in"] = async (x, y) => {
  const b = F.signedOut("w1-sign-in", x, y);
  const c = U.card(b, "sign-in-card", {x: 500, y: 112, w: 440, hs: "fix", px: "spacing.32", py: "spacing.32", gap: "spacing.16", shadow: "elevation.2"});
  U.t(c, "title", "Sign in", "type.headline"); U.t(c, "intro", "Phone number, then the SMS code. After the first time, just your PIN.", "type.body", "color.text.secondary", {fillW: true});
  F.input(c, "text", "Phone number", "0803 412 7781", " ", "phone");
  const sms = F.input(c, "number", "SMS code", "4 8 1 9 0 2", "Sent at 08:58 · Resend code", "sms-code"); U.setText(sms, "unit", " ");
  F.pinRow(c, "PIN", 3);
  const kp = U.vi(c, "molecules/keypad", {}, "keypad"); U.fill(kp);
  const en = U.btn(c, "primary", "Enter", "btn/enter", "large"); U.fill(en);
  U.t(c, "link/call-support", "Trouble signing in? Call support · 0700 RAIL 000", "type.label", "color.text.link", {fillW: true}).align = "center";
  U.t(c, "legal", "Use of this system is recorded under the Nigeria Data Protection Act.", "type.caption", "color.text.secondary", {fillW: true}).align = "center";
  await U.flush(); return b.id;
};

  SB["w2-accept-invite"] = async (x, y) => {
  const b = F.signedOut("w2-accept-invite", x, y);
  const c = U.card(b, "accept-card", {x: 480, y: 100, w: 480, hs: "fix", px: "spacing.32", py: "spacing.24", gap: "spacing.12", shadow: "elevation.2"});
  U.t(c, "title", "Accept your invitation", "type.headline"); U.t(c, "intro", "CCECC asked for this account and the Director, rail confirmed it on 29 Oct 2026.", "type.body", "color.text.secondary", {fillW: true});
  const s = U.card(c, "summary", {fill: "color.surface.muted", shadow: null, gap: "spacing.4", fillW: true});
  [["Name", "Zhang Min"], ["Role", "Contractor commercial manager"], ["Organisation", "CCECC"], ["Projects", "Kaduna–Kano SGR · Lots 1 to 3"]].forEach(([k, v]) => U.kv(s, k, v));
  F.input(c, "text", "Phone number", "0809 118 4420 · from the invite", " ", "phone");
  const sms = F.input(c, "number", "SMS code", "4 8 1 9 0 2", "Sent at 10:31 · valid for 15 minutes", "sms-code"); U.setText(sms, "unit", " ");
  F.pinRow(c, "Set a 4-digit PIN", 2);
  const ck = U.vi(c, "atoms/checkbox", {checked: "yes", disabled: "no"}, "terms"); U.setText(ck, "label", "I accept the terms of use; my actions are recorded");
  const ac = U.btn(c, "primary", "Accept and sign in", "btn/accept", "large"); U.fill(ac);
  U.t(c, "field-note", "Site staff use the phone app instead: the invite SMS opens it (M1).", "type.body-sm", "color.text.secondary", {fillW: true});
  await U.flush(); return b.id;
};

  SB["w8-portfolio"] = async (x, y) => {
  const b = F.web("w8-portfolio", x, y);
  const h = U.fx(b, "head", {x: 40, y: 92, w: 1360, hs: "fix", gap: "spacing.16"}); const ht = U.fx(h, "text", {dir: "column", align: "start", fillW: true}); U.t(ht, "title", "Portfolio", "type.headline"); U.t(ht, "subtitle", "All published projects · sorted by days at gate · drafts are not shown", "type.body-sm", "color.text.secondary"); U.btn(h, "secondary", "Export", "btn/export");
  const fl = U.fx(b, "filters", {x: 40, y: 168, gap: "spacing.8"}); ["Status", "Funding route", "Lender", "State"].forEach(l => U.chip(fl, "filter", l + " ▾", "filter-" + l.toLowerCase()));
  const t = U.fx(b, "portfolio-table", {x: 40, y: 212, w: 1360, hs: "fix", dir: "column", align: "stretch"});
  U.vi(t, "molecules/portfolio-row", {status: "header"}, "header");
  [["stalled", "Port Harcourt–Maiduguri", "Stalled", "10 Right-of-way", "41", "41%", "38%", "Compensation evidence", "State governors"], ["planned", "Ibadan–Abuja SGR", "Contracted", "9 Environment", "37", "4%", "9%", "EIA certificate", "FMEnv"], ["under-construction", "Kaduna–Kano SGR", "Under construction", "13 Certify and pay", "12", "68%", "71%", "IPC 14 approval", "Director, rail"], ["planned", "Lagos–Calabar coastal", "Funded", "6 BPP no objection", "9", "0%", "0%", "BPP certificate", "BPP"], ["planned", "Abuja–Itakpe extension", "Identified", "2 Feasibility", "6", "0%", "0%", "Feasibility report", "NRC"], ["operational", "Lagos–Ibadan SGR", "Operational", "15 Handover", "3", "100%", "97%", "Defects close-out", "Auditor-General"], ["operational", "Abuja–Kaduna SGR", "Operational", "15 Handover", "—", "100%", "100%", "Final accounts", "Auditor-General"], ["operational", "Warri–Itakpe SGR", "Operational", "Closed", "—", "100%", "100%", "—", "—"]].forEach((r, i) => { const row = U.vi(t, "molecules/portfolio-row", {status: r[0]}, "row-" + (i + 1)); ["project", null, "gate", "days", "physical", "financial", "next", "waiting"].forEach((k, j) => { if (k) U.setText(row, k, r[j + 1]); }); const chip = penpotUtils.findShape(s => s.name.replace(/\s/g, "") === "status", row); if (chip) U.setText(chip, "label", r[2]); });
  const chart = (name, title, x0, vals, plan, unit) => { const c = U.card(b, name, {x: x0, y: 700, w: 670, h: 300, hs: "fix", vs: "fix", gap: "spacing.8"}); U.t(c, "title", title, "type.body-strong"); const area = penpot.createBoard(); c.appendChild(area); area.name = "plot"; area.resize(638, 200); area.layoutChild.horizontalSizing = "fill"; area.fills = []; const mx = Math.max(...vals, ...(plan || [0])); vals.forEach((v, i) => { const h = Math.round(v / mx * 170); U.rect(area, "bar-" + (i + 1), 8 + i * 52, 180 - h, 28, h, {fill: "color.brand.primary", radius: "radius.4"}); if (plan) { const ph = Math.round(plan[i] / mx * 170); U.rect(area, "plan-" + (i + 1), 38 + i * 52, 180 - ph, 8, ph, {fill: "color.border.strong", radius: "radius.4"}); } }); ["N", "D", "J", "F", "M", "A", "M", "J", "J", "A", "S", "O"].forEach((m, i) => U.text(area, "month-" + (i + 1), 14 + i * 52, 182, m, "type.caption", "color.text.secondary")); U.t(c, "legend", unit, "type.caption", "color.text.secondary"); return c; };
  chart("chart-track-km", "Track-km laid per month · all projects", 40, [4.2, 5.1, 3.8, 6.0, 6.4, 5.5, 2.1, 1.8, 4.9, 6.2, 6.4, 5.8], null, "Navy bars: km of track laid · last 12 months");
  chart("chart-spend", "Spend against plan · ₦bn per month", 730, [9, 11, 10, 12, 14, 13, 8, 7, 12, 15, 16, 14], [10, 12, 12, 13, 13, 14, 13, 12, 13, 14, 15, 15], "Navy: actual · grey: plan");
  await U.flush(); return b.id;
};

  SB["m1-onboarding"] = async (x, y) => {
  const b = F.phone("m1-onboarding", x, y);
  const c = F.pcol(b, 56, {gap: "spacing.12"});
  U.t(c, "welcome", "Welcome, Emeka", "type.phone.title"); U.t(c, "role", "Contractor site manager · CCECC · Kaduna–Kano Lot 2", "type.phone.caption", "color.text.secondary", {fillW: true});
  const sms = F.pinput(c, "number", "SMS code", "4 8 1 9 0 2", "From the invite SMS", "sms-code"); U.setText(sms, "unit", " ");
  F.pinRow(c, "Set a 4-digit PIN", 2);
  const kp = U.vi(c, "molecules/keypad", {}, "keypad"); U.fill(kp);
  const lg = U.fx(c, "language", {gap: "spacing.8", fillW: true}); ["English", "Hausa", "Yorùbá", "Igbo"].forEach((l, i) => U.chip(lg, i ? "filter" : "filter-selected", l, "lang-" + l.toLowerCase()));
  const tg = U.vi(c, "atoms/toggle", {on: "no"}, "large-text"); U.setText(tg, "label", "Large text");
  F.pbtn(c, "primary", "Start", "btn/start");
  F.homeBar(b); await U.flush(); storage.phoneChips(b); return b.id;
};

  SB["m4-report"] = async (x, y) => {
  const b = F.phone("m4-report", x, y); F.ptop(b, "← Home", "Today's report");
  const c = F.pcol(b, 150, {gap: "spacing.12"});
  U.t(c, "prefill", "Prefilled from yesterday · Lot 2 · 29 Oct 2026", "type.phone.caption", "color.text.secondary", {fillW: true});
  F.pinput(c, "number", "Workers on site", "46", "Yesterday: 44", "workers");
  U.t(c, "machines-label", "Machines working", "type.phone.label");
  ["Excavator EX-04", "Grader GR-02", "Roller RL-07"].forEach((m, i) => { const ck = U.vi(c, "atoms/checkbox", {checked: i < 2 ? "yes" : "no", disabled: "no"}, "machine-" + (i + 1)); U.setText(ck, "label", m); });
  U.t(c, "weather-label", "Weather", "type.phone.label");
  const w = U.fx(c, "weather", {gap: "spacing.8", fillW: true}); [["Dry", "filter-selected"], ["Rain", "filter"], ["Storm", "filter"]].forEach(([l, k]) => U.chip(w, k, l, "weather-" + l.toLowerCase()));
  U.t(c, "problem-label", "Any problem today?", "type.phone.label");
  const pr = U.fx(c, "problem", {gap: "spacing.8", fillW: true}); U.chip(pr, "filter-selected", "No", "problem-no"); U.chip(pr, "filter", "Yes", "problem-yes");
  const vn = F.pbtn(c, "secondary", "Hold to add a voice note", "btn/voice-note");
  F.pbtn(c, "primary", "Send report", "btn/send");
  F.homeBar(b); await U.flush(); storage.phoneChips(b); return b.id;
};

  SB["m5-milestones"] = async (x, y) => {
  const b = F.phone("m5-milestones", x, y); F.ptop(b, "← Home", "Milestones");
  const c = F.pcol(b, 150, {gap: "spacing.8"});
  U.t(c, "subtitle", "Lot 2 · Kaduna–Kano SGR · by chainage", "type.phone.caption", "color.text.secondary");
  [["verified", "Culvert C-14", "km 98+200"], ["claimed", "Embankment section 12", "km 104+800"]].forEach(([s, n, k], i) => { const r = U.vi(c, "molecules/milestone-row", {status: s}, "milestone-" + (i + 1)); U.fill(r); U.setText(r, "name", n); U.setText(r, "chainage", k); });
  const ex = U.card(c, "expanded", {fillW: true, gap: "spacing.8", stroke: "color.interactive.selected.border"}); const r3 = U.vi(ex, "molecules/milestone-row", {status: "open"}, "milestone-3"); U.fill(r3); r3.strokes = []; U.setText(r3, "name", "Culvert C-15"); U.setText(r3, "chainage", "km 106+000");
  U.t(ex, "how", "Mark complete takes two photos: one wide, one close. The RE verifies it on site.", "type.phone.caption", "color.text.secondary", {fillW: true});
  F.pbtn(ex, "primary", "Mark complete", "btn/mark-complete");
  [["open", "Bridge B-3 deck", "km 112+500"], ["not-started", "Earthworks to formation", "km 120+000"]].forEach(([s, n, k], i) => { const r = U.vi(c, "molecules/milestone-row", {status: s}, "milestone-" + (i + 4)); U.fill(r); U.setText(r, "name", n); U.setText(r, "chainage", k); });
  F.homeBar(b); await U.flush(); return b.id;
};

  SB["m6-incident"] = async (x, y) => {
  const b = F.phone("m6-incident", x, y); F.ptop(b, "← Home", "Report incident");
  const c = F.pcol(b, 150, {gap: "spacing.12"});
  U.t(c, "subtitle", "Km 104+350 · location locked · 10:52", "type.phone.caption", "color.text.secondary");
  [["Accident", "Someone hurt or a vehicle damaged", "yes"], ["Security", "Theft, threat or armed group", "no"], ["Community", "Protest, blockade or complaint", "no"], ["Equipment", "Breakdown or damage", "no"]].forEach(([t, d, s]) => { const r = U.vi(c, "atoms/radio-tile", {selected: s}, "type-" + t.toLowerCase()); U.fill(r); U.setText(r, "title", t); U.setText(r, "description", d); });
  const ab = U.fx(c, "attachments", {gap: "spacing.12", fillW: true}); const p1 = F.pbtn(ab, "secondary", "Add photo", "btn/photo"); const p2 = F.pbtn(ab, "secondary", "Voice note", "btn/voice");
  U.t(c, "notified", "The RE, the project manager and the security desk are told at once.", "type.phone.caption", "color.text.secondary", {fillW: true});
  F.pbtn(c, "danger", "Send incident", "btn/send");
  F.homeBar(b); await U.flush(); return b.id;
};

  SB["m7-sent-back"] = async (x, y) => {
  const b = F.phone("m7-sent-back", x, y); F.ptop(b, "← Home", "Sent back · 2");
  const c = F.pcol(b, 150, {gap: "spacing.12"});
  U.t(c, "subtitle", "The RE returned these. Take them again.", "type.phone.caption", "color.text.secondary", {fillW: true});
  [["km 103+900 · Earthworks", "Photo unclear", "Engr. K. Adeyemi · yesterday 16:10"], ["km 104+350 · Bridge or culvert", "Wrong chainage", "Engr. K. Adeyemi · yesterday 16:12"]].forEach(([t, reason, who], i) => {
    const cd = U.card(c, "item-" + (i + 1), {fillW: true, gap: "spacing.8"});
    const r = U.vi(cd, "molecules/outbox-row", {status: "sent-back"}, "row"); U.fill(r); r.strokes = []; U.setText(r, "title", t); U.setText(r, "meta", who);
    U.t(cd, "reason", "Reason: " + reason, "type.phone.body-strong", "color.text.error", {fillW: true});
    F.pbtn(cd, "primary", "Retake", "btn/retake-" + (i + 1));
  });
  F.homeBar(b); await U.flush(); return b.id;
};

  SB["m8-outbox"] = async (x, y) => {
  const b = F.phone("m8-outbox", x, y); F.ptop(b, "← Home", "Your photos");
  const c = F.pcol(b, 150, {gap: "spacing.8"});
  U.t(c, "subtitle", "Lot 2 · last sync just now", "type.phone.caption", "color.text.secondary");
  const lad = U.card(c, "status-ladder", {fillW: true, gap: "spacing.4", fill: "color.surface.muted", shadow: null}); U.t(lad, "title", "What each status means", "type.phone.label");
  [["queued", "On this phone; sends when there is signal"], ["sent", "On the server; checks running"], ["checked", "Waiting for the resident engineer"], ["verified", "Counts toward progress and payment"], ["sent-back", "Returned with a reason; take it again"]].forEach(([s, t]) => { const r = U.fx(lad, "ladder-" + s, {gap: "spacing.8", fillW: true}); U.vi(r, "molecules/phone-sync-chip", {status: s}, "chip"); U.t(r, "meaning", t, "type.phone.caption", "color.text.primary", {fillW: true}); });
  ["queued", "sent", "checked", "verified"].forEach((s, i) => { const r = U.vi(c, "molecules/outbox-row", {status: s}, "item-" + (i + 1)); U.fill(r); });
  F.homeBar(b); storage.fixOutbox(b); await U.flush(); return b.id;
};

  SB["m9-re-home"] = async (x, y) => {
  const b = F.phone("m9-re-home", x, y);
  const c = F.pcol(b, 52, {gap: "spacing.12"});
  const hd = U.fx(c, "header", {dir: "column", align: "start", fillW: true}); U.t(hd, "greeting", "Good morning, Engr. Adeyemi", "type.phone.title"); U.t(hd, "role", "Resident engineer · TEAM Consultants · Lots 1 to 3", "type.phone.caption", "color.text.secondary", {fillW: true});
  const sw = U.vi(c, "organisms/re-swipe-card", {}, "swipe-card"); U.fill(sw);
  ["send-back", "verify"].forEach(k => { const s = penpotUtils.findShape(x => x.name.replace(/\s/g, "") === k, sw); if (s) s.name = "btn/" + k; });
  const ms = U.vi(c, "molecules/milestone-row", {status: "claimed"}, "milestone"); U.fill(ms); U.setText(ms, "name", "Embankment section 12 · verify on site");
  const ts = U.card(c, "tests", {fillW: true, gap: "spacing.4"}); U.t(ts, "title", "Tests witnessed this week", "type.phone.body-strong"); U.t(ts, "next", "Concrete cubes · culvert C-15 · Thu 10:00", "type.phone.caption", "color.text.primary", {fillW: true});
  const ho = U.vi(c, "molecules/handoff-chip", {}, "handoff/next-valuation"); U.setText(ho, "label", "Next: valuation");
  F.homeBar(b); await U.flush(); return b.id;
};

  SB["m2-home"] = async (x, y, sent) => {
  const b = F.phone(sent ? "m2-home-sent" : "m2-home", x, y);
  const hh = U.vi(b, "organisms/phone-home-header", {}, "home-header", [0, 44]);
  const c = U.fx(b, "content", {x: 0, y: 228, w: 390, hs: "fix", dir: "column", align: "stretch", px: "spacing.16", gap: "spacing.8"});
  const tp = U.fx(c, "btn/take-photo", {h: 128, vs: "fix", dir: "column", justify: "center", gap: "spacing.4", fill: "color.interactive.primary.bg", radius: "radius.16", fillW: true});
  U.icon(tp, "camera", "color.text.inverse", 32); U.t(tp, "label", "Take photo", "type.phone.title", "color.text.inverse"); U.t(tp, "hint", "Location locks before the shutter opens", "type.phone.caption", "color.text.inverse");
  const sc = U.fx(c, "shortcuts", {gap: "spacing.8", fillW: true, align: "start"});
  [["btn/todays-report", "Today's report", "Not sent", "Prefilled · due 4 pm", "document"], ["btn/milestones", "Milestones", "2 open", "Next: culvert km 106", "flag"]].forEach(([k, t, s, h, ic]) => { const tile = U.fx(sc, k, {dir: "column", align: "start", px: "spacing.16", py: "spacing.12", gap: "spacing.4", fill: "card.bg", stroke: "color.border.strong", radius: "card.radius", fillW: true}); const r1 = U.fx(tile, "title-row", {gap: "spacing.8"}); U.icon(r1, ic, "color.text.brand", 20); U.t(r1, "title", t, "type.phone.body-strong"); U.t(tile, "state", s, "type.phone.label"); U.t(tile, "hint", h, "type.phone.caption", "color.text.secondary"); });
  const ri = U.btn(c, "danger", "Report incident", "btn/report-incident", "large"); U.fill(ri);
  const sbk = U.fx(c, "btn/sent-back", {h: 56, vs: "fix", px: "spacing.16", gap: "spacing.12", fill: "card.bg", stroke: "color.border.strong", radius: "card.radius", fillW: true});
  U.t(sbk, "label", "Sent back", "type.phone.body-strong"); const bd = U.vi(sbk, "atoms/badge", {kind: "alert"}, "count"); U.setText(bd, "count", "2"); U.t(sbk, "preview", "Photo unclear · 1 more", "type.phone.caption", "color.text.secondary", {fillW: true}); U.icon(sbk, "chevron-right", "color.text.secondary", 20);
  const ps = U.fx(c, "btn/your-photos", {dir: "column", align: "stretch", px: "spacing.16", py: "spacing.12", gap: "spacing.8", fill: "card.bg", stroke: "color.border.strong", radius: "card.radius", fillW: true});
  const pr = U.fx(ps, "head", {gap: "spacing.8", fillW: true}); U.t(pr, "title", "Your photos", "type.phone.body-strong", "color.text.primary", {fillW: true}); U.t(pr, "sync", sent ? "Last sync just now ›" : "Last sync 10:47 ›", "type.phone.caption", "color.text.secondary");
  [[["queued", sent ? "Queued 0" : "Queued 1"], ["sent", sent ? "Sent 4" : "Sent 3"]], [["verified", "Verified 12"], ["sent-back", "Sent back 2"]]].forEach((row, i) => { const r = U.fx(ps, "row-" + (i + 1), {gap: "spacing.8", fillW: true}); row.forEach(([k, l]) => { const ch = U.vi(r, "molecules/phone-sync-chip", {status: k}, "status-" + k); U.setText(ch, "label", l); }); });
  const cs = U.btn(c, "secondary", "Call support · 0700 RAIL 000", "btn/call-support", "large"); U.fill(cs);
  if (sent) {
    const ts = U.vi(b, "atoms/toast", {kind: "success"}, "toast", [8, 760]); ts.resize(374, ts.height); U.setText(ts, "message", "Photo sent, km 142+300"); U.setText(ts, "action", "OK");
    const ho = U.vi(b, "molecules/handoff-chip", {}, "handoff/next-resident-engineer", [100, 712]); U.setText(ho, "label", "Next: resident engineer");
  }
  F.homeBar(b);
  await U.flush(); await new Promise(r => setTimeout(r, 300));
  storage.fixRowAuto(sc); if (sent) storage.fixSent(b);
  return b.id;
};

  SB["m2-home-sent"] = (x, y) => SB["m2-home"](x, y, true);

  SB["m3-capture"] = async (x, y) => {
  const b = F.phone("m3-capture", x, y, "dark");
  const vf = U.fx(b, "viewfinder", {x: 0, y: 44, w: 390, h: 272, hs: "fix", vs: "fix", dir: "column", justify: "center", gap: "spacing.8", fill: "color.surface.inverse"});
  U.icon(vf, "photo", "color.text.inverse", 48); U.t(vf, "caption", "Photo taken 10:52 · check it before sending", "type.phone.caption", "color.text.inverse");
  const lock = U.fx(b, "location-lock", {x: 16, y: 56, h: 36, vs: "fix", px: "chip.padding-x", gap: "spacing.8", fill: "color.feedback.success.bg", radius: "chip.radius"}); U.icon(lock, "lock", "color.feedback.success.fg", 16); U.t(lock, "label", "Location locked · ±4 m", "type.label", "color.feedback.success.fg");
  const close = U.fx(b, "btn/close", {x: 326, y: 50, w: 48, h: 48, hs: "fix", vs: "fix", justify: "center", fill: "color.surface.raised", radius: "radius.full"}); U.icon(close, "close", "color.text.primary", 20);
  const ch = U.fx(b, "chainage-strip", {x: 0, y: 316, w: 390, h: 64, hs: "fix", vs: "fix", px: "spacing.16", gap: "spacing.12", fill: "color.surface.brand"});
  const cl = U.fx(ch, "left", {dir: "column", align: "start", fillW: true}); U.t(cl, "chainage", "km 104+350", "type.phone.title", "color.text.inverse"); U.t(cl, "caption", "Chainage, live from GPS", "type.phone.caption", "color.text.inverse"); U.t(ch, "meta", "Lot 2 · 10:52 · heading NE", "type.phone.caption", "color.text.inverse");
  const body = U.fx(b, "body", {x: 0, y: 392, w: 390, hs: "fix", dir: "column", align: "stretch", px: "spacing.16", gap: "spacing.12"});
  const hd = U.fx(body, "heading", {gap: "spacing.12", fillW: true}); U.t(hd, "title", "What is this?", "type.phone.body-strong"); U.t(hd, "hint", "Tap one", "type.phone.caption", "color.text.secondary");
  const K = ["earthworks", "bridge-culvert", "track", "station", "equipment", "other"];
  for (let r = 0; r < 2; r++) { const row = U.fx(body, "tiles-" + (r + 1), {gap: "spacing.8", fillW: true}); K.slice(r * 3, r * 3 + 3).forEach(k => { const t = U.vi(row, "molecules/what-is-this-tile", {kind: k, selected: "no"}, "tile-" + k); t.resize(114, 100); const l = penpotUtils.findShape(s => s.type === "text", t); if (l) { l.layoutChild.horizontalSizing = "fill"; l.growType = "auto-height"; l.align = "center"; } }); }
  const vn = U.btn(body, "secondary", "Hold to add a voice note (optional)", "btn/voice-note", "large"); U.fill(vn);
  const act = U.fx(body, "actions", {gap: "spacing.12", fillW: true}); U.btn(act, "secondary", "Retake", "btn/retake", "large"); U.fill(U.btn(act, "primary", "Send", "btn/send", "large"));
  U.t(body, "queue-note", "Joins the outbox and uploads when there is signal.", "type.phone.caption", "color.text.secondary", {fillW: true}).align = "center";
  F.homeBar(b); await U.flush(); return b.id;
};

  SB["w3-map-home"] = async (x, y) => {
  const b = F.web("w3-map-home", x, y);
  const left = U.fx(b, "tasks-panel", {x: 0, y: 68, w: 340, h: 956, hs: "fix", vs: "fix", dir: "column", align: "stretch", px: 10, py: "spacing.16", gap: "spacing.8", fill: "color.surface.raised", stroke: "color.border.subtle"});
  const head = U.fx(left, "heading", {gap: "spacing.12", px: 6, fillW: true}); U.t(head, "title", "Your tasks today", "type.title-sm"); U.chip(head, "count", "7", "count");
  [["Confirm gate: BPP no objection", "3 days", "Lagos–Calabar coastal · gate 6", "Certificate uploaded; confirm the date"], ["Approve payment certificate #14", "1 day", "Kaduna–Kano SGR · ₦2.1bn · Lot 2", "NRC engineer certified it; needs your approval"], ["Flagged photo at km 212+150", "2 days", "Lagos–Ibadan · Lot 1", "180 m outside the corridor buffer"], ["Confirm new account", "3 hours", "Kaduna–Kano SGR · Lot 2", "CCECC site manager Emeka Nwosu"]].forEach(([t, a, p, w], i) => { const r = U.vi(left, "molecules/task-row", {selected: "no"}, "task-" + (i + 1)); U.fill(r); U.setText(r, "type", t); U.setText(r, "age", a); U.setText(r, "project", p); U.setText(r, "why", w); });
  const all = U.fx(left, "see-all", {px: 6, py: 4, fillW: true}); U.t(all, "link", "See all 7 tasks →", "type.link", "color.text.link");
  U.fx(left, "spacer", {h: 8, vs: "fix", fillW: true, fillH: true});
  const lp = U.vi(left, "organisms/layers-panel", {}, "layers-panel");
  const map = penpot.createBoard(); map.name = "map"; b.appendChild(map); map.resize(1100, 956); map.x = b.x + 340; map.y = b.y + 68; map.clipContent = true; U.paint(map, {fill: "color.surface.muted"});
  const S = 70, LON0 = 2.27, LAT0 = 16.04, P = (lon, lat) => [Math.round((lon - LON0) * S), Math.round((LAT0 - lat) * S)];
  const tiles = []; for (let r = 16; r <= 19; r++) for (let c = 40; c <= 43; c++) { const t = penpot.createRectangle(); map.appendChild(t); t.name = `imagery/tile-6-${r}-${c}`; const [tx, ty] = P(-180 + c * 4.5, 90 - r * 4.5); t.resize(316, 316); t.x = map.x + tx; t.y = map.y + ty; t.fills = [{fillOpacity: 1, fillImage: storage.TILEFILL[`tile-6-${r}-${c}`]}]; tiles.push(t); }
  penpot.group(tiles).name = "imagery (NASA Blue Marble, public domain)";
  const C = {"lagos-calabar": ["planned", [[3.39, 6.45], [4.88, 6.75], [5.62, 6.34], [5.75, 5.52], [6.27, 4.93], [7.03, 4.82], [7.93, 5.04], [8.32, 4.96]]], "ibadan-abuja": ["planned", [[3.95, 7.38], [4.55, 8.50], [6.55, 9.61], [7.49, 9.06]]], "abuja-itakpe": ["planned", [[6.32, 7.62], [6.74, 7.80], [7.49, 9.06]]], "kano-maradi (draft)": ["draft", [[8.52, 12.00], [7.60, 12.99], [7.10, 13.50]]], "port-harcourt-maiduguri": ["stalled", [[7.03, 4.82], [7.37, 5.11], [7.51, 6.45], [8.54, 7.73], [8.29, 9.58], [9.84, 10.31], [11.17, 10.29], [13.16, 11.85]]], "warri-itakpe": ["operational", [[5.75, 5.52], [6.10, 6.30], [6.65, 7.56], [6.32, 7.62]]], "lagos-ibadan": ["operational", [[3.39, 6.45], [3.40, 6.90], [3.95, 7.38]]], "abuja-kaduna": ["operational", [[7.49, 9.06], [7.40, 9.70], [7.44, 10.52]]], "kaduna-kano": ["under-construction", [[7.44, 10.52], [7.72, 11.09], [8.52, 12.00]]]};
  penpot.group(Object.entries(C).map(([k, [s, pts]]) => U.poly(map, "corridors/" + k, pts.map(([lo, la]) => P(lo, la)), `color.status.${s}.line`, "map.corridor.width", {dash: s === "draft"}))).name = "corridors";
  const ST = {Lagos: [3.39, 6.45, -46, -8], Ibadan: [3.95, 7.38, 12, -10], Abuja: [7.49, 9.06, 12, 0], Kaduna: [7.44, 10.52, -62, -10], Zaria: [7.72, 11.09, 12, -10], Kano: [8.52, 12.00, 12, -8], Katsina: [7.60, 12.99, -66, -12], Maradi: [7.10, 13.50, 12, -12], Warri: [5.75, 5.52, -50, -4], Itakpe: [6.32, 7.62, -58, -2], "Port Harcourt": [7.03, 4.82, -40, 10], Calabar: [8.32, 4.96, 12, -6], Enugu: [7.51, 6.45, 12, -8], Jos: [8.29, 9.58, 12, -8], Maiduguri: [13.16, 11.85, 12, -8]};
  const dots = [], labels = [];
  for (const [n, [lo, la, dx, dy]] of Object.entries(ST)) { const [px, py] = P(lo, la), k = n.toLowerCase().replace(/ /g, "-"); dots.push(U.ellipse(map, "stations/" + k, px, py, 12, {fill: "map.station.fill", stroke: "map.station.stroke", sw: 2})); const h = U.text(map, "labels/" + k + "-halo", px + dx, py + dy, n, "type.caption", "map.label.halo"); h.strokes = [{strokeColor: U.val("map.label.halo"), strokeWidth: 3, strokeAlignment: "outer", strokeStyle: "solid"}]; U.apply(h, "map.label.halo", ["strokeColor"]); U.apply(h, "map.label.halo-width", ["strokeWidth"]); labels.push(h); labels.push(U.text(map, "labels/" + k, px + dx, py + dy, n, "type.caption", "map.label.fg")); }
  penpot.group(dots).name = "stations"; penpot.group(labels).name = "labels";
  const sb = U.vi(map, "molecules/search-box", {}, "controls/search", [24, 16]); sb.resize(300, sb.height); U.setText(sb, "placeholder", "Search project, town or km");
  U.vi(map, "molecules/filter-chip-row", {}, "controls/filters", [340, 24]);
  const np = U.btn(map, "primary", "+ New project", "controls/new-project"); const dr = U.chip(map, "status-draft", "Drafts (1)", "controls/drafts");
  const ctr = U.fx(map, "counters", {x: 24, y: 72, gap: "spacing.12"});
  [["6", "On track", "operational"], ["3", "Behind", "under-construction"], ["2", "Stalled", "stalled"]].forEach(([n, l, st]) => { const c = U.fx(ctr, "counter-" + l.toLowerCase().replace(/ /g, "-"), {px: "spacing.16", py: "spacing.8", gap: "spacing.8", fill: "card.bg", stroke: "card.border", radius: "card.radius", shadow: "card.shadow"}); U.vi(c, "atoms/status-dot", {status: st}, "dot"); U.t(c, "number", n, "type.display"); U.t(c, "label", l, "type.body-strong", "color.text.secondary"); });
  U.vi(map, "organisms/project-card-panel", {}, "project-card (Kaduna–Kano)", [696, 72]);
  const lg = U.vi(map, "organisms/map-legend", {}, "legend", [24, 156]);
  const [kx, ky] = P(7.60, 12.99);
  const dl = U.chip(map, "status-draft", "Draft · Kano–Maradi", "draft-corridor/label");
  const nh = U.text(map, "draft-corridor/note-halo", 0, 0, "Only you and the Director see it", "type.caption", "map.label.halo"); nh.strokes = [{strokeColor: U.val("map.label.halo"), strokeWidth: 3, strokeAlignment: "outer", strokeStyle: "solid"}]; U.apply(nh, "map.label.halo", ["strokeColor"]); U.apply(nh, "map.label.halo-width", ["strokeWidth"]);
  const nt = U.text(map, "draft-corridor/note", 0, 0, "Only you and the Director see it", "type.caption", "map.label.fg");
  const at = U.fx(map, "attribution", {px: "spacing.8", py: "spacing.4", fill: "color.surface.raised", radius: "radius.4"}); U.t(at, "text", "Imagery: NASA Blue Marble (public domain)", "type.caption", "color.text.secondary");
  await U.flush(); await new Promise(r => setTimeout(r, 400));
  np.x = map.x + 1100 - 24 - np.width; np.y = map.y + 16; dr.x = np.x - 12 - dr.width; dr.y = map.y + 24;
  dl.x = map.x + kx + 40; dl.y = map.y + ky - 18; [nh, nt].forEach(t => { t.x = dl.x; t.y = dl.y + 32; });
  at.x = map.x + 1100 - 24 - at.width; at.y = map.y + 956 - 16 - at.height;
  penpotUtils.findShapes(s => /layer-[12]$/.test(s.name.replace(/\s/g, "")), lp).forEach(r => { const tr = penpotUtils.findShape(s => s.name.replace(/\s/g, "").endsWith("track"), r); tr.fills = [{fillColor: U.val("color.border.strong"), fillOpacity: 1}]; U.apply(tr, "color.border.strong", ["fill"]); tr.flex.justifyContent = "start"; });
  const r3 = penpotUtils.findShape(s => /layer-3$/.test(s.name.replace(/\s/g, "")), lp); const t3 = penpotUtils.findShape(s => s.name.replace(/\s/g, "").endsWith("track"), r3); t3.fills = [{fillColor: U.val("color.brand.primary"), fillOpacity: 1}]; U.apply(t3, "color.brand.primary", ["fill"]); t3.flex.justifyContent = "end";
  await U.flush(); return b.id;
};

  SB["w5-project-view"] = async (x, y) => {
  const b = F.w5("w5-project-view", x, y, 0);
  const X = 260, W = 1160; let yy = 183;
  const g = U.fx(b, "gates", {x: X, y: yy, w: W, hs: "fix", px: "card.padding-lg", py: "card.padding", gap: "spacing.32", align: "start", fill: "card.bg", stroke: "card.border", radius: "card.radius", shadow: "card.shadow"});
  const gl = U.fx(g, "strip", {dir: "column", align: "start", gap: "spacing.8"}); U.t(gl, "title", "Gates · external loan template", "type.overline", "color.text.secondary"); U.vi(gl, "molecules/gate-strip", {example: "kaduna-kano"}, "gate-strip"); U.t(gl, "caption", "Gate 13 Certify and pay · 12 days at gate · gate 10 Right-of-way blocked 41 days", "type.body-sm", "color.text.secondary");
  const kn = U.fx(g, "key-numbers", {dir: "column", align: "start", gap: "spacing.4", fillW: true});
  [["Physical", "68%"], ["Financial", "71%"], ["Planned", "72%"], ["Contract sum", "₦1.21tn"]].forEach(([k, v]) => { const r = U.fx(kn, "kv-" + k.toLowerCase().replace(/ /g, "-"), {gap: "spacing.8", fillW: true}); U.t(r, "key", k, "type.body-sm", "color.text.secondary", {w: 104}); U.t(r, "value", v, "type.numeric"); });
  await U.flush(); await new Promise(r => setTimeout(r, 300)); yy += Math.round(g.height) + 12;
  U.vi(b, "organisms/strip-map", {}, "strip-map", [X, yy]); yy += 312;
  const pc = U.fx(b, "latest-photos", {x: X, y: yy, w: W - 352, hs: "fix", dir: "column", align: "stretch", px: "card.padding", py: "card.padding", gap: "spacing.12", fill: "card.bg", stroke: "card.border", radius: "card.radius", shadow: "card.shadow"});
  const ph = U.fx(pc, "head", {gap: "spacing.12", fillW: true}); U.t(ph, "title", "Latest verified photos", "type.body-strong", "color.text.primary", {fillW: true}); U.t(ph, "link/all", "View all 186 →", "type.label", "color.text.link");
  const row = U.fx(pc, "photos", {gap: "spacing.12", align: "start", fillW: true});
  [["km 142+300", "27 Oct 2026"], ["km 104+350", "29 Oct 2026"], ["km 98+200", "26 Oct 2026"], ["km 76+400", "25 Oct 2026"], ["km 61+050", "24 Oct 2026"], ["km 33+700", "23 Oct 2026"]].forEach(([c, d], i) => { const t = U.vi(row, "molecules/photo-thumbnail", {status: "verified"}, "photo-" + (i + 1)); t.resize(118, t.height); U.setText(t, "chainage", c); U.setText(t, "date", d); });
  const ci = U.vi(b, "organisms/corridor-inset", {}, "corridor-inset", [X + W - 340, yy]); U.setText(ci, "title", "Corridor at km 142"); U.setText(ci, "caption", "Latest photo at km 142+300, inside the corridor");
  const pin = penpotUtils.findShape(s => /icon\/map-pin/.test(s.name.replace(/\s/g, "")), ci); if (pin) penpotUtils.findShapes(s => (s.strokes || []).length && s.type !== "group" && !s.hidden, pin).forEach(s => U.apply(s, "color.text.brand", ["strokeColor"]));
  const al = U.fx(b, "open-alerts", {x: X, y: 948, w: W, hs: "fix", px: "card.padding", py: "spacing.12", gap: "spacing.12", fill: "color.feedback.error.bg", stroke: "color.feedback.error.fg", radius: "card.radius"});
  U.icon(al, "warning", "color.feedback.error.fg"); U.t(al, "title", "2 open alerts", "type.body-strong", "color.feedback.error.fg"); U.t(al, "items", "Compensation unpaid km 140–152 (41 days) · IPC 14 waiting for the Director (1 day)", "type.body", "color.text.primary", {fillW: true}); U.t(al, "link/open", "Open →", "type.label", "color.text.link");
  await U.flush(); return b.id;
};

  return storage;
}

// ==== UI file — page 07 prototype, wiring, QA and Large text fixes, final run step 3 (29 Oct 2026) ====
// Paste after installUI2, then installUI3(storage). Run on page 07 Prototype; storage.P7 maps screen keys to the page 07 board ids.
function installUI3(storage) {
  const U = storage.U, F = storage.F, SB = storage.SB;
  // m4-report and m8-outbox: bind spacing.4 to the content gap so a theme switch keeps it (a raw 6 px is reset by the theme)
  const pc = storage.phoneChips, fo = storage.fixOutbox;
  storage.phoneChips = (b) => { pc(b); if (/m4-report|m8-outbox/.test(b.name)) { const c = b.children.find(x => x.name === "content"); c.applyToken(U.tok("spacing.4"), ["rowGap", "columnGap"]); } };
  storage.fixOutbox = (b) => { fo(b); b.children.find(x => x.name === "content").applyToken(U.tok("spacing.4"), ["rowGap", "columnGap"]); };
  storage.P7 = {"w1-sign-in":"0d1fa95c-e3a1-8044-8008-dd3a4a67302f","w3-map-home":"0d1fa95c-e3a1-8044-8008-dd3a4dbb8a71","w5-project-view":"0d1fa95c-e3a1-8044-8008-dd3a77a95545","w5-gates":"0d1fa95c-e3a1-8044-8008-dd3a7f6c81e3","w5-payments":"0d1fa95c-e3a1-8044-8008-dd3a819282ac","w5-documents":"0d1fa95c-e3a1-8044-8008-dd3a857f65f8","w8-portfolio":"0d1fa95c-e3a1-8044-8008-dd3a8e93d172","w2-accept-invite":"0d1fa95c-e3a1-8044-8008-dd3aa09d00ae","w5-project-view-draft":"0d1fa95c-e3a1-8044-8008-dd3aa5d38429","w5-people":"0d1fa95c-e3a1-8044-8008-dd3ab1a41b54","w5-land":"e2099282-2157-8092-8008-dd3ab5b50e38","w6-create-project":"e2099282-2157-8092-8008-dd3ac51f0b33","w6-funding-route":"e2099282-2157-8092-8008-dd3acd47ab60","w6-geography":"e2099282-2157-8092-8008-dd3ad66f7ba3","w6-people":"e2099282-2157-8092-8008-dd3ae027cf6e","w6-documents":"e2099282-2157-8092-8008-dd3ae8f9a9c7","w6-publish":"e2099282-2157-8092-8008-dd3af227baef","w7-tasks":"e2099282-2157-8092-8008-dd3afb2083db","w7-publish-project":"e2099282-2157-8092-8008-dd3b00e7a4db","w7-confirm-account":"e2099282-2157-8092-8008-dd3b09ece146","w7-verify-photo":"e2099282-2157-8092-8008-dd3b13d2967a","w7-upload-document":"e2099282-2157-8092-8008-dd3b1dee96ed","w7-confirm-gate":"e2099282-2157-8092-8008-dd3b26298797","w7-approve-ipc-pin":"e2099282-2157-8092-8008-dd3b33771ef5","overlays/return-reasons":"e2099282-2157-8092-8008-dd3b3a40748f","w7-verify-milestone":"e2099282-2157-8092-8008-dd3b3b58cbc5","s2-users":"e2099282-2157-8092-8008-dd3b46af2550","s2-users-invited":"e2099282-2157-8092-8008-dd3b49f6150b","s1-organisations":"e2099282-2157-8092-8008-dd3b4dc83885","m2-home":"e2099282-2157-8092-8008-dd3b524311d2","m3-capture":"e2099282-2157-8092-8008-dd3b5e92b6cd","m1-onboarding":"e2099282-2157-8092-8008-dd3b665f67b3","m4-report":"e2099282-2157-8092-8008-dd3b6a3daee5","m6-incident":"e2099282-2157-8092-8008-dd3b6e52405e","m2-home-sent":"e2099282-2157-8092-8008-dd3b71cac6df","m5-milestones":"e2099282-2157-8092-8008-dd3b7e2427c5","m7-sent-back":"e2099282-2157-8092-8008-dd3b81cc4016","m8-outbox":"e2099282-2157-8092-8008-dd3b85e85122","m9-re-home":"e2099282-2157-8092-8008-dd3b8c380b0f"};
  storage.PROOF = {"w3":"e2099282-2157-8092-8008-dd3baa20ef49","m2":"e2099282-2157-8092-8008-dd3bc4e18ea3"};
  storage.LAYOUT7 = [["w1-sign-in",0,0],["w3-map-home",1540,0],["w5-project-view",3080,0],["w5-gates",4620,0],["w5-payments",6160,0],["w5-documents",7700,0],["w8-portfolio",9240,0],["w2-accept-invite",10780,0],["w5-project-view-draft",12320,0],["w5-people",13860,0],["w5-land",15400,0],["w6-create-project",0,1124],["w6-funding-route",1540,1124],["w6-geography",3080,1124],["w6-people",4620,1124],["w6-documents",6160,1124],["w6-publish",7700,1124],["w7-tasks",0,2248],["w7-publish-project",1540,2248],["w7-confirm-account",3080,2248],["w7-verify-photo",4620,2248],["w7-upload-document",6160,2248],["w7-confirm-gate",7700,2248],["w7-approve-ipc-pin",9240,2248],["overlays/return-reasons",10780,2248],["w7-verify-milestone",11360,2248],["s2-users",0,3372],["s2-users-invited",1540,3372],["s1-organisations",3080,3372],["m2-home",0,4496],["m3-capture",490,4496],["m1-onboarding",980,4496],["m4-report",1470,4496],["m6-incident",1960,4496],["m2-home-sent",2450,4496],["m5-milestones",2940,4496],["m7-sent-back",3430,4496],["m8-outbox",3920,4496],["m9-re-home",4410,4496]];
  storage.WIRES7 = []; // wire7 appends each row it applies; WIRES7_TABLE below is the full table used on 29 Oct 2026
  storage.WIRES7_TABLE = [["w3-map-home","controls/new-project","nav","w6-create-project"],["w6-create-project","btn/next","nav","w6-funding-route"],["w6-create-project","btn/back","nav","w3-map-home"],["w6-create-project","btn/save-draft","nav","w6-create-project"],["w6-create-project","link/back-to-map","nav","w3-map-home"],["w6-create-project","nav/step-1","nav","w6-create-project"],["w6-create-project","nav/step-2","nav","w6-funding-route"],["w6-create-project","nav/step-3","nav","w6-geography"],["w6-create-project","nav/step-4","nav","w6-people"],["w6-create-project","nav/step-5","nav","w6-documents"],["w6-create-project","nav/step-6","nav","w6-publish"],["w6-funding-route","btn/next","nav","w6-geography"],["w6-funding-route","btn/back","nav","w6-create-project"],["w6-funding-route","btn/save-draft","nav","w6-funding-route"],["w6-funding-route","link/back-to-map","nav","w3-map-home"],["w6-funding-route","nav/step-1","nav","w6-create-project"],["w6-funding-route","nav/step-2","nav","w6-funding-route"],["w6-funding-route","nav/step-3","nav","w6-geography"],["w6-funding-route","nav/step-4","nav","w6-people"],["w6-funding-route","nav/step-5","nav","w6-documents"],["w6-funding-route","nav/step-6","nav","w6-publish"],["w6-geography","btn/next","nav","w6-people"],["w6-geography","btn/back","nav","w6-funding-route"],["w6-geography","btn/save-draft","nav","w6-geography"],["w6-geography","link/back-to-map","nav","w3-map-home"],["w6-geography","nav/step-1","nav","w6-create-project"],["w6-geography","nav/step-2","nav","w6-funding-route"],["w6-geography","nav/step-3","nav","w6-geography"],["w6-geography","nav/step-4","nav","w6-people"],["w6-geography","nav/step-5","nav","w6-documents"],["w6-geography","nav/step-6","nav","w6-publish"],["w6-people","btn/next","nav","w6-documents"],["w6-people","btn/back","nav","w6-geography"],["w6-people","btn/save-draft","nav","w6-people"],["w6-people","link/back-to-map","nav","w3-map-home"],["w6-people","nav/step-1","nav","w6-create-project"],["w6-people","nav/step-2","nav","w6-funding-route"],["w6-people","nav/step-3","nav","w6-geography"],["w6-people","nav/step-4","nav","w6-people"],["w6-people","nav/step-5","nav","w6-documents"],["w6-people","nav/step-6","nav","w6-publish"],["w6-documents","btn/next","nav","w6-publish"],["w6-documents","btn/back","nav","w6-people"],["w6-documents","btn/save-draft","nav","w6-documents"],["w6-documents","link/back-to-map","nav","w3-map-home"],["w6-documents","nav/step-1","nav","w6-create-project"],["w6-documents","nav/step-2","nav","w6-funding-route"],["w6-documents","nav/step-3","nav","w6-geography"],["w6-documents","nav/step-4","nav","w6-people"],["w6-documents","nav/step-5","nav","w6-documents"],["w6-documents","nav/step-6","nav","w6-publish"],["w6-publish","btn/back","nav","w6-documents"],["w6-publish","btn/save-draft","nav","w6-publish"],["w6-publish","link/back-to-map","nav","w3-map-home"],["w6-publish","nav/step-1","nav","w6-create-project"],["w6-publish","nav/step-2","nav","w6-funding-route"],["w6-publish","nav/step-3","nav","w6-geography"],["w6-publish","nav/step-4","nav","w6-people"],["w6-publish","nav/step-5","nav","w6-documents"],["w6-publish","nav/step-6","nav","w6-publish"],["w6-publish","btn/next","nav","w7-tasks"],["w6-publish","btn/preview-map","nav","w3-map-home"],["w6-publish","btn/preview-page","nav","w5-project-view-draft"],["w7-tasks","task/publish-project","nav","w7-publish-project"],["w7-publish-project","btn/publish","nav","w3-map-home"],["w7-publish-project","btn/return","ovl","overlays/return-reasons"],["w7-publish-project","link/preview-map","nav","w3-map-home"],["w7-publish-project","link/preview-page","nav","w5-project-view-draft"],["w3-map-home","controls/drafts","nav","w5-project-view-draft"],["w3-map-home","corridors/kano-maradi(draft)","nav","w5-project-view-draft"],["w3-map-home","draft-corridor/label","nav","w5-project-view-draft"],["w5-project-view-draft","link/back-to-review","nav","w6-publish"],["w5-project-view-draft","item-1","nav","w5-project-view-draft"],["w5-project-view-draft","back","nav","w3-map-home"],["w6-publish","link/edit-1","nav","w6-create-project"],["w6-publish","link/edit-2","nav","w6-funding-route"],["w6-publish","link/edit-3","nav","w6-geography"],["w6-publish","link/edit-4","nav","w6-people"],["w6-publish","link/edit-5","nav","w6-documents"],["s1-organisations","btn/save-add-people","nav","s2-users"],["s1-organisations","btn/add-organisation","nav","s1-organisations"],["s1-organisations","btn/cancel","nav","s1-organisations"],["s1-organisations","item-s2","nav","s2-users"],["s2-users","btn/send-invite","nav","s2-users-invited"],["s2-users","btn/cancel","nav","s2-users"],["s2-users","btn/add-person","nav","s2-users"],["s2-users","item-s1","nav","s1-organisations"],["s2-users","link/close","nav","s2-users"],["s2-users-invited","toast","nav","w7-tasks"],["s2-users-invited","row/invited-new","nav","w7-tasks"],["s2-users-invited","handoff/next-commercial-manager","nav","w2-accept-invite"],["s2-users-invited","item-s1","nav","s1-organisations"],["s2-users-invited","btn/add-person","nav","s2-users"],["w2-accept-invite","btn/accept","nav","w3-map-home"],["w7-tasks","task/confirm-account","nav","w7-confirm-account"],["w7-confirm-account","btn/confirm","nav","m1-onboarding"],["w7-confirm-account","btn/decline","ovl","overlays/return-reasons"],["m1-onboarding","btn/start","nav","m2-home"],["w1-sign-in","btn/enter","nav","w3-map-home"],["w1-sign-in","link/call-support","nav","w1-sign-in"],["w3-map-home","open-project","nav","w5-project-view"],["w3-map-home","set-current","nav","w5-project-view"],["w3-map-home","corridors/kaduna-kano","nav","w3-map-home"],["w3-map-home","task-1","nav","w7-confirm-gate"],["w3-map-home","task-2","nav","w7-tasks"],["w3-map-home","task-3","nav","w7-verify-photo"],["w3-map-home","task-4","nav","w7-confirm-account"],["w3-map-home","see-all","nav","w7-tasks"],["w3-map-home","blocker","nav","w5-land"],["w5-project-view","item-1","nav","w5-project-view"],["w5-project-view","item-2","nav","w5-gates"],["w5-project-view","item-6","nav","w5-payments"],["w5-project-view","item-8","nav","w5-documents"],["w5-project-view","item-9","nav","w5-land"],["w5-project-view","item-11","nav","w5-people"],["w5-project-view","back","nav","w3-map-home"],["w5-gates","item-1","nav","w5-project-view"],["w5-gates","item-2","nav","w5-gates"],["w5-gates","item-6","nav","w5-payments"],["w5-gates","item-8","nav","w5-documents"],["w5-gates","item-9","nav","w5-land"],["w5-gates","item-11","nav","w5-people"],["w5-gates","back","nav","w3-map-home"],["w5-payments","item-1","nav","w5-project-view"],["w5-payments","item-2","nav","w5-gates"],["w5-payments","item-6","nav","w5-payments"],["w5-payments","item-8","nav","w5-documents"],["w5-payments","item-9","nav","w5-land"],["w5-payments","item-11","nav","w5-people"],["w5-payments","back","nav","w3-map-home"],["w5-documents","item-1","nav","w5-project-view"],["w5-documents","item-2","nav","w5-gates"],["w5-documents","item-6","nav","w5-payments"],["w5-documents","item-8","nav","w5-documents"],["w5-documents","item-9","nav","w5-land"],["w5-documents","item-11","nav","w5-people"],["w5-documents","back","nav","w3-map-home"],["w5-people","item-1","nav","w5-project-view"],["w5-people","item-2","nav","w5-gates"],["w5-people","item-6","nav","w5-payments"],["w5-people","item-8","nav","w5-documents"],["w5-people","item-9","nav","w5-land"],["w5-people","item-11","nav","w5-people"],["w5-people","back","nav","w3-map-home"],["w5-land","item-1","nav","w5-project-view"],["w5-land","item-2","nav","w5-gates"],["w5-land","item-6","nav","w5-payments"],["w5-land","item-8","nav","w5-documents"],["w5-land","item-9","nav","w5-land"],["w5-land","item-11","nav","w5-people"],["w5-land","back","nav","w3-map-home"],["w5-gates","link/open-evidence-6","nav","w7-confirm-gate"],["w5-gates","link/attach-evidence-10","nav","w7-upload-document"],["w5-gates","link/confirm-13","nav","w7-tasks"],["w5-gates","link/open-evidence-4","nav","w5-documents"],["w5-gates","link/open-evidence-5","nav","w5-documents"],["w5-gates","link/open-evidence-7","nav","w5-documents"],["w5-gates","link/open-evidence-8","nav","w5-documents"],["w5-gates","link/open-evidence-9","nav","w5-documents"],["w5-gates","link/open-evidence-11","nav","w5-documents"],["w5-project-view","link/all","nav","w5-project-view"],["w5-project-view","link/open","nav","w5-land"],["w7-tasks","btn/approve","nav","w7-approve-ipc-pin"],["w7-tasks","btn/return","ovl","overlays/return-reasons"],["w7-approve-ipc-pin","btn/confirm","nav","w7-tasks"],["w7-approve-ipc-pin","btn/cancel","nav","w7-tasks"],["w5-people","btn/add-member","nav","w5-people"],["w5-land","btn/add-parcel","nav","w5-land"],["w8-portfolio","btn/export","nav","w8-portfolio"],["m2-home","btn/take-photo","nav","m3-capture"],["m2-home","btn/todays-report","nav","m4-report"],["m2-home","btn/milestones","nav","m5-milestones"],["m2-home","btn/report-incident","nav","m6-incident"],["m2-home","btn/sent-back","nav","m7-sent-back"],["m2-home","btn/your-photos","nav","m8-outbox"],["m2-home-sent","btn/take-photo","nav","m3-capture"],["m2-home-sent","btn/todays-report","nav","m4-report"],["m2-home-sent","btn/milestones","nav","m5-milestones"],["m2-home-sent","btn/report-incident","nav","m6-incident"],["m2-home-sent","btn/sent-back","nav","m7-sent-back"],["m2-home-sent","btn/your-photos","nav","m8-outbox"],["m2-home","btn/call-support","nav","m2-home"],["m3-capture","btn/send","nav","m2-home-sent"],["m3-capture","btn/retake","nav","m3-capture"],["m3-capture","btn/close","nav","m2-home"],["m3-capture","btn/voice-note","nav","m3-capture"],["m4-report","btn/send","nav","m2-home"],["m4-report","back","nav","m2-home"],["m4-report","btn/voice-note","nav","m4-report"],["m5-milestones","btn/mark-complete","nav","m3-capture"],["m5-milestones","back","nav","m2-home"],["m6-incident","btn/send","nav","m2-home"],["m6-incident","back","nav","m2-home"],["m6-incident","btn/photo","nav","m3-capture"],["m6-incident","btn/voice","nav","m6-incident"],["m7-sent-back","btn/retake-1","nav","m3-capture"],["m7-sent-back","btn/retake-2","nav","m3-capture"],["m7-sent-back","back","nav","m2-home"],["m8-outbox","back","nav","m2-home"],["m1-onboarding","btn/start","nav","m2-home"],["m2-home-sent","toast","nav","m2-home"],["m2-home-sent","handoff/next-resident-engineer","nav","m9-re-home"],["m9-re-home","btn/verify","nav","m9-re-home"],["m9-re-home","btn/send-back","nav","m9-re-home"],["m9-re-home","handoff/next-valuation","nav","w5-payments"],["m9-re-home","milestone","nav","w7-verify-milestone"],["w7-tasks","handoff/next-valuation","nav","w5-payments"],["w7-verify-photo","btn/verify","nav","w7-tasks"],["w7-verify-photo","btn/send-back","ovl","overlays/return-reasons"],["w5-payments","btn/new-valuation","nav","w5-payments"],["w5-payments","btn/submit","nav","w7-tasks"],["w7-upload-document","btn/submit","nav","w7-confirm-gate"],["w7-confirm-gate","btn/confirm","nav","w5-gates"],["w7-confirm-gate","btn/return","ovl","overlays/return-reasons"],["w5-documents","btn/upload","nav","w7-upload-document"],["w5-documents","link/upload-new-version","nav","w7-upload-document"],["w5-documents","link/link-to-gate","nav","w5-gates"],["w5-documents","link/open","nav","w5-documents"],["w7-verify-milestone","btn/verify","nav","w7-tasks"],["w7-verify-milestone","btn/send-back","ovl","overlays/return-reasons"],["w7-tasks","task/verify-photo","nav","w7-verify-photo"],["w7-tasks","task/approve-ipc","nav","w7-tasks"],["w7-tasks","task/confirm-account","nav","w7-confirm-account"],["w7-tasks","task/verify-milestone","nav","w7-verify-milestone"],["w7-tasks","task/upload-document","nav","w7-upload-document"],["w7-tasks","task/confirm-gate","nav","w7-confirm-gate"],["w7-tasks","task/publish-project","nav","w7-publish-project"],["w7-publish-project","task/verify-photo","nav","w7-verify-photo"],["w7-publish-project","task/approve-ipc","nav","w7-tasks"],["w7-publish-project","task/confirm-account","nav","w7-confirm-account"],["w7-publish-project","task/verify-milestone","nav","w7-verify-milestone"],["w7-publish-project","task/upload-document","nav","w7-upload-document"],["w7-publish-project","task/confirm-gate","nav","w7-confirm-gate"],["w7-publish-project","task/publish-project","nav","w7-publish-project"],["w7-confirm-account","task/verify-photo","nav","w7-verify-photo"],["w7-confirm-account","task/approve-ipc","nav","w7-tasks"],["w7-confirm-account","task/confirm-account","nav","w7-confirm-account"],["w7-confirm-account","task/verify-milestone","nav","w7-verify-milestone"],["w7-confirm-account","task/upload-document","nav","w7-upload-document"],["w7-confirm-account","task/confirm-gate","nav","w7-confirm-gate"],["w7-confirm-account","task/publish-project","nav","w7-publish-project"],["w7-verify-photo","task/verify-photo","nav","w7-verify-photo"],["w7-verify-photo","task/approve-ipc","nav","w7-tasks"],["w7-verify-photo","task/confirm-account","nav","w7-confirm-account"],["w7-verify-photo","task/verify-milestone","nav","w7-verify-milestone"],["w7-verify-photo","task/upload-document","nav","w7-upload-document"],["w7-verify-photo","task/confirm-gate","nav","w7-confirm-gate"],["w7-verify-photo","task/publish-project","nav","w7-publish-project"],["w7-upload-document","task/verify-photo","nav","w7-verify-photo"],["w7-upload-document","task/approve-ipc","nav","w7-tasks"],["w7-upload-document","task/confirm-account","nav","w7-confirm-account"],["w7-upload-document","task/verify-milestone","nav","w7-verify-milestone"],["w7-upload-document","task/upload-document","nav","w7-upload-document"],["w7-upload-document","task/confirm-gate","nav","w7-confirm-gate"],["w7-upload-document","task/publish-project","nav","w7-publish-project"],["w7-confirm-gate","task/verify-photo","nav","w7-verify-photo"],["w7-confirm-gate","task/approve-ipc","nav","w7-tasks"],["w7-confirm-gate","task/confirm-account","nav","w7-confirm-account"],["w7-confirm-gate","task/verify-milestone","nav","w7-verify-milestone"],["w7-confirm-gate","task/upload-document","nav","w7-upload-document"],["w7-confirm-gate","task/confirm-gate","nav","w7-confirm-gate"],["w7-confirm-gate","task/publish-project","nav","w7-publish-project"],["w7-approve-ipc-pin","task/verify-photo","nav","w7-verify-photo"],["w7-approve-ipc-pin","task/approve-ipc","nav","w7-tasks"],["w7-approve-ipc-pin","task/confirm-account","nav","w7-confirm-account"],["w7-approve-ipc-pin","task/verify-milestone","nav","w7-verify-milestone"],["w7-approve-ipc-pin","task/upload-document","nav","w7-upload-document"],["w7-approve-ipc-pin","task/confirm-gate","nav","w7-confirm-gate"],["w7-approve-ipc-pin","task/publish-project","nav","w7-publish-project"],["w7-verify-milestone","task/verify-photo","nav","w7-verify-photo"],["w7-verify-milestone","task/approve-ipc","nav","w7-tasks"],["w7-verify-milestone","task/confirm-account","nav","w7-confirm-account"],["w7-verify-milestone","task/verify-milestone","nav","w7-verify-milestone"],["w7-verify-milestone","task/upload-document","nav","w7-upload-document"],["w7-verify-milestone","task/confirm-gate","nav","w7-confirm-gate"],["w7-verify-milestone","task/publish-project","nav","w7-publish-project"],["overlays/return-reasons","btn/send-back","prev",null],["overlays/return-reasons","btn/cancel","close",null],["w3-map-home","nav-map","nav","w3-map-home"],["w3-map-home","nav-tasks","nav","w7-tasks"],["w3-map-home","nav-portfolio","nav","w8-portfolio"],["w3-map-home","title","nav","w3-map-home"],["w5-project-view","nav-map","nav","w3-map-home"],["w5-project-view","nav-tasks","nav","w7-tasks"],["w5-project-view","nav-portfolio","nav","w8-portfolio"],["w5-project-view","title","nav","w3-map-home"],["w5-gates","nav-map","nav","w3-map-home"],["w5-gates","nav-tasks","nav","w7-tasks"],["w5-gates","nav-portfolio","nav","w8-portfolio"],["w5-gates","title","nav","w3-map-home"],["w5-payments","nav-map","nav","w3-map-home"],["w5-payments","nav-tasks","nav","w7-tasks"],["w5-payments","nav-portfolio","nav","w8-portfolio"],["w5-payments","title","nav","w3-map-home"],["w5-documents","nav-map","nav","w3-map-home"],["w5-documents","nav-tasks","nav","w7-tasks"],["w5-documents","nav-portfolio","nav","w8-portfolio"],["w5-documents","title","nav","w3-map-home"],["w8-portfolio","nav-map","nav","w3-map-home"],["w8-portfolio","nav-tasks","nav","w7-tasks"],["w8-portfolio","nav-portfolio","nav","w8-portfolio"],["w8-portfolio","title","nav","w3-map-home"],["w5-project-view-draft","nav-map","nav","w3-map-home"],["w5-project-view-draft","nav-tasks","nav","w7-tasks"],["w5-project-view-draft","nav-portfolio","nav","w8-portfolio"],["w5-project-view-draft","title","nav","w3-map-home"],["w5-people","nav-map","nav","w3-map-home"],["w5-people","nav-tasks","nav","w7-tasks"],["w5-people","nav-portfolio","nav","w8-portfolio"],["w5-people","title","nav","w3-map-home"],["w5-land","nav-map","nav","w3-map-home"],["w5-land","nav-tasks","nav","w7-tasks"],["w5-land","nav-portfolio","nav","w8-portfolio"],["w5-land","title","nav","w3-map-home"],["w6-create-project","nav-map","nav","w3-map-home"],["w6-create-project","nav-tasks","nav","w7-tasks"],["w6-create-project","nav-portfolio","nav","w8-portfolio"],["w6-create-project","title","nav","w3-map-home"],["w6-funding-route","nav-map","nav","w3-map-home"],["w6-funding-route","nav-tasks","nav","w7-tasks"],["w6-funding-route","nav-portfolio","nav","w8-portfolio"],["w6-funding-route","title","nav","w3-map-home"],["w6-geography","nav-map","nav","w3-map-home"],["w6-geography","nav-tasks","nav","w7-tasks"],["w6-geography","nav-portfolio","nav","w8-portfolio"],["w6-geography","title","nav","w3-map-home"],["w6-people","nav-map","nav","w3-map-home"],["w6-people","nav-tasks","nav","w7-tasks"],["w6-people","nav-portfolio","nav","w8-portfolio"],["w6-people","title","nav","w3-map-home"],["w6-documents","nav-map","nav","w3-map-home"],["w6-documents","nav-tasks","nav","w7-tasks"],["w6-documents","nav-portfolio","nav","w8-portfolio"],["w6-documents","title","nav","w3-map-home"],["w6-publish","nav-map","nav","w3-map-home"],["w6-publish","nav-tasks","nav","w7-tasks"],["w6-publish","nav-portfolio","nav","w8-portfolio"],["w6-publish","title","nav","w3-map-home"],["w7-tasks","nav-map","nav","w3-map-home"],["w7-tasks","nav-tasks","nav","w7-tasks"],["w7-tasks","nav-portfolio","nav","w8-portfolio"],["w7-tasks","title","nav","w3-map-home"],["w7-publish-project","nav-map","nav","w3-map-home"],["w7-publish-project","nav-tasks","nav","w7-tasks"],["w7-publish-project","nav-portfolio","nav","w8-portfolio"],["w7-publish-project","title","nav","w3-map-home"],["w7-confirm-account","nav-map","nav","w3-map-home"],["w7-confirm-account","nav-tasks","nav","w7-tasks"],["w7-confirm-account","nav-portfolio","nav","w8-portfolio"],["w7-confirm-account","title","nav","w3-map-home"],["w7-verify-photo","nav-map","nav","w3-map-home"],["w7-verify-photo","nav-tasks","nav","w7-tasks"],["w7-verify-photo","nav-portfolio","nav","w8-portfolio"],["w7-verify-photo","title","nav","w3-map-home"],["w7-upload-document","nav-map","nav","w3-map-home"],["w7-upload-document","nav-tasks","nav","w7-tasks"],["w7-upload-document","nav-portfolio","nav","w8-portfolio"],["w7-upload-document","title","nav","w3-map-home"],["w7-confirm-gate","nav-map","nav","w3-map-home"],["w7-confirm-gate","nav-tasks","nav","w7-tasks"],["w7-confirm-gate","nav-portfolio","nav","w8-portfolio"],["w7-confirm-gate","title","nav","w3-map-home"],["w7-approve-ipc-pin","nav-map","nav","w3-map-home"],["w7-approve-ipc-pin","nav-tasks","nav","w7-tasks"],["w7-approve-ipc-pin","nav-portfolio","nav","w8-portfolio"],["w7-approve-ipc-pin","title","nav","w3-map-home"],["w7-verify-milestone","nav-map","nav","w3-map-home"],["w7-verify-milestone","nav-tasks","nav","w7-tasks"],["w7-verify-milestone","nav-portfolio","nav","w8-portfolio"],["w7-verify-milestone","title","nav","w3-map-home"],["s2-users","nav-map","nav","w3-map-home"],["s2-users","nav-tasks","nav","w7-tasks"],["s2-users","nav-portfolio","nav","w8-portfolio"],["s2-users","title","nav","w3-map-home"],["s2-users-invited","nav-map","nav","w3-map-home"],["s2-users-invited","nav-tasks","nav","w7-tasks"],["s2-users-invited","nav-portfolio","nav","w8-portfolio"],["s2-users-invited","title","nav","w3-map-home"],["s1-organisations","nav-map","nav","w3-map-home"],["s1-organisations","nav-tasks","nav","w7-tasks"],["s1-organisations","nav-portfolio","nav","w8-portfolio"],["s1-organisations","title","nav","w3-map-home"],["w6-geography","link/add-station","nav","w6-geography"]];
  storage.build7 = async (n) => { await U.onPage("07 Prototype"); const done = []; for (const [k, x, y] of storage.LAYOUT7) { if (storage.P7[k]) continue; if (done.length >= n) break; storage.P7[k] = await SB[k](x, y); done.push(k); } return {done, left: storage.LAYOUT7.filter(([k]) => !storage.P7[k]).length}; };
  storage.b7 = k => penpot.currentPage.getShapeById(storage.P7[k]);
  storage.els = (k, name, all) => { const b = storage.b7(k); if (!b) return []; const hits = penpotUtils.findShapes(s => s.name.replace(/\s/g, "") === name.replace(/\s/g, "") && storage.vis(s, b), b); return all ? hits : hits.slice(0, 1); };
  storage.act = (kind, to) => kind === "nav" ? {type: "navigate-to", destination: storage.b7(to)} : kind === "ovl" ? {type: "open-overlay", destination: storage.b7(to), position: "center", closeWhenClickOutside: true, addBackgroundOverlay: true} : kind === "prev" ? {type: "previous-screen"} : {type: "close-overlay"};
  storage.wire7 = (rows) => { const miss = []; let n = 0; for (const [from, el, kind, to, all] of rows) { const ss = storage.els(from, el, all); if (!ss.length) { miss.push(`${from}:${el}`); continue; } for (const s of ss) { const ex = (s.interactions || []).find(i => i.trigger === "click"); const a = storage.act(kind, to); if (ex) ex.action = a; else s.addInteraction("click", a); n++; } storage.WIRES7.push([from, el, kind, to]); } return {n, miss}; };
  storage.qaBoard = (b) => {
  const vis = s => storage.vis(s, b);
  const all = penpotUtils.findShapes(s => true, b).filter(vis);
  const texts = all.filter(s => s.type === "text");
  const bg = s => { const halo = s.parent && s.parent.children.find(x => x.name === s.name + "-halo"); if (halo || /-halo$/.test(s.name)) return null; let p = s.parent; while (p) { if (p.type !== "group") { const f = (p.fills || []).find(x => x.fillOpacity > 0.5 && x.fillColor); if (f) return f.fillColor; } p = p.parent; } return "#FFFFFF"; };
  const r = {texts: texts.length, small: [], low: [], noTok: 0, ov: []};
  for (const t of texts) {
    if (+t.fontSize < 13) r.small.push(t.name + "=" + t.fontSize);
    const g = bg(t), fg = (t.fills[0] || {}).fillColor; if (g && fg) { const c = U.cr(fg.toUpperCase(), g.toUpperCase()); if (c < 4.5) r.low.push(`${t.name} ${fg}/${g} ${c.toFixed(1)}`); }
    let inInst = false, p = t.parent; while (p && p.id !== b.id) { if (p.isComponentInstance && p.isComponentInstance()) { inInst = true; break; } p = p.parent; }
    if (!inInst && !(t.tokens && t.tokens.typography)) r.noTok++;
  }
  const own = texts.filter(t => !/-halo$/.test(t.name));
  const bb = t => t.textBounds || t.bounds;
  if (own.length < 260) for (let i = 0; i < own.length; i++) for (let j = i + 1; j < own.length; j++) { const a = bb(own[i]), c = bb(own[j]); const ox = Math.min(a.x + a.width, c.x + c.width) - Math.max(a.x, c.x), oy = Math.min(a.y + a.height, c.y + c.height) - Math.max(a.y, c.y); if (ox > 2 && oy > 2) r.ov.push(`${own[i].name} × ${own[j].name}`); }
  r.out = own.filter(t => { const a = bb(t); return a.x < b.x - 1 || a.y < b.y - 1 || a.x + a.width > b.x + b.width + 1 || a.y + a.height > b.y + b.height + 1; }).length;
  r.instances = all.filter(s => s.isComponentInstance && s.isComponentInstance()).length;
  r.untokFill = all.filter(s => { if (s.type === "group" || s.type === "text") return false; let p = s.parent, inInst = s.isComponentInstance && s.isComponentInstance(); while (p && p.id !== b.id && !inInst) { if (p.isComponentInstance && p.isComponentInstance()) inInst = true; p = p.parent; } return !inInst && s.id !== b.id && (s.fills || []).some(f => f.fillOpacity > 0 && f.fillColor) && !(s.tokens && s.tokens.fill); }).map(s => s.name).slice(0, 4);
  return r;
};
  storage.resilientW3 = (b) => {
  const map = b.children.find(c => c.name === "map"); if (!map) return "no map";
  const f = n => map.children.find(c => c.name.replace(/\s/g, "").startsWith(n));
  if (!f("controls/right")) {
    const np = f("controls/new-project"), dr = f("controls/drafts");
    const row = U.fx(map, "controls/right", {x: 1100 - 24 - 420, y: 16, w: 420, hs: "fix", gap: "spacing.12", justify: "end"}); row.y = map.y + 16;
    row.appendChild(dr); row.appendChild(np);
    const at = f("attribution"); const ar = U.fx(map, "attribution-row", {x: 1100 - 24 - 420, y: 956 - 16 - 40, w: 420, h: 40, hs: "fix", vs: "fix", justify: "end", align: "end"}); ar.appendChild(at);
  }
  const card = penpotUtils.findShape(s => /project-card/.test(s.name), map);
  if (card) { const sr = penpotUtils.findShape(s => s.name.replace(/\s/g, "") === "status-row", card); if (sr) sr.flex.wrap = "wrap"; penpotUtils.findShapes(s => s.type === "text" && /(gate|blocker|text|name)$/.test(s.name.replace(/\s/g, "")), card).forEach(t => { if (t.parent && t.parent.flex) { t.layoutChild.horizontalSizing = "fill"; t.growType = "auto-height"; } }); const bl = penpotUtils.findShape(s => s.name.replace(/\s/g, "") === "blocker", card); if (bl) bl.layoutChild.horizontalSizing = "fill"; }
  return "ok";
};
  storage.resilientM2 = (b) => {
  penpotUtils.findShapes(s => s.type === "text" && /^(title|state|hint)$/.test(s.name.replace(/\s/g, "")) && s.parent && /title-row|todays-report|milestones/.test(s.parent.name), b).forEach(t => { t.layoutChild.horizontalSizing = "fill"; t.growType = "auto-height"; });
  penpotUtils.findShapes(s => s.name.replace(/\s/g, "") === "title-row", b).forEach(r => { r.layoutChild.horizontalSizing = "fill"; });
  const hh = b.children.find(c => c.name === "home-header");
  if (hh) penpotUtils.findShapes(s => s.type === "text", hh).forEach(t => { if (t.parent && t.parent.flex && t.parent.name !== "menu") { t.layoutChild.horizontalSizing = "fill"; t.growType = "auto-height"; } });
  return "ok";
};
}
// Rewire everything: installUI3(storage); storage.wire7(storage.WIRES7_TABLE)
// QA a page: penpot.currentPage.root.children.filter(s => s.type === 'board').map(b => [b.name, storage.qaBoard(b)])
// Large text check: switch the Mode theme to Large text, open each page in turn, then switch back to Light (layout only reflows on the open page).

// ==== Large text fixes and the switch to Outfit (29 Oct 2026) ====
// Design System file: paste installDS2 above, run it, then dsLargeTextFixes(storage). Each step needs its page open.
// UI file: uiLargeTextFixes(storage) re-applies the same layout to existing instances, because instances whose
// text was overridden keep their old geometry and do not pick the fixes up from the library.
// Penpot only re-measures text that is in the viewport: after a theme or font change, open each page and call
// penpot.viewport.zoomToFitAll(), or zoomIntoView([shape]) for one part, before reading sizes or exporting.
// Setting layoutChild.minHeight can flip a flex board's own verticalSizing to "fix"; set it back to "auto" afterwards.
async function dsLargeTextFixes(storage) {
  const D = storage.D, nm = s => s.name.replace(/\s/g, "");
  const wrapT = t => { if (t.parent && t.parent.flex) t.layoutChild.horizontalSizing = "fill"; t.growType = "auto-height"; };
  // font: one token feeds every typography token; library typographies are set to the matching Outfit weight
  const ft = D.T().sets.find(s => s.name === "core").tokens.find(k => k.name === "font.family.ui"); ft.value = ["Outfit"];
  const outfit = penpot.fonts.all.find(f => f.name === "Outfit");
  for (const y of penpot.library.local.typographies) y.setFont(outfit, outfit.variants.find(v => String(v.fontWeight) === String(y.fontWeight || "400")));
  // molecules/person-line: text column fills and wraps, the line wraps the phone below when narrow
  await D.onPage("05 Molecules");
  for (const c of penpot.library.local.components.filter(c => c.name === "person-line")) {
    const m = c.mainInstance(), tx = m.children.find(k => nm(k) === "text");
    m.flex.alignItems = "center"; m.flex.wrap = "wrap"; m.flex.verticalSizing = "auto";
    tx.layoutChild.horizontalSizing = "fill"; tx.layoutChild.minWidth = 120; tx.flex.verticalSizing = "auto"; tx.flex.alignItems = "stretch"; tx.children.filter(k => k.type === "text").forEach(wrapT);
  }
  // molecules/table-row body: hug the content with spacing.12 above and below (48 px for one line)
  const tr = penpot.library.local.components.find(c => c.name === "table-row");
  for (const v of tr.variants.variantComponents()) { if (v.variantProps.kind === "header") continue; const m = v.mainInstance(); m.flex.topPadding = m.flex.bottomPadding = 12; D.apply(m, "spacing.12", ["paddingTop", "paddingBottom"]); m.flex.verticalSizing = "auto"; }
  // molecules/shortcut-tile (new): the m2-home Today's report and Milestones tiles
  if (!penpot.library.local.components.find(c => c.name === "shortcut-tile")) {
    const y0 = Math.ceil(Math.max(...penpot.root.children.map(s => s.y + s.height)) / 100) * 100 + 200;
    const tile = D.fx(null, "shortcut-tile", {x: 0, y: y0, w: 175, hs: "fix", dir: "column", align: "stretch", px: "spacing.16", py: "spacing.12", gap: "spacing.4", fill: "card.bg", stroke: "color.border.strong", radius: "card.radius"});
    const r1 = D.fx(tile, "title-row", {gap: "spacing.8", align: "start", fillW: true});
    D.ic(r1, "document", "color.text.brand", 20); D.tx(r1, "title", "Today's report", "type.phone.body-strong", "color.text.primary", {fillW: true});
    D.tx(tile, "state", "Not sent", "type.phone.label", "color.text.primary", {fillW: true}); D.tx(tile, "hint", "Prefilled · due 4 pm", "type.phone.caption", "color.text.secondary", {fillW: true});
    await D.flush(); D.mk(tile, "molecules", "shortcut-tile");
    D.text(penpot.root, "heading/molecules-shortcut-tile", 0, y0 - 48, "molecules/shortcut-tile", "type.title-sm", "color.text.secondary"); await D.flush();
  }
  // organisms/project-card-panel: nested person line, blocker, status row, figures all wrap and grow
  await D.onPage("06 Organisms");
  const card = penpot.library.local.components.find(c => c.name === "project-card-panel").mainInstance();
  const ic = card.children.find(k => nm(k) === "in-charge"); ic.flex.wrap = "wrap"; ic.layoutChild.minHeight = 48; ic.flex.verticalSizing = "auto";
  const it = ic.children.find(k => nm(k) === "text"); it.layoutChild.horizontalSizing = "fill"; it.layoutChild.minWidth = 120; it.flex.alignItems = "stretch"; it.children.filter(k => k.type === "text").forEach(wrapT);
  const bl = card.children.find(k => nm(k) === "blocker"); bl.flex.alignItems = "start"; bl.layoutChild.minHeight = 24; bl.flex.verticalSizing = "auto"; bl.children.filter(k => k.type === "text").forEach(wrapT);
  const sr = card.children.find(k => nm(k) === "status-row"); sr.flex.wrap = "wrap"; sr.children.filter(k => k.type === "text").forEach(wrapT);
  wrapT(card.children.find(k => nm(k) === "physical-financial"));
  // templates/phone-home and phone-form: variant sets with size 844 | tall (390x1200); sticky status bar and header; body fills
  await D.onPage("07 Templates");
  for (const [n, hdrs, slot] of [["phone-home", ["organisms/phone-status-bar", "organisms/phone-home-header"], "slot/content"], ["phone-form", ["organisms/phone-status-bar", "top-bar"], "slot/form"]]) {
    let c = penpot.library.local.components.find(c => c.name === n && c.path.replace(/\s/g, "") === "templates");
    if (!(c.isVariant && c.isVariant())) { c.transformInVariant(); await new Promise(r => setTimeout(r, 600)); c = penpot.library.local.components.find(x => x.id === c.id); }
    const v = c.variants; if (v.properties[0] !== "size") v.renameProperty(0, "size"); c.setVariantProperty(0, "844");
    if (v.variantComponents().length < 2) { v.addVariant(); await new Promise(r => setTimeout(r, 800)); }
    const tall = v.variantComponents().find(x => x.id !== c.id); tall.setVariantProperty(0, "tall"); tall.mainInstance().resize(390, 1200);
    for (const vc of v.variantComponents()) { const m = vc.mainInstance(); m.children.filter(k => hdrs.includes(nm(k))).forEach(k => k.fixedWhenScrolling = true); const s = m.children.find(k => nm(k) === slot); s.layoutChild.minHeight = 0; s.layoutChild.verticalSizing = "fill"; m.flex.verticalSizing = "fix"; }
  }
  return await D.flush();
}

// UI file. Run on each page in turn (the page must be open): storage.fixPage() fixes card, person-line and table-row instances.
function uiLargeTextFixes(storage) {
  const T = () => penpot.library.local.tokens;
  storage.tok = n => { for (const s of T().sets.filter(s => s.active).reverse()) { const t = s.tokens.find(x => x.name === n); if (t) return t; } throw new Error("no token " + n); };
  storage.nm = s => s.name.replace(/\s/g, "");
  storage.compName = s => { try { const c = s.isComponentInstance() && s.component(); return c ? c.name : null; } catch (e) { return null; } };
  storage.wrapT = t => { if (t.parent && t.parent.flex) t.layoutChild.horizontalSizing = "fill"; t.growType = "auto-height"; };
  storage.fixPL = (pl) => { const nm = storage.nm; pl.flex.wrap = "wrap"; if (pl.layoutChild) pl.layoutChild.minHeight = 48; pl.flex.verticalSizing = "auto";
    const tx = pl.children.find(k => nm(k) === "text"); if (tx) { tx.layoutChild.horizontalSizing = "fill"; tx.layoutChild.minWidth = 120; tx.flex.alignItems = "stretch"; tx.flex.verticalSizing = "auto"; tx.children.filter(k => k.type === "text").forEach(storage.wrapT); } };
  storage.fixCard = (card) => { const nm = storage.nm;
    const ic = card.children.find(k => nm(k) === "in-charge"); if (ic) storage.fixPL(ic);
    const bl = card.children.find(k => nm(k) === "blocker"); if (bl) { bl.flex.alignItems = "start"; bl.layoutChild.minHeight = 24; bl.flex.verticalSizing = "auto"; bl.children.filter(k => k.type === "text").forEach(storage.wrapT); }
    const sr = card.children.find(k => nm(k) === "status-row"); if (sr) { sr.flex.wrap = "wrap"; sr.flex.verticalSizing = "auto"; sr.children.filter(k => k.type === "text").forEach(storage.wrapT); }
    const pf = card.children.find(k => nm(k) === "physical-financial"); if (pf) storage.wrapT(pf);
    const name = card.children.find(k => nm(k) === "name" && k.type === "text"); if (name) storage.wrapT(name);
    penpotUtils.findShapes(s => s.type === "text" && nm(s) === "label" && s.parent && /^discipline-/.test(nm(s.parent)), card).forEach(t => t.growType = "auto-height"); };
  storage.fixRow = (r) => { r.flex.topPadding = 12; r.flex.bottomPadding = 12; r.applyToken(storage.tok("spacing.12"), ["paddingTop", "paddingBottom"]); r.flex.verticalSizing = "auto"; };
  storage.fixPage = () => { const cnt = {card: 0, pl: 0, row: 0};
    for (const s of penpotUtils.findShapes(s => s.type === "board" && s.isComponentInstance(), penpot.root)) { const c = storage.compName(s);
      if (c === "project-card-panel") { storage.fixCard(s); cnt.card++; }
      else if (c === "person-line") { storage.fixPL(s); cnt.pl++; }
      else if (c === "table-row") { let kind = null; try { kind = s.component().variantProps.kind; } catch (e) {} if (kind === "body") { storage.fixRow(s); cnt.row++; } } }
    return cnt; };
  // m2-home tiles: insert molecules/shortcut-tile instances where the hand-drawn tiles were, copy text, icon and links, hide the old tile as archive/<name>
  storage.swapTiles = (b) => { const nm = storage.nm, lib = penpot.library.connected.find(l => /Design System/.test(l.name));
    const tileC = lib.components.find(c => c.name === "shortcut-tile"), flag = lib.components.find(c => c.name === "flag" && c.path.replace(/\s/g, "") === "icon");
    const sc = penpotUtils.findShape(s => nm(s) === "shortcuts", b); const res = [];
    for (const old of sc.children.filter(k => !k.hidden && !k.isComponentInstance())) {
      const key = nm(old).replace(/^btn\//, ""), get = n => { const t = penpotUtils.findShape(s => s.type === "text" && nm(s) === n, old); return t ? t.characters : ""; };
      const inst = tileC.instance(); sc.insertChild(sc.children.indexOf(old), inst); inst.name = "btn/" + key; inst.layoutChild.horizontalSizing = "fill"; inst.layoutChild.minHeight = 104;
      for (const k of ["title", "state", "hint"]) { const t = penpotUtils.findShape(s => s.type === "text" && nm(s) === k, inst), v = get(k); if (t && v) t.characters = v; }
      if (key === "milestones") penpotUtils.findShape(s => /^icon\//.test(nm(s)), inst).swapComponent(flag);
      for (const it of (old.interactions || [])) inst.addInteraction(it.trigger, it.action, it.delay);
      old.hidden = true; old.name = "archive/btn-" + key; res.push(key);
    }
    // flex order follows the children array (index 0 first): put Today's report before Milestones
    ["btn/todays-report", "btn/milestones"].forEach((n, i) => { const t = sc.children.find(k => nm(k) === n && !k.hidden); if (t) sc.insertChild(i, t); });
    // the library tile wraps "Today's report" onto two lines; Take photo goes from 128 to 104 so Call support clears the home indicator
    const tp = sc.parent.children.find(k => !k.hidden && /take-photo/.test(k.name)); if (tp && tp.height > 104) tp.resize(tp.width, 104);
    return res; };
  // The m2 Large text proof board copies templates/phone-home size=tall: 390x1200, flex column, status bar and header fixed when scrolling, content fills.
  storage.tallProof = (b) => { b.resize(390, 1200); const fl = b.addFlexLayout(); fl.dir = "column"; fl.alignItems = "stretch"; fl.rowGap = 0; fl.horizontalSizing = "fix"; fl.verticalSizing = "fix";
    ["status-bar", "home-header", "content", "home-indicator"].forEach((n, i) => b.insertChild(i, b.children.find(k => k.name === n)));
    b.children.find(k => k.name === "status-bar").fixedWhenScrolling = true; b.children.find(k => k.name === "home-header").fixedWhenScrolling = true;
    b.children.find(k => k.name === "content").layoutChild.verticalSizing = "fill"; };
}

// QA used on 29 Oct 2026 after the switch to Outfit (UI file). Per page: await storage.qaPage().
// It zooms to fit (so Penpot re-measures text), nudges flex boards whose text has outgrown them, then reports per board:
// small (< 13 px), low (< 4.5:1), ov (text boxes overlapping), spill (text outside its flex parent), out (outside the board), noTok, inter (not Outfit).
function installQA(storage) {
  const L = h => { const c = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(v => v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
  storage.cr = (a, b) => { const [x, y] = [L(a), L(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
  storage.vis = (s, top) => { let p = s; while (p && p.id !== top.id) { if (p.hidden) return false; p = p.parent; } return true; };
  const outside = (t, p) => t.x < p.x - 1 || t.y < p.y - 1 || t.x + t.width > p.x + p.width + 1 || t.y + t.height > p.y + p.height + 1;
  storage.nudge = (b) => { let n = 0; for (const t of penpotUtils.findShapes(s => s.type === "text" && storage.vis(s, b), b)) { const p = t.parent; if (!p || p.type !== "board" || !p.flex || p.id === b.id || !outside(t, p)) continue; for (const ax of ["horizontalSizing", "verticalSizing"]) if (p.flex[ax] === "auto") { p.flex[ax] = "fix"; p.flex[ax] = "auto"; } n++; } return n; };
  storage.qaBoard = (b) => {
    const texts = penpotUtils.findShapes(s => s.type === "text" && storage.vis(s, b), b);
    const bg = s => { if (/-halo$/.test(s.name) || (s.parent && s.parent.children.find(x => x.name === s.name + "-halo"))) return null; let p = s.parent; while (p) { if (p.type !== "group") { const f = (p.fills || []).find(x => x.fillOpacity > 0.5 && x.fillColor); if (f) return f.fillColor; } p = p.parent; } return "#FFFFFF"; };
    const r = {small: [], low: [], noTok: 0, ov: [], inter: 0, spill: [], out: []};
    for (const t of texts) {
      if (String(t.fontFamily) !== "Outfit") r.inter++;
      if (+t.fontSize < 13) r.small.push(t.name);
      const g = bg(t), fg = (t.fills[0] || {}).fillColor; if (g && fg && storage.cr(fg.toUpperCase(), g.toUpperCase()) < 4.5) r.low.push(t.name);
      let inInst = false, p = t.parent; while (p && p.id !== b.id) { if (p.isComponentInstance && p.isComponentInstance()) { inInst = true; break; } p = p.parent; }
      if (!inInst && !(t.tokens && t.tokens.typography)) r.noTok++;
      const q = t.parent; if (q && q.type === "board" && q.flex && q.id !== b.id && outside(t, q)) r.spill.push(q.name.trim() + ">" + t.name.trim());
      if (!/-halo$/.test(t.name) && outside(t, b)) r.out.push(t.name.trim());
    }
    const own = texts.filter(t => !/-halo$/.test(t.name));
    if (own.length < 260) for (let i = 0; i < own.length; i++) for (let j = i + 1; j < own.length; j++) { const a = own[i], c = own[j]; if (Math.min(a.x + a.width, c.x + c.width) - Math.max(a.x, c.x) > 2 && Math.min(a.y + a.height, c.y + c.height) - Math.max(a.y, c.y) > 2) r.ov.push(`${a.name.trim()} × ${c.name.trim()}`); }
    return r;
  };
  storage.qaPage = async () => { penpot.viewport.zoomToFitAll(); await new Promise(r => setTimeout(r, 2500));
    const boards = penpot.currentPage.root.children.filter(s => s.type === "board" && /^(screens|overlays|proof)/.test(s.name.replace(/\s/g, "")));
    for (const b of boards) storage.nudge(b); await new Promise(r => setTimeout(r, 1500));
    const res = {}; for (const b of boards) { const q = storage.qaBoard(b), issues = {}; for (const k of ["small", "low", "ov", "spill", "out"]) if (q[k].length) issues[k] = q[k].slice(0, 5); if (q.noTok) issues.noTok = q.noTok; if (q.inter) issues.inter = q.inter; res[b.name.replace(/\s/g, "")] = Object.keys(issues).length ? issues : "ok"; }
    return res; };
}
