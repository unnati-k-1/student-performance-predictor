import { useEffect, useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { InputCard } from "@/components/InputCard";
import { ResultCard } from "@/components/ResultCard";
import { PerformanceCard } from "@/components/PerformanceCard";
import { SaveActions, decodeSharedInputs } from "@/components/SaveActions";
import { HistoryPanel } from "@/components/HistoryPanel";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { predict, type Inputs, type PredictionResult } from "@/lib/predictor";
import {
  deleteFromHistory,
  loadHistory,
  type SavedPrediction,
} from "@/lib/predictionStorage";

const Index = () => {
  const [inputs, setInputs] = useState<Inputs>({
    attendance: 75,
    marks: 65,
    studyHours: 4,
  });
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [history, setHistory] = useState<SavedPrediction[]>([]);
  const [shareError, setShareError] = useState<string | null>(null);

  // Load saved history + any inputs encoded in the URL hash on first mount.
  useEffect(() => {
    setHistory(loadHistory());

    const shared = decodeSharedInputs();
    if (!shared) return;

    if (shared.ok && shared.inputs) {
      setInputs(shared.inputs);
      setResult(predict(shared.inputs));
      toast.success("Loaded shared prediction");
    } else {
      setShareError(shared.error ?? "The shared link could not be loaded.");
      // Strip the bad hash so a refresh starts clean.
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    }
  }, []);

  const handlePredict = () => {
    setResult(predict(inputs));
  };

  const handleSaved = (entry: SavedPrediction) => {
    setHistory((prev) => [entry, ...prev.filter((p) => p.id !== entry.id)].slice(0, 10));
  };

  const handleReload = (entry: SavedPrediction) => {
    setInputs(entry.inputs);
    setResult(entry.result);
    toast.success("Prediction reloaded", {
      description: new Date(entry.savedAt).toLocaleString(),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (id: string) => {
    const next = deleteFromHistory(id);
    setHistory(next);
    toast.success("Prediction deleted");
  };

  return (
    <main className="min-h-screen px-4 py-10 md:py-16">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <header className="mb-10 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/70 px-4 py-1.5 text-xs font-semibold text-muted-foreground shadow-soft backdrop-blur-sm print:hidden">
            <span className="h-2 w-2 animate-pulse rounded-full bg-success" />
            ML Model · Live Drift Monitoring
          </div>
          <h1 className="mb-3 text-4xl font-extrabold tracking-tight md:text-6xl">
            <span className="text-gradient-hero">🎓 Student Result</span>
            <br className="md:hidden" />
            <span className="text-foreground"> Predictor v2</span>
          </h1>
          <p className="mx-auto max-w-2xl text-base text-muted-foreground md:text-lg">
            Predict whether a student will <span className="font-semibold text-success">Pass</span> or{" "}
            <span className="font-semibold text-destructive">Fail</span> using a trained Logistic Regression model
            — with real-time data drift detection.
          </p>
        </header>

        {shareError && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-2xl border border-warning/40 bg-warning-soft p-4 shadow-soft"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-warning text-warning-foreground">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">Couldn't load shared prediction</p>
              <p className="text-sm text-muted-foreground">{shareError}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Using default inputs instead. You can adjust them and run a new prediction.
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl"
              onClick={() => setShareError(null)}
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Main grid */}
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <InputCard values={inputs} onChange={setInputs} onPredict={handlePredict} />
          </div>
          <div className="lg:col-span-2">
            <ResultCard result={result} />
          </div>
          <div className="lg:col-span-5">
            <SaveActions inputs={inputs} result={result} onSaved={handleSaved} />
          </div>
          <div className="lg:col-span-5">
            <HistoryPanel history={history} onReload={handleReload} onDelete={handleDelete} />
          </div>
          <div className="lg:col-span-5">
            <PerformanceCard />
          </div>
        </div>

        <footer className="mt-10 text-center text-xs text-muted-foreground">
          Built with Logistic Regression · Drift threshold = 1.5σ from training mean
        </footer>
      </div>
    </main>
  );
};

export default Index;
