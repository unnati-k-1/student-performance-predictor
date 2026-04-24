import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link2, Download, Save, Check } from "lucide-react";
import { toast } from "sonner";
import type { Inputs, PredictionResult } from "@/lib/predictor";
import { saveToHistory, sharedPayloadSchema, type SavedPrediction } from "@/lib/predictionStorage";
import { generatePredictionPdf } from "@/lib/pdfReport";

type Props = {
  inputs: Inputs;
  result: PredictionResult | null;
  onSaved: (entry: SavedPrediction) => void;
};

export const SaveActions = ({ inputs, result, onSaved }: Props) => {
  const [copied, setCopied] = useState(false);
  const disabled = !result;

  const handleSave = () => {
    if (!result) return;
    const entry = saveToHistory(inputs, result);
    onSaved(entry);
    toast.success("Prediction saved", {
      description: "Added to your recent predictions on this device.",
    });
  };

  const buildShareUrl = () => {
    const data = { i: inputs };
    const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
    return `${window.location.origin}${window.location.pathname}#p=${encoded}`;
  };

  const handleShare = async () => {
    if (!result) return;
    const url = buildShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Shareable link copied", {
        description: "Anyone with the link will see this prediction.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link", { description: url });
    }
  };

  const handleExportPdf = () => {
    if (!result) return;
    try {
      generatePredictionPdf(inputs, result);
      toast.success("PDF report generated");
    } catch (err) {
      console.error(err);
      toast.error("Could not generate PDF");
    }
  };

  return (
    <Card className="rounded-3xl border-border/60 bg-card p-6 shadow-card print:hidden">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl gradient-primary shadow-glow">
          <Save className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Save & Share</h2>
          <p className="text-sm text-muted-foreground">
            Save this run to your history, share a link, or download a PDF report.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Button
          onClick={handleSave}
          disabled={disabled}
          variant="secondary"
          size="lg"
          className="rounded-2xl font-semibold transition-smooth hover:scale-[1.01]"
        >
          <Save className="mr-2 h-4 w-4" />
          Save Prediction
        </Button>
        <Button
          onClick={handleShare}
          disabled={disabled}
          size="lg"
          className="rounded-2xl gradient-primary font-semibold text-primary-foreground shadow-glow transition-smooth hover:scale-[1.01] hover:brightness-110"
        >
          {copied ? <Check className="mr-2 h-4 w-4" /> : <Link2 className="mr-2 h-4 w-4" />}
          {copied ? "Link Copied!" : "Copy Share Link"}
        </Button>
        <Button
          onClick={handleExportPdf}
          disabled={disabled}
          variant="outline"
          size="lg"
          className="rounded-2xl font-semibold transition-smooth hover:scale-[1.01]"
        >
          <Download className="mr-2 h-4 w-4" />
          Export as PDF
        </Button>
      </div>

      {disabled && (
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Run a prediction first to enable saving and sharing.
        </p>
      )}
    </Card>
  );
};

export type ShareLinkResult = {
  ok: boolean;
  inputs?: Inputs;
  error?: string;
};

export const decodeSharedInputs = (): ShareLinkResult | null => {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash;
  const match = hash.match(/p=([^&]+)/);
  if (!match) return null;

  let json: string;
  try {
    json = decodeURIComponent(escape(atob(match[1])));
  } catch {
    return { ok: false, error: "The shared link is malformed and could not be decoded." };
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    return { ok: false, error: "The shared link contains invalid data." };
  }

  const result = sharedPayloadSchema.safeParse(parsed);
  if (!result.success) {
    const first = result.error.issues[0];
    return {
      ok: false,
      error: first
        ? `Shared link is missing or has invalid fields (${first.path.join(".") || "payload"}: ${first.message}).`
        : "The shared link is missing required fields.",
    };
  }
  return { ok: true, inputs: result.data.i as Inputs };
};
