import { Card } from "@/components/ui/card";
import {
  Activity,
  Database,
  Brain,
  Users,
  CheckCircle,
  XCircle,
  BookOpen,
  Clock
} from "lucide-react";

import { useEffect, useState } from "react";
import Papa from "papaparse";
import { MODEL_ACCURACY } from "@/lib/predictor";

export const PerformanceCard = () => {
  const pct = Math.round(MODEL_ACCURACY * 1000) / 10; // e.g. 91.2
  const [stats, setStats] = useState({
  total: 0,
  pass: 0,
  fail: 0,
  attendance: 0,
  marks: 0,
  studyHours: 0,
  });

  useEffect(() => {
    fetch("/data/student_data.csv")
      .then((res) => res.text())
      .then((text) => {
        const parsed = Papa.parse(text, {
          header: true,
          dynamicTyping: true,
        });

        const rows = parsed.data.filter((row: any) => row.attendance);

        const total = rows.length;

        const pass = rows.filter(
          (row: any) => row.result === "Pass"
        ).length;

        const fail = total - pass;

        const attendance =
          rows.reduce((sum: number, row: any) => sum + row.attendance, 0) / total;

        const marks =
          rows.reduce((sum: number, row: any) => sum + row.marks, 0) / total;

        const studyHours =
          rows.reduce((sum: number, row: any) => sum + row.study_hours, 0) / total;

        setStats({
          total,
          pass,
          fail,
          attendance,
          marks,
          studyHours,
        });
      });
  }, []);

  return (
    <Card className="rounded-3xl border-border/60 bg-card p-6 shadow-card md:p-8">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl gradient-primary shadow-glow">
          <Activity className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Model Performance</h2>
          <p className="text-sm text-muted-foreground">Logistic Regression • Trained on Student Academic Dataset</p>
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
            <p className="text-sm font-bold text-foreground">{stats.total} Samples</p>
          </div>
        </div>
      </div>
      <div className="mt-6 rounded-2xl bg-secondary/40 p-5">
        <h3 className="mb-4 text-lg font-bold">
          📊 Training Dataset Summary
        </h3>

        <div className="grid grid-cols-2 gap-4">

          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-xs text-muted-foreground">Total Samples</p>
              <p className="font-bold">{stats.total}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-xs text-muted-foreground">Pass Students</p>
              <p className="font-bold">{stats.pass}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-xs text-muted-foreground">Fail Students</p>
              <p className="font-bold">{stats.fail}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-violet-500" />
            <div>
              <p className="text-xs text-muted-foreground">Avg Attendance</p>
              <p className="font-bold">
                {stats.attendance.toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-xs text-muted-foreground">Avg Marks</p>
              <p className="font-bold">
                {stats.marks.toFixed(1)}%
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-cyan-500" />
            <div>
              <p className="text-xs text-muted-foreground">
                Avg Study Hours
              </p>
              <p className="font-bold">
                {stats.studyHours.toFixed(1)} hrs/day
              </p>
            </div>
          </div>

        </div>
      </div>
    </Card>
  );
};
