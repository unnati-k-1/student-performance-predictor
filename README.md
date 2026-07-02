# student-performance-predictor
🎓 Student Result Prediction with ML Performance Monitoring and Data Drift Detection

A complete end-to-end Machine Learning project that predicts whether a student will Pass or Fail based on academic and behavioral indicators — attendance, marks, and study hours — and continuously monitors the deployed model for performance degradation and data drift over time.

This project goes beyond a simple classification model. It simulates a realistic ML lifecycle: data generation, model training, evaluation, deployment, and post-deployment monitoring — the way a model would be maintained in a real production environment.

🧠 Project Overview

Educational institutions increasingly rely on data-driven insights to identify at-risk students early. This project builds a Logistic Regression–based classification model that predicts a student's academic outcome (Pass/Fail) using three key features:


Attendance (%)
Marks (%)
Study Hours (hrs/day)


But predicting outcomes is only half the challenge. In real-world deployments, models degrade silently as the underlying data distribution shifts — a phenomenon known as data drift. This project implements a monitoring layer that:


Tracks live model performance against a validation baseline.
Detects statistical drift between training data and new incoming data.
Raises alerts when retraining may be necessary.


This makes the project a practical demonstration of MLOps fundamentals — not just building a model, but keeping it trustworthy over time.