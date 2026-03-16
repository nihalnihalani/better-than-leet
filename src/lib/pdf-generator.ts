import jsPDF from 'jspdf';

// ──────────────────── Color Palette ────────────────────
const COLORS = {
  primary: [59, 130, 246] as const,       // blue-500
  purple: [168, 85, 247] as const,        // purple-500
  yellow: [234, 179, 8] as const,         // yellow-500
  cyan: [6, 182, 212] as const,           // cyan-500
  pink: [236, 72, 153] as const,          // pink-500
  green: [34, 197, 94] as const,          // green-500
  red: [239, 68, 68] as const,            // red-500
  dark: [15, 23, 42] as const,            // slate-900
  darkCard: [30, 41, 59] as const,        // slate-800
  muted: [148, 163, 184] as const,        // slate-400
  text: [226, 232, 240] as const,         // slate-200
  white: [255, 255, 255] as const,
  lightGrey: [241, 245, 249] as const,    // slate-100
  darkGrey: [51, 65, 85] as const,        // slate-700
};

// ──────────────────── Helpers ────────────────────
function rgbStr(color: readonly [number, number, number]): string {
  return `rgb(${color[0]}, ${color[1]}, ${color[2]})`;
}

type PDF = jsPDF;

function setColor(doc: PDF, color: readonly [number, number, number]) {
  doc.setTextColor(color[0], color[1], color[2]);
}

function setFill(doc: PDF, color: readonly [number, number, number]) {
  doc.setFillColor(color[0], color[1], color[2]);
}

function setDraw(doc: PDF, color: readonly [number, number, number]) {
  doc.setDrawColor(color[0], color[1], color[2]);
}

function drawRoundedRect(doc: PDF, x: number, y: number, w: number, h: number, r: number, fill: readonly [number, number, number], borderColor?: readonly [number, number, number]) {
  setFill(doc, fill);
  if (borderColor) {
    setDraw(doc, borderColor);
    doc.roundedRect(x, y, w, h, r, r, 'FD');
  } else {
    doc.roundedRect(x, y, w, h, r, r, 'F');
  }
}

function wrapText(doc: PDF, text: string, maxWidth: number): string[] {
  return doc.splitTextToSize(text, maxWidth);
}

function checkPageBreak(doc: PDF, y: number, needed: number, margin: number): number {
  const pageHeight = doc.internal.pageSize.getHeight();
  if (y + needed > pageHeight - margin) {
    doc.addPage();
    return margin;
  }
  return y;
}

// ──────────────────── Header / Footer ────────────────────
function drawHeader(doc: PDF, pageWidth: number) {
  // Dark gradient header bar
  setFill(doc, COLORS.dark);
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Accent line
  setFill(doc, COLORS.primary);
  doc.rect(0, 28, pageWidth, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  setColor(doc, COLORS.white);
  doc.text('BetterThanLeet', 20, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  setColor(doc, COLORS.muted);
  doc.text('AI Technical Interview Report', pageWidth - 20, 18, { align: 'right' });
}

function drawFooter(doc: PDF, pageWidth: number, pageHeight: number, pageNum: number) {
  const y = pageHeight - 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  setColor(doc, COLORS.muted);

  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.text(`Generated ${date}  |  Confidential`, 20, y);
  doc.text(`Page ${pageNum}`, pageWidth - 20, y, { align: 'right' });
}

// ──────────────────── Section Helpers ────────────────────
function drawSectionTitle(doc: PDF, title: string, y: number, accentColor: readonly [number, number, number], pageWidth: number, margin: number): number {
  y = checkPageBreak(doc, y, 15, 30);

  // Accent bar
  setFill(doc, accentColor);
  doc.rect(margin, y, 4, 12, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  setColor(doc, COLORS.white);
  doc.text(title, margin + 10, y + 9);

  return y + 18;
}

function drawCard(doc: PDF, x: number, y: number, w: number, h: number, borderLeft?: readonly [number, number, number]) {
  drawRoundedRect(doc, x, y, w, h, 3, COLORS.darkCard);
  if (borderLeft) {
    setFill(doc, borderLeft);
    doc.rect(x, y + 2, 3, h - 4, 'F');
  }
}

function drawScoreBadge(doc: PDF, score: number, x: number, y: number, label: string) {
  const color = score >= 8 ? COLORS.green : score >= 5 ? COLORS.yellow : COLORS.red;
  drawRoundedRect(doc, x, y, 50, 32, 3, [color[0], color[1], color[2]]);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  setColor(doc, COLORS.white);
  doc.text(`${score}/10`, x + 25, y + 16, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.text(label, x + 25, y + 26, { align: 'center' });
}

// ──────────────────── Interview Report PDF ────────────────────
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
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;
  let pageNum = 1;

  // ── Page 1: Header ──
  drawHeader(doc, pageWidth);
  drawFooter(doc, pageWidth, pageHeight, pageNum);

  let y = 38;

  // ── Title + Hire Recommendation ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  setColor(doc, COLORS.white);
  doc.text('Interview Final Report', margin, y);

  // Hire recommendation badge
  const rec = (report.hireRecommendation || 'PENDING').replace('_', ' ');
  const isHire = rec.includes('HIRE') && !rec.includes('NO');
  const badgeColor = isHire ? COLORS.green : COLORS.red;
  const badgeW = doc.getTextWidth(rec) + 14;
  drawRoundedRect(doc, pageWidth - margin - badgeW, y - 8, badgeW, 12, 3, badgeColor);
  doc.setFontSize(9);
  setColor(doc, COLORS.white);
  doc.text(rec, pageWidth - margin - badgeW / 2, y - 1, { align: 'center' });

  y += 12;

  // ── Executive Summary ──
  y = drawSectionTitle(doc, 'Executive Summary', y, COLORS.primary, pageWidth, margin);
  const summaryLines = wrapText(doc, report.executiveSummary || 'No summary available.', contentWidth - 16);
  const summaryH = summaryLines.length * 5 + 14;
  y = checkPageBreak(doc, y, summaryH, 30);
  drawCard(doc, margin, y, contentWidth, summaryH, COLORS.primary);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  setColor(doc, COLORS.text);
  doc.text(summaryLines, margin + 10, y + 10);
  y += summaryH + 8;

  // ── Score Overview ──
  y = drawSectionTitle(doc, 'Score Overview', y, COLORS.purple, pageWidth, margin);
  y = checkPageBreak(doc, y, 42, 30);
  drawCard(doc, margin, y, contentWidth, 42, COLORS.purple);

  const scoreStartX = margin + 15;
  const scoreGap = (contentWidth - 30 - 50 * 4) / 3;
  drawScoreBadge(doc, report.technicalEvaluation.score, scoreStartX, y + 5, 'Technical');
  drawScoreBadge(doc, report.communicationEvaluation.score, scoreStartX + 50 + scoreGap, y + 5, 'Communication');
  drawScoreBadge(doc, report.problemSolvingEvaluation.score, scoreStartX + 2 * (50 + scoreGap), y + 5, 'Problem Solving');

  // Integrity score badge
  const intColor = integrityScore > 70 ? COLORS.green : integrityScore > 40 ? COLORS.yellow : COLORS.red;
  drawScoreBadge(doc, Math.round(integrityScore / 10), scoreStartX + 3 * (50 + scoreGap), y + 5, 'Integrity');

  y += 52;

  // ── Evaluation details helper ──
  const drawEvaluation = (title: string, eval_: { score: number; summary: string; strengths: string[]; weaknesses: string[] }, accentColor: readonly [number, number, number]) => {
    y = drawSectionTitle(doc, `${title} (${eval_.score}/10)`, y, accentColor, pageWidth, margin);

    // Summary
    const sumLines = wrapText(doc, eval_.summary || '', contentWidth - 16);
    const sumH = sumLines.length * 5 + 10;
    y = checkPageBreak(doc, y, sumH, 30);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    setColor(doc, COLORS.text);
    doc.text(sumLines, margin + 8, y + 6);
    y += sumH;

    // Strengths
    if (eval_.strengths.length > 0) {
      y = checkPageBreak(doc, y, 12, 30);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      setColor(doc, COLORS.green);
      doc.text('STRENGTHS', margin + 8, y + 4);
      y += 8;

      for (const s of eval_.strengths) {
        const lines = wrapText(doc, `+ ${s}`, contentWidth - 20);
        y = checkPageBreak(doc, y, lines.length * 4.5 + 2, 30);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        setColor(doc, COLORS.text);
        doc.text(lines, margin + 12, y + 3);
        y += lines.length * 4.5 + 1;
      }
      y += 3;
    }

    // Weaknesses
    if (eval_.weaknesses.length > 0) {
      y = checkPageBreak(doc, y, 12, 30);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      setColor(doc, COLORS.red);
      doc.text('AREAS TO IMPROVE', margin + 8, y + 4);
      y += 8;

      for (const w of eval_.weaknesses) {
        const lines = wrapText(doc, `- ${w}`, contentWidth - 20);
        y = checkPageBreak(doc, y, lines.length * 4.5 + 2, 30);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8.5);
        setColor(doc, COLORS.text);
        doc.text(lines, margin + 12, y + 3);
        y += lines.length * 4.5 + 1;
      }
      y += 3;
    }
    y += 4;
  };

  drawEvaluation('Technical Skills', report.technicalEvaluation, COLORS.purple);
  drawEvaluation('Communication', report.communicationEvaluation, COLORS.yellow);
  drawEvaluation('Problem Solving', report.problemSolvingEvaluation, COLORS.cyan);

  // ── Integrity Details ──
  y = drawSectionTitle(doc, 'Integrity & Metrics', y, intColor, pageWidth, margin);
  y = checkPageBreak(doc, y, 55, 30);

  const intCardH = 50;
  drawCard(doc, margin, y, contentWidth, intCardH, intColor);

  // Trust score
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  setColor(doc, intColor);
  doc.text(`${integrityScore}%`, margin + 30, y + 22, { align: 'center' });
  doc.setFontSize(8);
  setColor(doc, COLORS.muted);
  doc.text('TRUST SCORE', margin + 30, y + 30, { align: 'center' });

  // Tests
  const testStr = testResults.length > 0
    ? `${testResults[testResults.length - 1].testsPassed}/${testResults[testResults.length - 1].testsTotal}`
    : '-';
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(28);
  setColor(doc, COLORS.primary);
  doc.text(testStr, margin + 80, y + 22, { align: 'center' });
  doc.setFontSize(8);
  setColor(doc, COLORS.muted);
  doc.text('TESTS PASSED', margin + 80, y + 30, { align: 'center' });

  // Detail list
  const detailX = margin + 115;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  setColor(doc, COLORS.text);
  doc.text(`Tab Switches: ${integrity.blurCount}`, detailX, y + 14);
  doc.text(`Paste Events: ${integrity.pasteCount}`, detailX, y + 22);
  doc.text(`Large Pastes (>100 chars): ${integrity.largePasteEvents.length}`, detailX, y + 30);

  // Color indicators
  const blurColor = integrity.blurCount > 5 ? COLORS.red : integrity.blurCount > 2 ? COLORS.yellow : COLORS.green;
  const pasteColor = integrity.pasteCount > 3 ? COLORS.yellow : COLORS.green;
  const lgPasteColor = integrity.largePasteEvents.length > 0 ? COLORS.red : COLORS.green;
  setFill(doc, blurColor);
  doc.circle(detailX - 4, y + 12, 2, 'F');
  setFill(doc, pasteColor);
  doc.circle(detailX - 4, y + 20, 2, 'F');
  setFill(doc, lgPasteColor);
  doc.circle(detailX - 4, y + 28, 2, 'F');

  y += intCardH + 8;

  // ── Final Feedback ──
  y = drawSectionTitle(doc, 'Final Feedback', y, COLORS.pink, pageWidth, margin);
  const feedbackLines = wrapText(doc, `"${report.finalFeedback || ''}"`, contentWidth - 16);
  const feedbackH = feedbackLines.length * 5 + 14;
  y = checkPageBreak(doc, y, feedbackH, 30);
  drawCard(doc, margin, y, contentWidth, feedbackH, COLORS.pink);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  setColor(doc, COLORS.text);
  doc.text(feedbackLines, margin + 10, y + 10);
  y += feedbackH + 8;

  // ── Add headers/footers to all pages ──
  const totalPages = doc.getNumberOfPages();
  for (let i = 2; i <= totalPages; i++) {
    doc.setPage(i);
    drawHeader(doc, pageWidth);
    drawFooter(doc, pageWidth, pageHeight, i);
  }

  // Apply dark background to all pages
  for (let i = 1; i <= doc.getNumberOfPages(); i++) {
    doc.setPage(i);
    // Background must be drawn first, but jsPDF draws in order
    // We'll insert it via a workaround: set page background
    doc.setFillColor(COLORS.dark[0], COLORS.dark[1], COLORS.dark[2]);
    // Can't insert behind existing content, so we'll handle this differently
  }

  // Save
  const fileName = `BetterThanLeet_Interview_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}

// ──────────────────── Practice Report PDF ────────────────────
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
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentWidth = pageWidth - 2 * margin;

  // ── Page background ──
  // (light mode for practice - more friendly feel)

  // ── Header ──
  setFill(doc, COLORS.dark);
  doc.rect(0, 0, pageWidth, 28, 'F');
  setFill(doc, COLORS.green);
  doc.rect(0, 28, pageWidth, 1.5, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  setColor(doc, COLORS.white);
  doc.text('BetterThanLeet', 20, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  setColor(doc, COLORS.muted);
  const subtitle = companyName ? `${companyName} Practice Session` : 'Practice Session Report';
  doc.text(subtitle, pageWidth - 20, 18, { align: 'right' });

  let y = 38;

  // ── Title ──
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  setColor(doc, COLORS.dark);
  doc.text('Practice Session Complete', margin, y);

  // Level badge
  const levelBadgeW = doc.getTextWidth(feedback.overallLevel) + 14;
  drawRoundedRect(doc, pageWidth - margin - levelBadgeW, y - 8, levelBadgeW, 12, 3, COLORS.primary);
  doc.setFontSize(9);
  setColor(doc, COLORS.white);
  doc.text(feedback.overallLevel, pageWidth - margin - levelBadgeW / 2, y - 1, { align: 'center' });

  y += 12;

  // ── Overall Score Card ──
  y = checkPageBreak(doc, y, 30, 30);
  drawRoundedRect(doc, margin, y, contentWidth, 25, 4, COLORS.lightGrey);
  setFill(doc, COLORS.primary);
  doc.rect(margin, y, 4, 25, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(24);
  setColor(doc, COLORS.primary);
  doc.text(`${feedback.overallScore}/10`, margin + 15, y + 17);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  setColor(doc, COLORS.darkGrey);
  doc.text('Overall Performance', margin + 50, y + 12);
  doc.setFontSize(8);
  setColor(doc, COLORS.muted);
  doc.text("You're on the path to becoming a stronger coder!", margin + 50, y + 20);

  y += 33;

  // ── Skill Breakdown ──
  y = drawSectionTitle(doc, 'Skill Breakdown', y, COLORS.primary, pageWidth, margin);

  const categories = [
    { name: 'Problem Solving', ...feedback.categories.problemSolving, color: COLORS.yellow },
    { name: 'Code Quality', ...feedback.categories.codeQuality, color: COLORS.purple },
    { name: 'Communication', ...feedback.categories.communication, color: COLORS.cyan },
    { name: 'Optimization', ...feedback.categories.optimization, color: COLORS.pink },
  ];

  const cardW = (contentWidth - 6) / 2;
  const cardH = 30;

  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
    const col = i % 2;
    const row = Math.floor(i / 2);
    const cx = margin + col * (cardW + 6);
    const cy = y + row * (cardH + 4);

    if (row === 0 || y + row * (cardH + 4) + cardH < pageHeight - 30) {
      drawRoundedRect(doc, cx, cy, cardW, cardH, 3, COLORS.lightGrey);
      setFill(doc, cat.color);
      doc.rect(cx, cy, 3, cardH, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      setColor(doc, COLORS.dark);
      doc.text(cat.name, cx + 8, cy + 8);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      setColor(doc, cat.color);
      doc.text(`${cat.score}/10`, cx + cardW - 8, cy + 10, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      setColor(doc, COLORS.muted);
      doc.text(cat.level, cx + cardW - 8, cy + 17, { align: 'right' });

      const descLines = wrapText(doc, cat.description, cardW - 16);
      doc.setFontSize(7);
      setColor(doc, COLORS.darkGrey);
      doc.text(descLines.slice(0, 2), cx + 8, cy + 20);
    }
  }

  y += 2 * (cardH + 4) + 8;

  // ── Strengths ──
  y = drawSectionTitle(doc, 'What You Did Well', y, COLORS.green, pageWidth, margin);

  for (const s of feedback.strengths) {
    const lines = wrapText(doc, s, contentWidth - 20);
    y = checkPageBreak(doc, y, lines.length * 4.5 + 4, 30);
    setFill(doc, COLORS.green);
    doc.circle(margin + 6, y + 2, 1.5, 'F');
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    setColor(doc, COLORS.dark);
    doc.text(lines, margin + 12, y + 4);
    y += lines.length * 4.5 + 2;
  }
  y += 6;

  // ── Improvement Plan ──
  y = drawSectionTitle(doc, 'Focus Areas for Growth', y, COLORS.primary, pageWidth, margin);

  for (const action of feedback.improvementPlan) {
    const suggLines = wrapText(doc, action.suggestion, contentWidth - 20);
    const areaH = 12 + suggLines.length * 4.5 + (action.resources?.length ? 10 : 0);
    y = checkPageBreak(doc, y, areaH + 4, 30);

    drawRoundedRect(doc, margin, y, contentWidth, areaH, 3, COLORS.lightGrey);
    const prioColor = action.priority === 'High' ? COLORS.red : action.priority === 'Medium' ? COLORS.yellow : COLORS.green;
    setFill(doc, prioColor);
    doc.rect(margin, y, 3, areaH, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    setColor(doc, COLORS.dark);
    doc.text(action.area, margin + 8, y + 8);

    // Priority badge
    const prioText = `${action.priority} Priority`;
    const prioW = doc.getTextWidth(prioText) + 8;
    drawRoundedRect(doc, pageWidth - margin - prioW - 5, y + 2, prioW, 8, 2, prioColor);
    doc.setFontSize(7);
    setColor(doc, COLORS.white);
    doc.text(prioText, pageWidth - margin - prioW / 2 - 5, y + 7.5, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    setColor(doc, COLORS.darkGrey);
    doc.text(suggLines, margin + 8, y + 15);

    if (action.resources && action.resources.length > 0) {
      const resY = y + 15 + suggLines.length * 4.5;
      doc.setFontSize(7);
      setColor(doc, COLORS.muted);
      doc.text('Resources: ' + action.resources.join(' | '), margin + 8, resY);
    }

    y += areaH + 4;
  }
  y += 4;

  // ── Recommended Problems ──
  y = drawSectionTitle(doc, 'Practice These Next', y, COLORS.purple, pageWidth, margin);

  const probW = (contentWidth - 8) / 3;
  for (let i = 0; i < feedback.recommendedProblems.length; i++) {
    const prob = feedback.recommendedProblems[i];
    const px = margin + i * (probW + 4);
    y = checkPageBreak(doc, y, 35, 30);

    drawRoundedRect(doc, px, y, probW, 32, 3, COLORS.lightGrey);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    setColor(doc, COLORS.dark);
    const titleLines = wrapText(doc, prob.title, probW - 30);
    doc.text(titleLines[0], px + 5, y + 8);

    // Difficulty badge
    const diffColor = prob.difficulty === 'Easy' ? COLORS.green : prob.difficulty === 'Medium' ? COLORS.yellow : COLORS.red;
    const diffW = doc.getTextWidth(prob.difficulty) + 6;
    drawRoundedRect(doc, px + probW - diffW - 3, y + 2, diffW, 8, 2, diffColor);
    doc.setFontSize(6);
    setColor(doc, COLORS.white);
    doc.text(prob.difficulty, px + probW - diffW / 2 - 3, y + 7, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    setColor(doc, COLORS.darkGrey);
    const reasonLines = wrapText(doc, prob.reason, probW - 10);
    doc.text(reasonLines.slice(0, 2), px + 5, y + 16);

    // Tags
    doc.setFontSize(6);
    setColor(doc, COLORS.muted);
    doc.text(prob.tags.join(' | '), px + 5, y + 28);
  }

  y += 40;

  // ── Encouragement ──
  y = checkPageBreak(doc, y, 25, 30);
  drawRoundedRect(doc, margin, y, contentWidth, 20, 4, COLORS.lightGrey, COLORS.green);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(10);
  setColor(doc, COLORS.dark);
  const encLines = wrapText(doc, feedback.encouragement, contentWidth - 16);
  doc.text(encLines, pageWidth / 2, y + (encLines.length > 1 ? 8 : 12), { align: 'center' });
  y += 28;

  // ── Stats ──
  y = checkPageBreak(doc, y, 25, 30);
  const statW = (contentWidth - 8) / 3;
  const stats = [
    { label: 'Tests Passed', value: testResults.length > 0 ? `${testResults[testResults.length - 1].testsPassed}/${testResults[testResults.length - 1].testsTotal}` : '0/0' },
    { label: 'Code Quality', value: codeQualityScore ? `${codeQualityScore}/10` : 'N/A' },
    { label: 'Exchanges', value: `${transcriptLength}` },
  ];

  for (let i = 0; i < stats.length; i++) {
    const sx = margin + i * (statW + 4);
    drawRoundedRect(doc, sx, y, statW, 20, 3, COLORS.lightGrey);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    setColor(doc, COLORS.primary);
    doc.text(stats[i].value, sx + statW / 2, y + 10, { align: 'center' });
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    setColor(doc, COLORS.muted);
    doc.text(stats[i].label, sx + statW / 2, y + 17, { align: 'center' });
  }

  // ── Footer on all pages ──
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    if (i > 1) {
      setFill(doc, COLORS.dark);
      doc.rect(0, 0, pageWidth, 28, 'F');
      setFill(doc, COLORS.green);
      doc.rect(0, 28, pageWidth, 1.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      setColor(doc, COLORS.white);
      doc.text('BetterThanLeet', 20, 18);
    }
    drawFooter(doc, pageWidth, pageHeight, i);
  }

  const fileName = `BetterThanLeet_Practice_Report_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
}
