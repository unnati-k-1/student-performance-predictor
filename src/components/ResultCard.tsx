import { Card } from "@/components/ui/card";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import type { PredictionResult } from "@/lib/predictor";
import { cn } from "@/lib/utils";

type Props = { result: PredictionResult | null };

export const ResultCard = ({ result }: Props) => {
  if (!result) {
    return (
      <Card className="flex h-full flex-col items-center justify-center rounded-3xl border-2 border-dashed border-border bg-card/50 p-10 text-center shadow-soft">
        <div className="mb-3 text-4xl">🎯</div>
        <h3 className="text-lg font-bold">No prediction yet</h3>
        <p className="text-sm text-muted-foreground">
          Set the student's profile and tap <span className="font-semibold text-primary">Predict Result</span>.
        </p>
      </Card>
    );
  }

  const isPass = result.label === "Pass";
  const probPct = Math.round(result.probability * 100);

  return (
    <div className="space-y-4">
      {/* Prediction banner */}
      <Card
        className={cn(
          "overflow-hidden rounded-3xl border-0 p-0 shadow-card transition-smooth",
          isPass ? "gradient-success" : "gradient-danger",
        )}
      >
        <div className="flex flex-col items-center gap-2 p-8 text-center text-primary-foreground">
          <div className="rounded-full bg-white/20 p-3 backdrop-blur-sm">
            {isPass ? <CheckCircle2 className="h-8 w-8" /> : <XCircle className="h-8 w-8" />}
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-90">
            Prediction
          </p>
          <h2 className="text-5xl font-extrabold tracking-tight">
            {isPass ? "✓ Pass" : "✗ Fail"}
          </h2>
          <p className="mt-1 text-sm opacity-90">
            Confidence: <span className="font-bold">{isPass ? probPct : 100 - probPct}%</span>
          </p>
        </div>
      </Card>

      {/* Drift detection */}
      <Card
        className={cn(
          "rounded-3xl border-0 p-6 shadow-card transition-smooth",
          result.driftDetected ? "bg-warning-soft" : "bg-success-soft",
        )}
      >
        <div className="mb-4 flex items-start gap-3">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
              result.driftDetected ? "bg-warning text-warning-foreground" : "bg-success text-success-foreground",
            )}
          >
            {result.driftDetected ? <AlertTriangle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-foreground">
              {result.driftDetected ? "⚠️ Data Drift Detected" : "✅ No Drift Detected"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {result.driftDetected
                ? "Predictions may be unreliable — input differs significantly from training data."
                : "Inputs are within the training distribution."}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl bg-card/70 backdrop-blur-sm">
          <div className="grid grid-cols-4 gap-2 border-b border-border/60 bg-card/50 px-4 py-2.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Feature</span>
            <span className="text-right">Input</span>
            <span className="text-right">Train Mean</span>
            <span className="text-right">Δ Diff</span>
          </div>
          {result.drift.map((d) => (
            <div
              key={d.feature}
              className={cn(
                "grid grid-cols-4 gap-2 px-4 py-3 text-sm transition-smooth",
                d.drifted && "bg-destructive-soft",
              )}
            >
              <span className="font-medium text-foreground">{d.label}</span>
              <span className="text-right font-semibold text-primary">
                {d.value}
                {d.unit}
              </span>
              <span className="text-right text-muted-foreground">
                {d.mean}
                {d.unit}
              </span>
              <span
                className={cn(
                  "text-right font-bold",
                  d.drifted ? "text-destructive" : "text-success",
                )}
              >
                {d.diff > 0 ? "+" : ""}
                {d.diff.toFixed(1)}
                {d.unit}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
