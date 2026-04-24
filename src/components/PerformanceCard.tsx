import { Card } from "@/components/ui/card";
import { Activity, Database, Brain } from "lucide-react";
import { MODEL_ACCURACY } from "@/lib/predictor";

export const PerformanceCard = () => {
  const pct = Math.round(MODEL_ACCURACY * 1000) / 10; // e.g. 91.2

  return (
    <Card className="rounded-3xl border-border/60 bg-card p-6 shadow-card md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl gradient-primary shadow-glow">
          <Activity className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Model Performance</h2>
          <p className="text-sm text-muted-foreground">Logistic Regression — held-out test set</p>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <div className="mb-2 flex items-baseline justify-between">
            <span className="text-sm font-medium text-muted-foreground">📊 Accuracy</span>
            <span className="text-3xl font-extrabold text-gradient-hero">{pct}%</span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full gradient-primary shadow-glow transition-all duration-1000 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-secondary/60 p-4">
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Brain className="h-3.5 w-3.5" /> Algorithm
            </div>
            <p className="text-sm font-bold text-foreground">Logistic Regression</p>
          </div>
          <div className="rounded-2xl bg-secondary/60 p-4">
            <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Database className="h-3.5 w-3.5" /> Training Size
            </div>
            <p className="text-sm font-bold text-foreground">500 samples</p>
          </div>
        </div>
      </div>
    </Card>
  );
};
