from __future__ import annotations
import json
import os
import pickle
from pathlib import Path
from typing import Optional

import numpy as np
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Load ML model and features metadata
BASE = Path(__file__).parent
MODEL_PATH = BASE / "model.pkl"
META_PATH = BASE / "meta.json"

if not MODEL_PATH.exists():
    raise FileNotFoundError("model.pkl not found - run train.py first.")

with open(MODEL_PATH, "rb") as f:
    PIPELINE = pickle.load(f)

with open(META_PATH, "r") as f:
    META = json.load(f)

NUMERIC_FEATURES = META["numeric_features"]
CATEGORICAL_FEATURES = META["categorical_features"]
CAT_CATEGORIES = META["categorical_categories"]
THRESHOLDS = META["thresholds"]
MEDIANS = META["medians"]
MODES = META["modes"]

app = FastAPI(
    title="LenderConnect ML API",
    description="Loan approval predictions based on the UCI German Credit dataset.",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class PredictRequest(BaseModel):
    applicant_name: str = Field(..., example="Ramesh Kumar")
    age: float = Field(..., ge=18, le=80)
    credit_score: float = Field(..., ge=300, le=900)
    annual_income: float = Field(..., gt=0)
    monthly_income: float = Field(..., gt=0)
    loan_amount: float = Field(..., gt=0)
    loan_term: int = Field(..., gt=0)
    existing_debt: float = Field(0.0, ge=0)
    business_age_months: Optional[int] = Field(None, ge=0)
    employment_status: Optional[str] = None
    loan_purpose: Optional[str] = None
    savings_level: Optional[str] = None

class PredictResponse(BaseModel):
    approved: bool
    probability: float
    risk_level: str
    risk_score: int
    approval_probability: int
    interest_rate: float
    emi: float
    recommended_loan: float
    model_name: str
    dataset: str

def calculate_emi(principal: float, annual_rate: float, months: int) -> float:
    r = annual_rate / 12 / 100
    if r == 0:
        return round(principal / months, 2)
    emi = principal * r * (1 + r) ** months / ((1 + r) ** months - 1)
    return round(emi, 2)

def calculate_interest_rate(credit_score: float) -> float:
    if credit_score >= 750: return 12.0
    if credit_score >= 700: return 14.0
    if credit_score >= 650: return 16.0
    if credit_score >= 550: return 18.0
    return 22.0

def calculate_recommended_loan(monthly_income: float, existing_debt: float, credit_score: float) -> float:
    if credit_score >= 750: mult = 8
    elif credit_score >= 700: mult = 6
    elif credit_score >= 650: mult = 4
    else: mult = 3
    max_loan = (monthly_income * mult) - existing_debt
    return max(0.0, round(max_loan / 10000) * 10000)

def map_employment(emp: Optional[str]) -> str:
    if not emp:
        return "1_to_4yr"
    mapping = {
        "Employed": "4_to_7yr",
        "Self-employed": "1_to_4yr",
        "Retired": "above_7yr",
        "Student": "below_1yr",
        "Unemployed": "unemployed",
    }
    return mapping.get(emp, "1_to_4yr")

def map_purpose(purpose: Optional[str]) -> str:
    if not purpose:
        return "others"
    mapping = {
        "Business": "business",
        "Car": "car_new",
        "Debt consolidation": "others",
        "Education": "education",
        "Home": "furniture",
        "Medical": "others",
        "Other": "others",
        "Vacation": "vacation",
    }
    return mapping.get(purpose, "others")

def build_feature_vector(req: PredictRequest) -> np.ndarray:
    import math
    interest_rate = calculate_interest_rate(req.credit_score)
    emi = calculate_emi(req.loan_amount, interest_rate, req.loan_term)
    
    # Map request values to UCI features
    credit_amount_log = math.log1p(req.loan_amount)
    amount_per_month = req.loan_amount / max(req.loan_term, 1)
    employment = map_employment(req.employment_status)
    purpose = map_purpose(req.loan_purpose)
    savings = req.savings_level or MODES.get("savings_account", "below_100")

    if req.credit_score >= 750:
        checking = "above_200"
    elif req.credit_score >= 650:
        checking = "0_to_200"
    elif req.credit_score >= 550:
        checking = "below_0"
    else:
        checking = "no_checking"

    emi_ratio_pct = (emi / max(req.monthly_income, 1)) * 100
    if emi_ratio_pct < 20: installment_rate = 1
    elif emi_ratio_pct < 33: installment_rate = 2
    elif emi_ratio_pct < 50: installment_rate = 3
    else: installment_rate = 4

    high_risk_purpose = 1 if purpose in ["vacation", "others"] else 0
    good_savings = 1 if savings in ["500_to_1000", "above_1000"] else 0
    stable_employment = 1 if employment in ["4_to_7yr", "above_7yr"] else 0
    good_checking = 1 if checking in ["0_to_200", "above_200"] else 0

    num_values = {
        "duration_months": req.loan_term,
        "credit_amount": req.loan_amount,
        "credit_amount_log": credit_amount_log,
        "amount_per_month": amount_per_month,
        "installment_rate_pct": installment_rate,
        "present_residence_since": 3,
        "age": req.age,
        "existing_credits": 1,
        "dependents": 1,
        "high_risk_purpose": high_risk_purpose,
        "good_savings": good_savings,
        "stable_employment": stable_employment,
        "good_checking": good_checking,
    }

    cat_values = {
        "checking_account_status": checking,
        "credit_history": "existing_credits_paid",
        "savings_account": savings,
        "employment_since": employment,
        "loan_purpose_mapped": purpose,
    }

    num_vec = [num_values.get(f, MEDIANS.get(f, 0)) for f in NUMERIC_FEATURES]
    cat_vec = []
    for feat in CATEGORICAL_FEATURES:
        for cat in CAT_CATEGORIES[feat]:
            cat_vec.append(1 if cat_values[feat] == cat else 0)

    return np.array(num_vec + cat_vec, dtype=float).reshape(1, -1)

@app.get("/api/health")
def health():
    dataset_info = META.get("dataset_info", {})
    return {
        "status": "ok",
        "model": dataset_info.get("model", "Unknown"),
        "dataset": dataset_info.get("source", "Unknown"),
        "records_trained_on": dataset_info.get("records", 0),
        "features": len(NUMERIC_FEATURES) + len(CATEGORICAL_FEATURES),
    }

@app.post("/api/predict", response_model=PredictResponse)
def predict(req: PredictRequest):
    try:
        X = build_feature_vector(req)
        proba = float(PIPELINE.predict_proba(X)[0][1])
        approved = proba >= THRESHOLDS["approve"]

        if proba >= THRESHOLDS["risk_low"]:
            risk_level = "Low"
        elif proba >= THRESHOLDS["risk_medium"]:
            risk_level = "Medium"
        else:
            risk_level = "High"

        interest_rate = calculate_interest_rate(req.credit_score)
        emi = calculate_emi(req.loan_amount, interest_rate, req.loan_term)
        recommended = calculate_recommended_loan(req.monthly_income, req.existing_debt, req.credit_score)
        dataset_info = META.get("dataset_info", {})

        return PredictResponse(
            approved=approved,
            probability=round(proba, 4),
            risk_level=risk_level,
            risk_score=round((1 - proba) * 100),
            approval_probability=round(proba * 100),
            interest_rate=interest_rate,
            emi=emi,
            recommended_loan=recommended,
            model_name=dataset_info.get("model", "ML Model"),
            dataset=dataset_info.get("source", "UCI German Credit Dataset"),
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
