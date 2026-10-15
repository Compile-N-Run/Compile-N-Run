"""Reproducible, local-only mixed-data classification tutorial.

Run in a copy of this directory after installing requirements.txt.
Generated reports and optional trusted model artifacts go to --output-dir.
"""
from __future__ import annotations

import argparse
import json
import platform
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
import sklearn
from sklearn.compose import ColumnTransformer
from sklearn.datasets import make_classification
from sklearn.dummy import DummyClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    accuracy_score,
    average_precision_score,
    balanced_accuracy_score,
    confusion_matrix,
    f1_score,
    roc_auc_score,
)
from sklearn.model_selection import GridSearchCV, StratifiedKFold, train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler


def make_table(seed: int) -> tuple[pd.DataFrame, np.ndarray]:
    """Generate independent synthetic rows; no files or network are needed."""
    values, target = make_classification(
        n_samples=800,
        n_features=5,
        n_informative=4,
        n_redundant=0,
        weights=[0.7, 0.3],
        class_sep=1.2,
        flip_y=0.02,
        random_state=seed,
    )
    rng = np.random.default_rng(seed)
    table = pd.DataFrame(values, columns=[f"measurement_{i}" for i in range(5)])
    # This category is independent of the target. It demonstrates mixed inputs,
    # not a claim that every available field is predictive.
    table["channel"] = rng.choice(["email", "chat", "phone"], size=len(table))
    table.loc[rng.random(len(table)) < 0.08, "measurement_0"] = np.nan
    return table, target


def build_workflow() -> Pipeline:
    numeric_columns = [f"measurement_{i}" for i in range(5)]
    numeric = Pipeline([
        ("impute", SimpleImputer(strategy="median")),
        ("scale", StandardScaler()),
    ])
    prepare = ColumnTransformer([
        ("numeric", numeric, numeric_columns),
        ("category", OneHotEncoder(handle_unknown="ignore"), ["channel"]),
    ], remainder="drop")
    return Pipeline([
        ("prepare", prepare),
        ("model", LogisticRegression(max_iter=2000)),
    ])


def metrics(estimator, features: pd.DataFrame, target: np.ndarray) -> dict:
    prediction = estimator.predict(features)
    positive_column = int(np.flatnonzero(estimator.classes_ == 1)[0])
    scores = estimator.predict_proba(features)[:, positive_column]
    return {
        "accuracy": float(accuracy_score(target, prediction)),
        "balanced_accuracy": float(balanced_accuracy_score(target, prediction)),
        "f1_positive": float(f1_score(target, prediction, zero_division=0)),
        "average_precision": float(average_precision_score(target, scores)),
        "roc_auc": float(roc_auc_score(target, scores)),
        "confusion_matrix_labels_0_1": confusion_matrix(target, prediction, labels=[0, 1]).tolist(),
    }


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output-dir", type=Path, default=Path("artifacts"))
    parser.add_argument("--seed", type=int, default=42)
    parser.add_argument("--save-model", action="store_true", help="Save and round-trip a trusted local joblib model.")
    args = parser.parse_args()
    if not 0 <= args.seed < 2**32:
        parser.error("--seed must be between 0 and 2**32 - 1")

    X, y = make_table(args.seed)
    dev_index, test_index = train_test_split(
        np.arange(len(y)), test_size=0.2, stratify=y, random_state=args.seed
    )
    assert set(dev_index).isdisjoint(test_index)
    X_dev, X_test = X.iloc[dev_index], X.iloc[test_index]
    y_dev, y_test = y[dev_index], y[test_index]

    cv = StratifiedKFold(n_splits=4, shuffle=True, random_state=args.seed)
    search = GridSearchCV(
        build_workflow(),
        {"model__C": [0.1, 1.0, 10.0], "model__class_weight": [None, "balanced"]},
        scoring="balanced_accuracy",
        cv=cv,
        refit=True,
        n_jobs=1,
        error_score="raise",
    )
    # Every CV clone learns its imputation, scaling, and encoding on its fold.
    search.fit(X_dev, y_dev)
    baseline = DummyClassifier(strategy="most_frequent").fit(X_dev, y_dev)
    # Final test labels first enter evaluation after selection is complete.
    report = {
        "data": "make_classification plus independent synthetic channel and missingness",
        "seed": args.seed,
        "versions": {
            "python": platform.python_version(),
            "scikit_learn": sklearn.__version__,
            "numpy": np.__version__,
            "pandas": pd.__version__,
            "joblib": joblib.__version__,
        },
        "rows": {"development": len(dev_index), "test": len(test_index)},
        "raw_feature_columns": X.columns.tolist(),
        "positive_fraction_test": float(y_test.mean()),
        "cv_folds": 4,
        "candidate_count": len(search.cv_results_["params"]),
        "selection_metric": "balanced_accuracy",
        "best_parameters": search.best_params_,
        "best_cv_score": float(search.best_score_),
        "transformed_feature_names": search.best_estimator_.named_steps["prepare"].get_feature_names_out().tolist(),
        "baseline_test": metrics(baseline, X_test, y_test),
        "model_test": metrics(search.best_estimator_, X_test, y_test),
    }
    args.output_dir.mkdir(parents=True, exist_ok=True)
    report_path = args.output_dir / "report.json"
    report_path.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")

    if args.save_model:
        model_path = args.output_dir / "model.joblib"
        joblib.dump(search.best_estimator_, model_path)
        # Only load the artifact just created by this trusted process.
        restored = joblib.load(model_path)
        np.testing.assert_array_equal(restored.predict(X_test), search.predict(X_test))
        print(f"Saved trusted model; round-trip predictions match: {model_path}")

    print(f"Report: {report_path}")
    print(f"Development/test rows: {len(dev_index)}/{len(test_index)}")
    print(f"Selected parameters: {search.best_params_}")
    print(f"Cross-validation balanced accuracy: {search.best_score_:.3f}")
    print(f"Baseline test balanced accuracy: {report['baseline_test']['balanced_accuracy']:.3f}")
    print(f"Model test balanced accuracy: {report['model_test']['balanced_accuracy']:.3f}")


if __name__ == "__main__":
    main()
