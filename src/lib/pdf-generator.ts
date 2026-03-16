import jsPDF from 'jspdf';

type RGB = readonly [number, number, number];
type PDF = jsPDF;

// ──── Colors ────
const C = {
  blue:     [37, 99, 235]  as RGB,
  purple:   [147, 51, 234] as RGB,
  yellow:   [202, 138, 4]  as RGB,
  cyan:     [8, 145, 178]  as RGB,
  pink:     [219, 39, 119] as RGB,
  green:    [22, 163, 74]  as RGB,
  red:      [220, 38, 38]  as RGB,
  dark:     [15, 23, 42]   as RGB,
  card:     [248, 250, 252] as RGB,   // slate-50
  border:   [226, 232, 240] as RGB,   // slate-200
  text:     [30, 41, 59]   as RGB,    // slate-800
  textMid:  [71, 85, 105]  as RGB,    // slate-600
  muted:    [148, 163, 184] as RGB,   // slate-400
  white:    [255, 255, 255] as RGB,
  bg:       [255, 255, 255] as RGB,
};

// ──── Helpers ────
const tc = (d: PDF, c: RGB) => d.setTextColor(c[0], c[1], c[2]);
const fc = (d: PDF, c: RGB) => d.setFillColor(c[0], c[1], c[2]);
const dc = (d: PDF, c: RGB) => d.setDrawColor(c[0], c[1], c[2]);

function rr(d: PDF, x: number, y: number, w: number, h: number, r: number, fill: RGB, border?: RGB) {
  fc(d, fill);
  if (border) { dc(d, border); d.roundedRect(x, y, w, h, r, r, 'FD'); }
  else d.roundedRect(x, y, w, h, r, r, 'F');
}

function wrap(d: PDF, t: string, w: number): string[] {
  return d.splitTextToSize(t || '', w);
}

function pageBreak(d: PDF, y: number, need: number, topMargin: number): number {
  if (y + need > d.internal.pageSize.getHeight() - 15) {
    d.addPage();
    return topMargin;
  }
  return y;
}

// ──── Page chrome ────
function drawPageHeader(d: PDF, pw: number, subtitle: string) {
  fc(d, C.dark); d.rect(0, 0, pw, 22, 'F');
  fc(d, C.blue); d.rect(0, 22, pw, 1, 'F');
  d.setFont('helvetica', 'bold'); d.setFontSize(13);
  tc(d, C.white); d.text('BetterThanLeet', 15, 14);
  d.setFont('helvetica', 'normal'); d.setFontSize(8);
  tc(d, C.muted); d.text(subtitle, pw - 15, 14, { align: 'right' });
}

function drawPageFooter(d: PDF, pw: number, ph: number, pg: number) {
  d.setFont('helvetica', 'normal'); d.setFontSize(7); tc(d, C.muted);
  const dt = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  d.text(`Generated ${dt}  |  Confidential`, 15, ph - 8);
  d.text(`Page ${pg}`, pw - 15, ph - 8, { align: 'right' });
}

function finalize(d: PDF, subtitle: string) {
  const pw = d.internal.pageSize.getWidth();
  const ph = d.internal.pageSize.getHeight();
  const n = d.getNumberOfPages();
  for (let i = 1; i <= n; i++) {
    d.setPage(i);
    drawPageHeader(d, pw, subtitle);
    drawPageFooter(d, pw, ph, i);
  }
}

// ──── Section heading ────
function heading(d: PDF, title: string, y: number, color: RGB, m: number): number {
  y = pageBreak(d, y, 12, 30);
  fc(d, color); d.rect(m, y, 3, 8, 'F');
  d.setFont('helvetica', 'bold'); d.setFontSize(11);
  tc(d, C.text); d.text(title, m + 7, y + 6);
  return y + 12;
}

// ──── Score chip (compact) ────
function scoreChip(d: PDF, score: number, x: number, y: number, w: number, label: string) {
  const color = score >= 8 ? C.green : score >= 5 ? C.yellow : C.red;
  rr(d, x, y, w, 22, 3, color);
  d.setFont('helvetica', 'bold'); d.setFontSize(16);
  tc(d, C.white); d.text(`${score}/10`, x + w / 2, y + 11, { align: 'center' });
  d.setFont('helvetica', 'normal'); d.setFontSize(6.5);
  d.text(label, x + w / 2, y + 18, { align: 'center' });
}

// ════════════════════════════════════════════════════
// INTERVIEW REPORT
// ════════════════════════════════════════════════════
export function generateInterviewReportPDF(report: {
  executiveSummary: string;
  technicalEvaluation: { score: number; summary: string; strengths: string[]; weaknesses: string[] };
  communicationEvaluation: { score: number; summary: string; strengths: string[]; weaknesses: string[] };
  problemSolvingEvaluation: { score: number; summary: string; strengths: string[]; weaknesses: string[] };
  hireRecommendation: string;
  finalFeedback: string;
}, integrity: {
  blurCount: number;
  pasteCount: number;
  largePasteEvents: { timestamp: number; length: number }[];
}, integrityScore: number, testResults: { testsPassed: number; testsTotal: number }[]) {

  const d = new jsPDF({ unit: 'mm', format: 'a4' });
  const pw = d.internal.pageSize.getWidth();  // 210
  const m = 15;  // margin
  const cw = pw - 2 * m; // content width ~180
  let y = 28; // start below header area

  // ── Title row ──
  d.setFont('helvetica', 'bold'); d.setFontSize(18);
  tc(d, C.text); d.text('Interview Report', m, y);

  const rec = (report.hireRecommendation || 'PENDING').replace(/_/g, ' ');
  const isHire = rec.includes('HIRE') && !rec.includes('NO');
  const badgeC = isHire ? C.green : C.red;
  d.setFontSize(9);
  const bw = d.getTextWidth(rec) + 10;
  rr(d, pw - m - bw, y - 7, bw, 10, 2, badgeC);
  tc(d, C.white); d.text(rec, pw - m - bw / 2, y - 1, { align: 'center' });

  y += 5;

  // ── Score overview row ──
  y = pageBreak(d, y, 28, 30);
  const chipW = (cw - 9) / 4;
  scoreChip(d, report.technicalEvaluation.score, m, y, chipW, 'Technical');
  scoreChip(d, report.communicationEvaluation.score, m + chipW + 3, y, chipW, 'Communication');
  scoreChip(d, report.problemSolvingEvaluation.score, m + 2 * (chipW + 3), y, chipW, 'Problem Solving');
  const intC = integrityScore > 70 ? C.green : integrityScore > 40 ? C.yellow : C.red;
  scoreChip(d, Math.round(integrityScore / 10), m + 3 * (chipW + 3), y, chipW, 'Integrity');
  y += 26;

  // ── Executive Summary ──
  y = heading(d, 'Executive Summary', y, C.blue, m);
  const sumLines = wrap(d, report.executiveSummary, cw - 12);
  const sumH = sumLines.length * 4 + 8;
  y = pageBreak(d, y, sumH, 30);
  rr(d, m, y, cw, sumH, 2, C.card, C.border);
  d.setFont('helvetica', 'normal'); d.setFontSize(9);
  tc(d, C.text); d.text(sumLines, m + 6, y + 6);
  y += sumH + 4;

  // ── Evaluation sections ──
  const drawEval = (title: string, ev: { score: number; summary: string; strengths: string[]; weaknesses: string[] }, color: RGB) => {
    y = heading(d, `${title}  —  ${ev.score}/10`, y, color, m);

    // Summary text
    d.setFont('helvetica', 'normal'); d.setFontSize(8.5);
    tc(d, C.textMid);
    const sl = wrap(d, ev.summary, cw - 8);
    y = pageBreak(d, y, sl.length * 3.8 + 4, 30);
    d.text(sl, m + 4, y + 3);
    y += sl.length * 3.8 + 3;

    // Two-column: strengths | weaknesses
    const colW = (cw - 6) / 2;

    // Calculate heights for both columns
    let sH = 0, wH = 0;
    const sItems: string[][] = [];
    const wItems: string[][] = [];
    d.setFontSize(8);
    for (const s of ev.strengths) {
      const lines = wrap(d, s, colW - 12);
      sItems.push(lines);
      sH += lines.length * 3.5 + 2;
    }
    for (const w of ev.weaknesses) {
      const lines = wrap(d, w, colW - 12);
      wItems.push(lines);
      wH += lines.length * 3.5 + 2;
    }
    const boxH = Math.max(sH, wH) + 14;
    y = pageBreak(d, y, boxH, 30);

    // Strengths box
    rr(d, m, y, colW, boxH, 2, C.card, C.border);
    fc(d, C.green); d.rect(m, y, 2, boxH, 'F');
    d.setFont('helvetica', 'bold'); d.setFontSize(7.5);
    tc(d, C.green); d.text('STRENGTHS', m + 6, y + 6);
    let sy = y + 11;
    d.setFont('helvetica', 'normal'); d.setFontSize(8);
    tc(d, C.text);
    for (const lines of sItems) {
      fc(d, C.green); d.circle(m + 7, sy + 0.5, 1, 'F');
      d.text(lines, m + 11, sy + 2);
      sy += lines.length * 3.5 + 2;
    }

    // Weaknesses box
    const wx = m + colW + 6;
    rr(d, wx, y, colW, boxH, 2, C.card, C.border);
    fc(d, C.red); d.rect(wx, y, 2, boxH, 'F');
    d.setFont('helvetica', 'bold'); d.setFontSize(7.5);
    tc(d, C.red); d.text('AREAS TO IMPROVE', wx + 6, y + 6);
    let wy = y + 11;
    d.setFont('helvetica', 'normal'); d.setFontSize(8);
    tc(d, C.text);
    for (const lines of wItems) {
      fc(d, C.red); d.circle(wx + 7, wy + 0.5, 1, 'F');
      d.text(lines, wx + 11, wy + 2);
      wy += lines.length * 3.5 + 2;
    }

    y += boxH + 4;
  };

  drawEval('Technical Skills', report.technicalEvaluation, C.purple);
  drawEval('Communication', report.communicationEvaluation, C.yellow);
  drawEval('Problem Solving', report.problemSolvingEvaluation, C.cyan);

  // ── Integrity ──
  y = heading(d, 'Integrity & Metrics', y, intC, m);
  y = pageBreak(d, y, 28, 30);

  rr(d, m, y, cw, 24, 2, C.card, C.border);

  // Trust score
  d.setFont('helvetica', 'bold'); d.setFontSize(20);
  tc(d, intC); d.text(`${integrityScore}%`, m + 22, y + 12, { align: 'center' });
  d.setFont('helvetica', 'normal'); d.setFontSize(6.5);
  tc(d, C.muted); d.text('TRUST SCORE', m + 22, y + 18, { align: 'center' });

  // Tests passed
  const testStr = testResults.length > 0
    ? `${testResults[testResults.length - 1].testsPassed}/${testResults[testResults.length - 1].testsTotal}`
    : '-';
  d.setFont('helvetica', 'bold'); d.setFontSize(20);
  tc(d, C.blue); d.text(testStr, m + 60, y + 12, { align: 'center' });
  d.setFont('helvetica', 'normal'); d.setFontSize(6.5);
  tc(d, C.muted); d.text('TESTS PASSED', m + 60, y + 18, { align: 'center' });

  // Detail list
  const dx = m + 95;
  d.setFont('helvetica', 'normal'); d.setFontSize(8);
  const details: [string, number, RGB][] = [
    [`Tab Switches: ${integrity.blurCount}`, integrity.blurCount, integrity.blurCount > 5 ? C.red : integrity.blurCount > 2 ? C.yellow : C.green],
    [`Paste Events: ${integrity.pasteCount}`, integrity.pasteCount, integrity.pasteCount > 3 ? C.yellow : C.green],
    [`Large Pastes: ${integrity.largePasteEvents.length}`, integrity.largePasteEvents.length, integrity.largePasteEvents.length > 0 ? C.red : C.green],
  ];
  details.forEach(([txt, , clr], i) => {
    const iy = y + 8 + i * 6;
    fc(d, clr); d.circle(dx, iy, 1.5, 'F');
    tc(d, C.text); d.text(txt, dx + 4, iy + 1);
  });

  y += 28;

  // ── Final Feedback ──
  y = heading(d, 'Final Feedback', y, C.pink, m);
  const fbLines = wrap(d, `"${report.finalFeedback || ''}"`, cw - 12);
  const fbH = fbLines.length * 4 + 8;
  y = pageBreak(d, y, fbH, 30);
  rr(d, m, y, cw, fbH, 2, C.card, C.border);
  fc(d, C.pink); d.rect(m, y, 2, fbH, 'F');
  d.setFont('helvetica', 'italic'); d.setFontSize(9);
  tc(d, C.textMid); d.text(fbLines, m + 6, y + 6);
  y += fbH + 4;

  // ── Finalize ──
  finalize(d, 'AI Technical Interview Report');
  d.save(`BetterThanLeet_Interview_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}

// ════════════════════════════════════════════════════
// PRACTICE REPORT
// ════════════════════════════════════════════════════
export function generatePracticeReportPDF(feedback: {
  overallScore: number;
  overallLevel: string;
  categories: {
    problemSolving: { score: number; level: string; description: string };
    codeQuality: { score: number; level: string; description: string };
    communication: { score: number; level: string; description: string };
    optimization: { score: number; level: string; description: string };
  };
  strengths: string[];
  improvementPlan: { area: string; priority: string; suggestion: string; resources?: string[] }[];
  recommendedProblems: { title: string; difficulty: string; reason: string; tags: string[] }[];
  encouragement: string;
}, testResults: { testsPassed: number; testsTotal: number }[], transcriptLength: number, codeQualityScore?: number, companyName?: string) {

  const d = new jsPDF({ unit: 'mm', format: 'a4' });
  const pw = d.internal.pageSize.getWidth();
  const m = 15;
  const cw = pw - 2 * m;
  let y = 28;

  // ── Title ──
  d.setFont('helvetica', 'bold'); d.setFontSize(18);
  tc(d, C.text); d.text('Practice Session Report', m, y);

  d.setFontSize(9);
  const lvl = feedback.overallLevel;
  const lbw = d.getTextWidth(lvl) + 10;
  rr(d, pw - m - lbw, y - 7, lbw, 10, 2, C.blue);
  tc(d, C.white); d.text(lvl, pw - m - lbw / 2, y - 1, { align: 'center' });
  y += 5;

  // ── Overall score ──
  rr(d, m, y, cw, 18, 2, C.card, C.border);
  fc(d, C.blue); d.rect(m, y, 3, 18, 'F');
  d.setFont('helvetica', 'bold'); d.setFontSize(18);
  tc(d, C.blue); d.text(`${feedback.overallScore}/10`, m + 12, y + 12);
  d.setFont('helvetica', 'normal'); d.setFontSize(9);
  tc(d, C.text); d.text('Overall Performance', m + 38, y + 9);
  d.setFontSize(7.5); tc(d, C.muted);
  d.text("You're on the path to becoming a stronger coder!", m + 38, y + 15);
  y += 22;

  // ── Skill Breakdown ──
  y = heading(d, 'Skill Breakdown', y, C.blue, m);
  const cats = [
    { name: 'Problem Solving', ...feedback.categories.problemSolving, color: C.yellow },
    { name: 'Code Quality', ...feedback.categories.codeQuality, color: C.purple },
    { name: 'Communication', ...feedback.categories.communication, color: C.cyan },
    { name: 'Optimization', ...feedback.categories.optimization, color: C.pink },
  ];
  const chW = (cw - 4) / 2;
  const chH = 22;
  for (let i = 0; i < cats.length; i++) {
    const cat = cats[i];
    const col = i % 2, row = Math.floor(i / 2);
    const cx = m + col * (chW + 4), cy = y + row * (chH + 3);
    rr(d, cx, cy, chW, chH, 2, C.card, C.border);
    fc(d, cat.color); d.rect(cx, cy, 2, chH, 'F');
    d.setFont('helvetica', 'bold'); d.setFontSize(9);
    tc(d, C.text); d.text(cat.name, cx + 6, cy + 7);
    d.setFontSize(13); tc(d, cat.color);
    d.text(`${cat.score}/10`, cx + chW - 6, cy + 8, { align: 'right' });
    d.setFont('helvetica', 'normal'); d.setFontSize(6.5);
    tc(d, C.muted); d.text(cat.level, cx + chW - 6, cy + 14, { align: 'right' });
    const dl = wrap(d, cat.description, chW - 14);
    d.setFontSize(7); tc(d, C.textMid);
    d.text(dl.slice(0, 1), cx + 6, cy + 18);
  }
  y += 2 * (chH + 3) + 4;

  // ── Strengths ──
  y = heading(d, 'What You Did Well', y, C.green, m);
  for (const s of feedback.strengths) {
    const lines = wrap(d, s, cw - 16);
    y = pageBreak(d, y, lines.length * 3.8 + 3, 30);
    fc(d, C.green); d.circle(m + 5, y + 1.5, 1.2, 'F');
    d.setFont('helvetica', 'normal'); d.setFontSize(8.5);
    tc(d, C.text); d.text(lines, m + 9, y + 3);
    y += lines.length * 3.8 + 1.5;
  }
  y += 4;

  // ── Improvement Plan ──
  y = heading(d, 'Focus Areas for Growth', y, C.blue, m);
  for (const action of feedback.improvementPlan) {
    const sl = wrap(d, action.suggestion, cw - 16);
    const ah = 10 + sl.length * 3.5 + (action.resources?.length ? 6 : 0);
    y = pageBreak(d, y, ah + 3, 30);
    rr(d, m, y, cw, ah, 2, C.card, C.border);
    const pc = action.priority === 'High' ? C.red : action.priority === 'Medium' ? C.yellow : C.green;
    fc(d, pc); d.rect(m, y, 2, ah, 'F');
    d.setFont('helvetica', 'bold'); d.setFontSize(8.5);
    tc(d, C.text); d.text(action.area, m + 6, y + 6);
    const pt = `${action.priority}`;
    d.setFontSize(6.5);
    const ptw = d.getTextWidth(pt) + 6;
    rr(d, pw - m - ptw - 4, y + 2, ptw, 6, 1.5, pc);
    tc(d, C.white); d.text(pt, pw - m - ptw / 2 - 4, y + 6, { align: 'center' });
    d.setFont('helvetica', 'normal'); d.setFontSize(8);
    tc(d, C.textMid); d.text(sl, m + 6, y + 12);
    if (action.resources?.length) {
      d.setFontSize(6.5); tc(d, C.muted);
      d.text('Resources: ' + action.resources.join(' | '), m + 6, y + ah - 2);
    }
    y += ah + 3;
  }
  y += 3;

  // ── Recommended Problems ──
  y = heading(d, 'Practice These Next', y, C.purple, m);
  const rpW = (cw - 6) / Math.min(feedback.recommendedProblems.length, 3);
  y = pageBreak(d, y, 28, 30);
  for (let i = 0; i < feedback.recommendedProblems.length && i < 3; i++) {
    const p = feedback.recommendedProblems[i];
    const px = m + i * (rpW + 3);
    rr(d, px, y, rpW, 24, 2, C.card, C.border);
    d.setFont('helvetica', 'bold'); d.setFontSize(7.5);
    tc(d, C.text);
    const tl = wrap(d, p.title, rpW - 28);
    d.text(tl[0] || p.title, px + 4, y + 6);
    const dfc = p.difficulty === 'Easy' ? C.green : p.difficulty === 'Medium' ? C.yellow : C.red;
    d.setFontSize(5.5);
    const dfw = d.getTextWidth(p.difficulty) + 5;
    rr(d, px + rpW - dfw - 3, y + 2, dfw, 5, 1, dfc);
    tc(d, C.white); d.text(p.difficulty, px + rpW - dfw / 2 - 3, y + 5.5, { align: 'center' });
    d.setFont('helvetica', 'normal'); d.setFontSize(6.5);
    tc(d, C.textMid);
    const rl = wrap(d, p.reason, rpW - 8);
    d.text(rl.slice(0, 2), px + 4, y + 12);
    d.setFontSize(5.5); tc(d, C.muted);
    d.text(p.tags.join(' | '), px + 4, y + 22);
  }
  y += 28;

  // ── Encouragement ──
  y = pageBreak(d, y, 16, 30);
  rr(d, m, y, cw, 12, 2, C.card, C.border);
  fc(d, C.green); d.rect(m, y, 2, 12, 'F');
  d.setFont('helvetica', 'italic'); d.setFontSize(8.5);
  tc(d, C.textMid);
  const el = wrap(d, feedback.encouragement, cw - 12);
  d.text(el, pw / 2, y + 7, { align: 'center' });
  y += 16;

  // ── Stats row ──
  y = pageBreak(d, y, 16, 30);
  const sw = (cw - 6) / 3;
  const sts = [
    { l: 'Tests Passed', v: testResults.length > 0 ? `${testResults[testResults.length - 1].testsPassed}/${testResults[testResults.length - 1].testsTotal}` : '0/0' },
    { l: 'Code Quality', v: codeQualityScore ? `${codeQualityScore}/10` : 'N/A' },
    { l: 'Exchanges', v: `${transcriptLength}` },
  ];
  sts.forEach((s, i) => {
    const sx = m + i * (sw + 3);
    rr(d, sx, y, sw, 14, 2, C.card, C.border);
    d.setFont('helvetica', 'bold'); d.setFontSize(13);
    tc(d, C.blue); d.text(s.v, sx + sw / 2, y + 7, { align: 'center' });
    d.setFont('helvetica', 'normal'); d.setFontSize(6.5);
    tc(d, C.muted); d.text(s.l, sx + sw / 2, y + 12, { align: 'center' });
  });

  // ── Finalize ──
  const sub = companyName ? `${companyName} Practice Session` : 'Practice Session Report';
  finalize(d, sub);
  d.save(`BetterThanLeet_Practice_Report_${new Date().toISOString().split('T')[0]}.pdf`);
}
