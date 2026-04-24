import { z } from "zod";
import type { Inputs, PredictionResult } from "@/lib/predictor";

const STORAGE_KEY = "srp:history";
const MAX_HISTORY = 10;

export const inputsSchema = z.object({
  attendance: z.number().min(0).max(100),
  marks: z.number().min(0).max(100),
  studyHours: z.number().min(0).max(24),
});

const driftStatSchema = z.object({
  feature: z.enum(["attendance", "marks", "studyHours"]),
  label: z.string(),
  value: z.number(),
  mean: z.number(),
  diff: z.number(),
  zScore: z.number(),
  drifted: z.boolean(),
  unit: z.string(),
});

const resultSchema = z.object({
  label: z.enum(["Pass", "Fail"]),
  probability: z.number().min(0).max(1),
  driftDetected: z.boolean(),
  drift: z.array(driftStatSchema),
});

export type SavedPrediction = {
  id: string;
  savedAt: string;
  inputs: Inputs;
  result: PredictionResult;
};

export const savedPredictionSchema = z.object({
  id: z.string(),
  savedAt: z.string(),
  inputs: inputsSchema,
  result: resultSchema,
});

const historySchema = z.array(savedPredictionSchema);

export const sharedPayloadSchema = z.object({
  i: inputsSchema,
});

export function loadHistory(): SavedPrediction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const result = historySchema.safeParse(parsed);
    return result.success ? (result.data as SavedPrediction[]) : [];
  } catch {
    return [];
  }
}

export function saveToHistory(inputs: Inputs, result: PredictionResult): SavedPrediction {
  const entry: SavedPrediction = {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    savedAt: new Date().toISOString(),
    inputs,
    result,
  };
  const next = [entry, ...loadHistory()].slice(0, MAX_HISTORY);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return entry;
}

export function deleteFromHistory(id: string): SavedPrediction[] {
  const next = loadHistory().filter((p) => p.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export function clearHistory(): void {
  localStorage.removeItem(STORAGE_KEY);
}
