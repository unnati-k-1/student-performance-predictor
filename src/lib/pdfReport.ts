import jsPDF from "jspdf";
import type { Inputs, PredictionResult } from "@/lib/predictor";
import { MODEL_ACCURACY } from "@/lib/predictor";

const PRIMARY: [number, number, number] = [99, 60, 235]; // hsl(250 84% 60%)
const SUCCESS: [number, number, number] = [33, 178, 110];
const DANGER: [number, number, number] = [232, 70, 70];
const WARNING: [number, number, number] = [245, 170, 30];
const TEXT: [number, number, number] = [23, 23, 38];
const MUTED: [number, number, number] = [110, 115, 135];
const BORDER: [number, number, number] = [225, 228, 240];
const SOFT_BG: [number, number, number] = [247, 248, 253];

export function generatePredictionPdf(inputs: Inputs, result: PredictionResult) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const margin = 40;
  const contentW = pageW - margin * 2;

  // ===== Header band =====
  doc.setFillColor(...PRIMARY);
  doc.roundedRect(margin, margin, contentW, 70, 12, 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text("Student Result Prediction", margin + 20, margin + 30);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(
    `Generated ${new Date().toLocaleString()}  ·  Logistic Regression`,
    margin + 20,
    margin + 50,
  );

  let y = margin + 70 + 24;

  // ===== Pass/Fail summary =====
  const isPass = result.label === "Pass";
  const banner = isPass ? SUCCESS : DANGER;
  const probPct = Math.round(result.probability * 100);
  const confidence = isPass ? probPct : 100 - probPct;

  doc.setFillColor(...banner);
  doc.roundedRect(margin, y, contentW, 80, 12, 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text(isPass ? "PASS" : "FAIL", margin + 24, y + 42);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Prediction", margin + 24, y + 22);
  doc.setFontSize(12);
  doc.text(`Confidence: ${confidence}%`, margin + 24, y + 64);

  // Probability gauge on the right
  const gaugeX = margin + contentW - 180;
  const gaugeY = y + 28;
  const gaugeW = 150;
  const gaugeH = 10;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(255, 255, 255);
  doc.roundedRect(gaugeX, gaugeY, gaugeW, gaugeH, 5, 5, "S");
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(gaugeX, gaugeY, (gaugeW * confidence) / 100, gaugeH, 5, 5, "F");
  doc.setFontSize(9);
  doc.text("Pass probability", gaugeX, gaugeY - 6);
  doc.text(`${probPct}%`, gaugeX + gaugeW - 24, gaugeY + 26);

  y += 80 + 24;

  // ===== Inputs section =====
  y = drawSectionTitle(doc, "Student Inputs", margin, y);
  const inputRows: [string, string][] = [
    ["Attendance", `${inputs.attendance}%`],
    ["Marks", `${inputs.marks}%`],
    ["Study Hours", `${inputs.studyHours} hrs/day`],
  ];
  y = drawKeyValueGrid(doc, inputRows, margin, y, contentW);
  y += 20;

  // ===== Drift stats table =====
  y = drawSectionTitle(doc, "Data Drift Analysis", margin, y);

  const driftBadgeColor: [number, number, number] = result.driftDetected ? WARNING : SUCCESS;
  doc.setFillColor(...driftBadgeColor);
  doc.roundedRect(margin, y, contentW, 28, 8, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(
    result.driftDetected
      ? "Data drift detected — predictions may be unreliable"
      : "No drift detected — inputs match the training distribution",
    margin + 12,
    y + 18,
  );
  y += 28 + 12;

  // Table header
  const colX = [margin + 12, margin + 150, margin + 250, margin + 350, margin + 450];
  doc.setFillColor(...SOFT_BG);
  doc.rect(margin, y, contentW, 24, "F");
  doc.setTextColor(...MUTED);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("FEATURE", colX[0], y + 16);
  doc.text("INPUT", colX[1], y + 16);
  doc.text("TRAIN MEAN", colX[2], y + 16);
  doc.text("DIFF", colX[3], y + 16);
  doc.text("Z-SCORE", colX[4], y + 16);
  y += 24;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  result.drift.forEach((d, idx) => {
    if (idx % 2 === 1) {
      doc.setFillColor(...SOFT_BG);
      doc.rect(margin, y, contentW, 26, "F");
    }
    if (d.drifted) {
      doc.setFillColor(255, 235, 235);
      doc.rect(margin, y, contentW, 26, "F");
    }
    doc.setTextColor(...TEXT);
    doc.text(d.label, colX[0], y + 17);
    doc.text(`${d.value}${d.unit}`, colX[1], y + 17);
    doc.setTextColor(...MUTED);
    doc.text(`${d.mean}${d.unit}`, colX[2], y + 17);
    doc.setTextColor(...(d.drifted ? DANGER : SUCCESS));
    doc.setFont("helvetica", "bold");
    doc.text(`${d.diff > 0 ? "+" : ""}${d.diff.toFixed(1)}${d.unit}`, colX[3], y + 17);
    doc.text(`${d.zScore.toFixed(2)}σ`, colX[4], y + 17);
    doc.setFont("helvetica", "normal");
    y += 26;
  });

  // Border around table
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.5);
  doc.roundedRect(margin, y - 26 * result.drift.length - 24, contentW, 24 + 26 * result.drift.length, 8, 8, "S");

  y += 24;

  // ===== Model performance =====
  y = drawSectionTitle(doc, "Model Performance", margin, y);
  const accPct = Math.round(MODEL_ACCURACY * 100);
  doc.setFillColor(...SOFT_BG);
  doc.roundedRect(margin, y, contentW, 60, 10, 10, "F");
  doc.setTextColor(...TEXT);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Test-set accuracy (Logistic Regression)", margin + 16, y + 22);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(...PRIMARY);
  doc.text(`${accPct}%`, margin + 16, y + 48);

  // accuracy bar
  const barX = margin + 140;
  const barY = y + 36;
  const barW = contentW - 160;
  doc.setFillColor(...BORDER);
  doc.roundedRect(barX, barY, barW, 10, 5, 5, "F");
  doc.setFillColor(...PRIMARY);
  doc.roundedRect(barX, barY, (barW * accPct) / 100, 10, 5, 5, "F");

  y += 60 + 28;

  // ===== Footer =====
  doc.setTextColor(...MUTED);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text(
    "Drift threshold = 1.5σ from training mean  ·  Predictions are illustrative.",
    margin,
    doc.internal.pageSize.getHeight() - 24,
  );

  const filename = `student-prediction-${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
}

function drawSectionTitle(doc: jsPDF, title: string, x: number, y: number): number {
  doc.setTextColor(...TEXT);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(title, x, y);
  doc.setDrawColor(...BORDER);
  doc.setLineWidth(0.5);
  doc.line(x, y + 6, x + 60, y + 6);
  return y + 18;
}

function drawKeyValueGrid(
  doc: jsPDF,
  rows: [string, string][],
  x: number,
  y: number,
  width: number,
): number {
  const cellW = width / rows.length;
  const h = 56;
  rows.forEach(([label, value], i) => {
    const cx = x + i * cellW;
    doc.setFillColor(...SOFT_BG);
    doc.roundedRect(cx + 4, y, cellW - 8, h, 10, 10, "F");
    doc.setTextColor(...MUTED);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(label.toUpperCase(), cx + 16, y + 20);
    doc.setTextColor(...PRIMARY);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.text(value, cx + 16, y + 44);
  });
  return y + h;
}
