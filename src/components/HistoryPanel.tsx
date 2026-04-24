import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, RotateCcw, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SavedPrediction } from "@/lib/predictionStorage";

type Props = {
  history: SavedPrediction[];
  onReload: (entry: SavedPrediction) => void;
  onDelete: (id: string) => void;
};

const formatTime = (iso: string) => {
  try {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
};

export const HistoryPanel = ({ history, onReload, onDelete }: Props) => {
  return (
    <Card className="rounded-3xl border-border/60 bg-card p-6 shadow-card print:hidden">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl gradient-primary shadow-glow">
          <History className="h-5 w-5 text-primary-foreground" />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold">Recent Predictions</h2>
          <p className="text-sm text-muted-foreground">
            Last {Math.max(history.length, 1)} of up to 10 predictions saved on this device.
          </p>
        </div>
      </div>

      {history.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-border bg-secondary/30 p-8 text-center">
          <p className="text-sm text-muted-foreground">
            No saved predictions yet. Run a prediction and tap{" "}
            <span className="font-semibold text-primary">Save Prediction</span>.
          </p>
        </div>
      ) : (
        <ul className="space-y-2">
          {history.map((entry) => {
            const isPass = entry.result.label === "Pass";
            const probPct = Math.round(entry.result.probability * 100);
            const confidence = isPass ? probPct : 100 - probPct;
            return (
              <li
                key={entry.id}
                className="group flex flex-col gap-3 rounded-2xl border border-border/60 bg-secondary/40 p-4 transition-smooth hover:bg-secondary sm:flex-row sm:items-center"
              >
                <div
                  className={cn(
                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
                    isPass ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground",
                  )}
                >
                  {isPass ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                    <span className="font-bold text-foreground">
                      {entry.result.label}{" "}
                      <span className="text-xs font-medium text-muted-foreground">
                        · {confidence}% confidence
                      </span>
                    </span>
                    {entry.result.driftDetected && (
                      <span className="rounded-full bg-warning/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-warning-foreground">
                        Drift
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formatTime(entry.savedAt)} · Att {entry.inputs.attendance}% · Marks{" "}
                    {entry.inputs.marks}% · {entry.inputs.studyHours}h/day
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => onReload(entry)}
                  >
                    <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
                    Reload
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="rounded-xl text-destructive hover:bg-destructive-soft hover:text-destructive"
                    onClick={() => onDelete(entry.id)}
                    aria-label="Delete prediction"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
};
