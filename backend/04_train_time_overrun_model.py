"""Train a leakage-safe time-overrun monitoring classifier."""
from pathlib import Path
import argparse, json, joblib
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score, roc_auc_score, average_precision_score, brier_score_loss
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from xgboost import XGBClassifier

ROOT=Path(__file__).resolve().parents[1]
FEATURES=["log_original_cost","planned_duration_months","approval_to_start_months","project_age_months","physical_progress_pct","cumulative_expenditure_cr","expenditure_pct_of_original","progress_minus_expenditure_pct","progress_per_age_month","progress_velocity_pct_month","expenditure_velocity_cr_month","approval_year","start_year","is_multi_state","agency_hist_time_overrun_rate","sector_hist_time_overrun_rate","ministry_hist_time_overrun_rate"]
CATS=["agency","ministry","sector","state"]

def main():
    ap=argparse.ArgumentParser(); ap.add_argument("--input",default=str(ROOT/"data"/"snapshot_features.csv")); ap.add_argument("--model-out",default=str(ROOT/"backend"/"models"/"time_monitor.joblib")); ap.add_argument("--metrics-out",default=str(ROOT/"results"/"time_monitor_metrics.json")); args=ap.parse_args()
    d=pd.read_csv(args.input); d["month_dt"]=pd.to_datetime(d["month"]+"-01"); d["is_time_overrun"]=pd.to_numeric(d["is_time_overrun"],errors="coerce")
    d=d.dropna(subset=["is_time_overrun","original_cost_cr"])
    months=sorted(d.month_dt.dropna().unique()); test_month=months[-1]
    tr=d[d.month_dt<test_month]; te=d[d.month_dt==test_month]
    Xtr,ytr=tr[FEATURES+CATS],tr.is_time_overrun.astype(int); Xte,yte=te[FEATURES+CATS],te.is_time_overrun.astype(int)
    pre=ColumnTransformer([("num",Pipeline([("imp",SimpleImputer(strategy="median")),("scale",StandardScaler())]),FEATURES),("cat",Pipeline([("imp",SimpleImputer(strategy="most_frequent")),("ohe",OneHotEncoder(handle_unknown="ignore"))]),CATS)])
    model=Pipeline([("prep",pre),("clf",XGBClassifier(n_estimators=300,max_depth=4,learning_rate=0.05,subsample=.85,colsample_bytree=.85,objective="binary:logistic",eval_metric="logloss",random_state=42,n_jobs=4))])
    model.fit(Xtr,ytr); p=model.predict_proba(Xte)[:,1]; pred=(p>=.5).astype(int)
    metrics={"train_months":[str(x)[:10] for x in months[:-1]],"test_month":str(test_month)[:10],"test":{"accuracy":accuracy_score(yte,pred),"precision":precision_score(yte,pred,zero_division=0),"recall":recall_score(yte,pred,zero_division=0),"f1":f1_score(yte,pred,zero_division=0),"roc_auc":roc_auc_score(yte,p),"pr_auc":average_precision_score(yte,p),"brier":brier_score_loss(yte,p),"n":len(yte),"positive_rate":float(yte.mean())}}
    Path(args.model_out).parent.mkdir(parents=True,exist_ok=True); Path(args.metrics_out).parent.mkdir(parents=True,exist_ok=True); joblib.dump(model,args.model_out); Path(args.metrics_out).write_text(json.dumps(metrics,indent=2,default=float)); print(json.dumps(metrics,indent=2,default=float))
if __name__=="__main__": main()
