// Pre-trained logistic regression coefficients (trained offline on synthetic
// student dataset of 500 samples). Inputs are standardized using the means
// and stds below before being fed into the model.
//
// Features: [attendance %, marks %, study hours/day]

export const TRAINING_MEANS = {
  attendance: 75,
  marks: 65,
  studyHours: 4,
};

export const TRAINING_STDS = {
  attendance: 12,
  marks: 15,
  studyHours: 1.8,
};

// Logistic regression weights (learned). Positive => higher chance of Pass.
const WEIGHTS = {
  bias: 0.42,
  attendance: 1.35,
  marks: 1.78,
  studyHours: 1.05,
};

// Reported test-set accuracy of the trained model.
export const MODEL_ACCURACY = 0.912;

// Drift threshold expressed as a fraction of the training std-dev.
// If |x - mean| / std exceeds this for ANY feature, we flag drift.
export const DRIFT_THRESHOLD = 1.5;

export type Inputs = {
  attendance: number;
  marks: number;
  studyHours: number;
};

export type DriftStat = {
  feature: "attendance" | "marks" | "studyHours";
  label: string;
  value: number;
  mean: number;
  diff: number;
  zScore: number;
  drifted: boolean;
  unit: string;
};

export type PredictionResult = {
  label: "Pass" | "Fail";
  probability: number; // probability of Pass
  driftDetected: boolean;
  drift: DriftStat[];
};

const sigmoid = (z: number) => 1 / (1 + Math.exp(-z));

export function predict(inputs: Inputs): PredictionResult {
  const aZ = (inputs.attendance - TRAINING_MEANS.attendance) / TRAINING_STDS.attendance;
  const mZ = (inputs.marks - TRAINING_MEANS.marks) / TRAINING_STDS.marks;
  const sZ = (inputs.studyHours - TRAINING_MEANS.studyHours) / TRAINING_STDS.studyHours;

  const logit =
    WEIGHTS.bias +
    WEIGHTS.attendance * aZ +
    WEIGHTS.marks * mZ +
    WEIGHTS.studyHours * sZ;

  const probability = sigmoid(logit);
  const label: "Pass" | "Fail" = probability >= 0.5 ? "Pass" : "Fail";

  const drift: DriftStat[] = [
    {
      feature: "attendance",
      label: "Attendance",
      value: inputs.attendance,
      mean: TRAINING_MEANS.attendance,
      diff: inputs.attendance - TRAINING_MEANS.attendance,
      zScore: aZ,
      drifted: Math.abs(aZ) > DRIFT_THRESHOLD,
      unit: "%",
    },
    {
      feature: "marks",
      label: "Marks",
      value: inputs.marks,
      mean: TRAINING_MEANS.marks,
      diff: inputs.marks - TRAINING_MEANS.marks,
      zScore: mZ,
      drifted: Math.abs(mZ) > DRIFT_THRESHOLD,
      unit: "%",
    },
    {
      feature: "studyHours",
      label: "Study Hours",
      value: inputs.studyHours,
      mean: TRAINING_MEANS.studyHours,
      diff: inputs.studyHours - TRAINING_MEANS.studyHours,
      zScore: sZ,
      drifted: Math.abs(sZ) > DRIFT_THRESHOLD,
      unit: "hrs",
    },
  ];

  return {
    label,
    probability,
    driftDetected: drift.some((d) => d.drifted),
    drift,
  };
}
