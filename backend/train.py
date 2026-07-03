import json
import pickle
import os
import urllib.request
import io
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import accuracy_score, classification_report, roc_auc_score, confusion_matrix

# Load real German credit dataset from UCI Machine Learning Repository
DATA_URL = "https://archive.ics.uci.edu/ml/machine-learning-databases/statlog/german/german.data"

COLUMN_NAMES = [
    "checking_account_status", "duration_months", "credit_history", "loan_purpose",
    "credit_amount", "savings_account", "employment_since", "installment_rate_pct",
    "personal_status_sex", "other_debtors", "present_residence_since", "property",
    "age", "other_installment_plans", "housing", "existing_credits", "job",
    "dependents", "telephone", "foreign_worker", "creditworthiness"
]

try:
    raw = urllib.request.urlopen(DATA_URL, timeout=15).read().decode("utf-8")
    df_raw = pd.read_csv(io.StringIO(raw), sep=" ", header=None, names=COLUMN_NAMES)
    print(f"Loaded {len(df_raw)} bank applicant records")
except Exception as e:
    print(f"Error loading dataset: {e}")
    raise

# Map target (1: Good/Approved, 2: Bad/Rejected) to binary (1: Approved, 0: Rejected)
df_raw["approved"] = (df_raw["creditworthiness"] == 1).astype(int)

# Map categorical codes to readable values
CHECKING_MAP = {"A11": "no_checking", "A12": "below_0", "A13": "0_to_200", "A14": "above_200"}
CREDIT_HIST_MAP = {
    "A30": "no_credits_taken", "A31": "all_credits_paid", 
    "A32": "existing_credits_paid", "A33": "delay_in_past", "A34": "critical_account"
}
SAVINGS_MAP = {"A61": "below_100", "A62": "100_to_500", "A63": "500_to_1000", "A64": "above_1000", "A65": "unknown_none"}
EMPLOYMENT_MAP = {"A71": "unemployed", "A72": "below_1yr", "A73": "1_to_4yr", "A74": "4_to_7yr", "A75": "above_7yr"}
LOAN_PURPOSE_MAP = {
    "A40": "car_new", "A41": "car_used", "A42": "furniture", "A43": "radio_tv",
    "A44": "domestic_appliance", "A45": "repairs", "A46": "education",
    "A47": "vacation", "A48": "retraining", "A49": "business", "A410": "others"
}

df = df_raw.copy()
df["checking_account_status"] = df["checking_account_status"].map(CHECKING_MAP).fillna("unknown")
df["credit_history"] = df["credit_history"].map(CREDIT_HIST_MAP).fillna("unknown")
df["savings_account"] = df["savings_account"].map(SAVINGS_MAP).fillna("unknown")
df["employment_since"] = df["employment_since"].map(EMPLOYMENT_MAP).fillna("unknown")
df["loan_purpose_mapped"] = df["loan_purpose"].map(LOAN_PURPOSE_MAP).fillna("others")

# Derive features
df["credit_amount_log"] = np.log1p(df["credit_amount"])
df["amount_per_month"] = df["credit_amount"] / df["duration_months"]
df["high_risk_purpose"] = df["loan_purpose_mapped"].isin(["vacation", "others"]).astype(int)
df["good_savings"] = df["savings_account"].isin(["500_to_1000", "above_1000"]).astype(int)
df["stable_employment"] = df["employment_since"].isin(["4_to_7yr", "above_7yr"]).astype(int)
df["good_checking"] = df["checking_account_status"].isin(["0_to_200", "above_200"]).astype(int)

NUMERIC_FEATURES = [
    "duration_months", "credit_amount", "credit_amount_log", "amount_per_month",
    "installment_rate_pct", "present_residence_since", "age", "existing_credits",
    "dependents", "high_risk_purpose", "good_savings", "stable_employment", "good_checking"
]

CAT_FEATURES_RAW = {
    "checking_account_status": ["no_checking", "below_0", "0_to_200", "above_200"],
    "credit_history": ["no_credits_taken", "all_credits_paid", "existing_credits_paid", "delay_in_past", "critical_account"],
    "savings_account": ["below_100", "100_to_500", "500_to_1000", "above_1000", "unknown_none"],
    "employment_since": ["unemployed", "below_1yr", "1_to_4yr", "4_to_7yr", "above_7yr"],
    "loan_purpose_mapped": ["car_new", "car_used", "furniture", "radio_tv", "domestic_appliance",
                            "repairs", "education", "vacation", "retraining", "business", "others"]
}
CATEGORICAL_FEATURES = list(CAT_FEATURES_RAW.keys())

def build_features(data: pd.DataFrame) -> np.ndarray:
    num = data[NUMERIC_FEATURES].fillna(data[NUMERIC_FEATURES].median()).values
    cats = []
    for feat, categories in CAT_FEATURES_RAW.items():
        for cat in categories:
            cats.append((data[feat] == cat).astype(int).values.reshape(-1, 1))
    return np.hstack([num] + cats)

X = build_features(df)
y = df["approved"].values

X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# Train models
models = {
    "Logistic Regression": Pipeline([
        ("scaler", StandardScaler()),
        ("clf", LogisticRegression(max_iter=1000, C=1.0, class_weight="balanced", random_state=42)),
    ]),
    "Random Forest": Pipeline([
        ("clf", RandomForestClassifier(n_estimators=200, max_depth=8, min_samples_leaf=5, class_weight="balanced", random_state=42)),
    ]),
    "Gradient Boosting": Pipeline([
        ("scaler", StandardScaler()),
        ("clf", GradientBoostingClassifier(n_estimators=200, max_depth=4, learning_rate=0.05, random_state=42)),
    ]),
}

best_model = None
best_auc = 0
best_name = ""

for name, pipeline in models.items():
    pipeline.fit(X_train, y_train)
    y_pred = pipeline.predict(X_test)
    y_proba = pipeline.predict_proba(X_test)[:, 1]
    acc = accuracy_score(y_test, y_pred)
    auc = roc_auc_score(y_test, y_proba)
    
    if auc > best_auc:
        best_auc = auc
        best_model = pipeline
        best_name = name

print(f"Best model: {best_name} (ROC-AUC = {best_auc:.4f})")

# Save model and meta JSON
os.makedirs("backend", exist_ok=True)

with open("backend/model.pkl", "wb") as f:
    pickle.dump(best_model, f)

medians = {col: float(df[col].median()) for col in NUMERIC_FEATURES}
modes = {col: str(df[col].mode()[0]) for col in CATEGORICAL_FEATURES}

meta = {
    "numeric_features": NUMERIC_FEATURES,
    "categorical_features": CATEGORICAL_FEATURES,
    "categorical_categories": CAT_FEATURES_RAW,
    "thresholds": {"approve": 0.5, "risk_low": 0.72, "risk_medium": 0.50},
    "medians": medians,
    "modes": modes,
    "dataset_info": {
        "source": "UCI Statlog German Credit Dataset",
        "url": "https://archive.ics.uci.edu/dataset/144/statlog+german+credit+data",
        "records": len(df),
        "features": 20,
        "model": best_name
    }
}

with open("backend/meta.json", "w") as f:
    json.dump(meta, f, indent=2)

print("Saved model and meta configuration successfully")
