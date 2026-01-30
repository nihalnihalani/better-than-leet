# Interview Report Markdown Formatting Improvements

## Issue
The generated reports lack visual structure - they're mostly paragraph text without proper markdown formatting.

## Solution
Replace lines 440-505 in `src/lib/gemini.ts` with this improved prompt structure:

```typescript
**TASK:**
Generate a comprehensive, professional interview evaluation report in **well-formatted markdown**.

**CRITICAL FORMATTING REQUIREMENTS:**
1. Use clear hierarchical headings (##, ###, ####)
2. Use bullet points and numbered lists extensively
3. Use blockquotes (>) for important callouts
4. Use tables where appropriate
5. Use **bold** for emphasis
6. Keep paragraphs SHORT (2-3 sentences max)
7. Add blank lines between sections
8. Use horizontal rules (---) to separate major sections
9. Use emojis for visual appeal (📊, 🎯, ⭐, 🔒, etc.)

**REPORT STRUCTURE:**

# 📊 Interview Evaluation Report

## 🎯 Executive Summary

[Write 2-3 sentences summarizing overall performance and recommendation]

---

## 📈 Overall Assessment

**Decision:** [STRONG HIRE / HIRE / MIXED / NO HIRE / STRONG NO HIRE]  
**Score:** X/10

**Justification:**  
[1-2 sentence explanation]

---

## 💻 Technical Performance

### Problem-Solving Approach

- **Efficiency:** [How did they approach the problem?]
- **Planning:** [Did they plan before coding?]
- **Systematic Thinking:** [Were they methodical?]

### Code Quality & Correctness

- **Organization:** [Code structure analysis]
- **Correctness:** [Algorithm accuracy]  
- **Edge Cases:** [How well did they handle edge cases?]

### Communication Skills

- **Clarity:** [How clear were their explanations?]
- **Engagement:** [Did they think out loud?]
- **Responsiveness:** [How did they handle questions?]

---

## ⭐ Key Strengths

Use a bullet list with 3-5 specific, concrete strengths:

- Strength 1
- Strength 2
- Strength 3

---

## 📝 Areas for Improvement

Use a bullet list with 3-5 specific, actionable improvements:

- Area 1
- Area 2
- Area 3

---

## 🔒 Interview Integrity Assessment

${data.integrity.blurCount > 5 || data.integrity.largePasteEvents.length > 0 
  ? '> ⚠️ **INTEGRITY CONCERNS DETECTED**\n\n' 
  : '> ✅ **NO SIGNIFICANT INTEGRITY CONCERNS**\n\n'}

| Metric | Value | Status |
|--------|-------|--------|
| Focus/Tab Switches | ${data.integrity.blurCount} | ${data.integrity.blurCount > 5 ? '🔴 HIGH RISK' : data.integrity.blurCount > 2 ? '🟡 MODERATE' : '🟢 NORMAL'} |
| Paste Events | ${data.integrity.pasteCount} | ${data.integrity.pasteCount > 3 ? '🟡 ELEVATED' : '🟢 NORMAL'} |
| Large Pastes (>100 chars) | ${data.integrity.largePasteEvents.length} | ${data.integrity.largePasteEvents.length > 0 ? '🔴 RED FLAG' : '🟢 CLEAN'} |

${data.integrity.largePasteEvents.length > 0 ? '\n> **⚠️ Note:** Large paste events suggest the candidate may have copied significant code from external sources rather than writing it themselves during the interview.\n' : ''}

---

## 🎯 Final Recommendation

**Hire Decision:** [STRONG HIRE / HIRE / MIXED / NO HIRE / STRONG NO HIRE]

**Rationale:**

[Write 2-4 sentences explaining the recommendation, weighing:
- Technical performance
- Integrity concerns
- Communication skills
- Overall fit]

---

*Report Generated: ${new Date().toLocaleString()}*
```

## Key Improvements
✅ Emojis for section headers (📊, 🎯, ⭐, 🔒)
✅ Horizontal rules (---) to separate sections
✅ Tables for integrity metrics
✅ Blockquotes for important callouts
✅ Bullet points with bold labels
✅ Shorter paragraphs
✅ Better visual hierarchy

## How to Apply
Manually update the prompt in `src/lib/gemini.ts` around line 440, or I can create the complete replacement file if needed.
