import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { GraduationCap, Sparkles } from "lucide-react";
import type { Inputs } from "@/lib/predictor";

type Props = {
  values: Inputs;
  onChange: (next: Inputs) => void;
  onPredict: () => void;
};

const Field = ({
  label,
  emoji,
  value,
  unit,
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  emoji: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
}) => (
  <div className="space-y-3 rounded-2xl bg-secondary/50 p-5 transition-smooth hover:bg-secondary">
    <div className="flex items-center justify-between">
      <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <span className="text-lg">{emoji}</span>
        {label}
      </label>
      <span className="rounded-full bg-card px-3 py-1 text-sm font-bold text-primary shadow-soft">
        {value}
        <span className="ml-1 text-xs font-medium text-muted-foreground">{unit}</span>
      </span>
    </div>
    <Slider
      value={[value]}
      min={min}
      max={max}
      step={step}
      onValueChange={(v) => onChange(v[0])}
      className="cursor-pointer"
    />
    <div className="flex justify-between text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
      <span>{min}{unit}</span>
      <span>{max}{unit}</span>
    </div>
  </div>
);

export const InputCard = ({ values, onChange, onPredict }: Props) => {
  return (
    <Card className="rounded-3xl border-border/60 bg-card p-6 shadow-card md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl gradient-primary shadow-glow">
          <GraduationCap className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Student Profile</h2>
          <p className="text-sm text-muted-foreground">Adjust the inputs to predict the outcome</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Attendance"
          emoji="📅"
          value={values.attendance}
          unit="%"
          min={0}
          max={100}
          step={1}
          onChange={(v) => onChange({ ...values, attendance: v })}
        />
        <Field
          label="Marks"
          emoji="📝"
          value={values.marks}
          unit="%"
          min={0}
          max={100}
          step={1}
          onChange={(v) => onChange({ ...values, marks: v })}
        />
        <div className="md:col-span-2">
          <Field
            label="Study Hours"
            emoji="📚"
            value={values.studyHours}
            unit="hrs/day"
            min={0}
            max={12}
            step={0.5}
            onChange={(v) => onChange({ ...values, studyHours: v })}
          />
        </div>
      </div>

      <Button
        onClick={onPredict}
        size="lg"
        className="mt-6 w-full rounded-2xl gradient-primary text-base font-semibold text-primary-foreground shadow-glow transition-smooth hover:scale-[1.01] hover:shadow-glow hover:brightness-110"
      >
        <Sparkles className="mr-2 h-5 w-5" />
        Predict Result
      </Button>
    </Card>
  );
};
