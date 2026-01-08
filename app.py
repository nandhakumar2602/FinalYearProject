from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import spacy
import joblib
import os
import json
import requests
from datetime import datetime, timedelta, timezone
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from linkedinparser import LinkedInJobFetcher
import re
import dns.resolver

# -------------------- Flask App Setup --------------------
app = Flask(__name__)
CORS(app)

# -------------------- Model + Vectorizer --------------------
MODEL_PATH = r"C:\Users\nandh\FinalYear\Intelligent-Risk-Assessment-and-Detection-for-Online-Job-Postings\backend\RFCmodel"
VECTORIZER_PATH = r"C:\Users\nandh\FinalYear\Intelligent-Risk-Assessment-and-Detection-for-Online-Job-Postings\backend\TFIDF_vectorizer.joblib"
RESULTS_PATH = r"C:\Users\nandh\FinalYear\Intelligent-Risk-Assessment-and-Detection-for-Online-Job-Postings\backend\results.json"

print("[LOG] Loading model and vectorizer...")
model = joblib.load(MODEL_PATH)
vectorizer = joblib.load(VECTORIZER_PATH)
nlp = spacy.load("en_core_web_sm")
print("[LOG] Model and vectorizer loaded")

# -------------------- Adzuna API --------------------
APP_ID = "8962e12f"
APP_KEY = "b3518601c8d3d698e8eda58fa0f2fabd"

# -------------------- Text Preprocessing --------------------
def preprocess_text(text):
    doc = nlp(text)
    tokens = [token.lemma_.lower() for token in doc]
    cleaned_text = " ".join(tokens)
    X = vectorizer.transform([cleaned_text])
    return pd.DataFrame(X.toarray(), columns=vectorizer.get_feature_names_out())

def clean_job_title(title):
    return re.sub(r"\(.*?\)|\[.*?\]", "", title).strip()

# -------------------- Job Fetching --------------------
def fetch_jobs(job_title, days=30, results_per_page=20, country="in"):
    url = f"https://api.adzuna.com/v1/api/jobs/{country}/search/1"
    params = {
        "app_id": APP_ID,
        "app_key": APP_KEY,
        "results_per_page": results_per_page,
        "what": job_title,
        "max_days_old": days
    }

    response = requests.get(url, params=params)
    jobs = response.json().get("results", [])

    cutoff = datetime.now(timezone.utc) - timedelta(days=days)
    recent_jobs = []

    for job in jobs:
        created = job.get("created")
        if created:
            job_date = datetime.fromisoformat(created.replace("Z", "+00:00"))
            if job_date >= cutoff:
                job["parsed_date"] = job_date
                recent_jobs.append(job)

    return recent_jobs

# -------------------- Similarity --------------------
def find_similar_jobs(user_description, jobs, threshold=0.10):
    texts = [job.get("description", "") for job in jobs]
    if not texts:
        return []

    docs = [user_description] + texts
    tfidf = TfidfVectorizer(stop_words="english")
    matrix = tfidf.fit_transform(docs)
    sims = cosine_similarity(matrix[0:1], matrix[1:]).flatten()

    result = []
    for i, score in enumerate(sims):
        if score >= threshold:
            result.append({
                "title": jobs[i].get("title"),
                "company": jobs[i].get("company", {}).get("display_name"),
                "date": jobs[i].get("parsed_date"),
                "similarity": round(float(score), 2)
            })

    return sorted(result, key=lambda x: x["similarity"], reverse=True)

# -------------------- Temporal Analysis --------------------
def temporal_analysis_core(title, description):
    title = clean_job_title(title)
    jobs = fetch_jobs(title, days=7)
    similar = find_similar_jobs(description, jobs)

    from collections import Counter
    counts = Counter([job["date"].strftime("%Y-%m-%d") for job in similar])

    today = datetime.now().date()
    chart = []
    for i in range(7):
        day = today - timedelta(days=i)
        chart.append({
            "date": day.strftime("%Y-%m-%d"),
            "count": counts.get(day.strftime("%Y-%m-%d"), 0)
        })

    return {
        "total_jobs": len(jobs),
        "similar_jobs": similar,
        "chart_data": list(reversed(chart))
    }

# -------------------- DOMAIN VERIFICATION --------------------
FREE_EMAIL_DOMAINS = [
    "gmail.com", "yahoo.com", "outlook.com",
    "hotmail.com", "rediffmail.com"
]

def is_valid_email(email):
    return re.match(r'^[^@]+@[^@]+\.[^@]+$', email)

def has_mx_record(domain):
    try:
        dns.resolver.resolve(domain, 'MX')
        return True
    except:
        return False

def website_exists(domain):
    try:
        r = requests.get(f"https://{domain}", timeout=5)
        return r.status_code < 400
    except:
        return False

def verify_email_domain_online(email):
    if not is_valid_email(email):
        return "Fake", "Invalid email format"

    domain = email.split("@")[-1]

    if domain in FREE_EMAIL_DOMAINS:
        return "Suspicious", "Free email provider used"

    if not has_mx_record(domain):
        return "Fake", "No mail server found"

    if not website_exists(domain):
        return "Suspicious", "Company website not reachable"

    return "Verified", "Official domain verified"

# -------------------- API: Predict --------------------
@app.route("/api/predict", methods=["POST"])
def predict_text():
    data = request.json
    title = data.get("title", "")
    description = data.get("description", "")

    X = preprocess_text(title + " " + description)
    pred = model.predict(X)[0]
    prob = float(model.predict_proba(X).max())

    temporal = temporal_analysis_core(title, description)

    return jsonify({
        "prediction": pred,
        "probability": prob,
        "temporal": temporal
    })

# -------------------- API: Fetch + Predict --------------------
@app.route("/api/fetch-and-predict", methods=["POST"])
def fetch_and_predict_endpoint():
    url = request.json.get("url")
    scraper = LinkedInJobFetcher(headless=True)
    job = scraper.fetch(url)
    scraper.close()

    X = preprocess_text(job["title"] + " " + job["description"])
    pred = model.predict(X)[0]
    prob = float(model.predict_proba(X).max())

    temporal = temporal_analysis_core(job["title"], job["description"])

    return jsonify({
        "title": job["title"],
        "prediction": pred,
        "probability": prob,
        "temporal": temporal
    })

# -------------------- API: Domain Verification --------------------
@app.route("/api/domain-verify", methods=["POST"])
def domain_verify():
    email = request.json.get("email", "")
    status, reason = verify_email_domain_online(email)
    return jsonify({
        "email": email,
        "status": status,
        "reason": reason
    })

# -------------------- API: Metrics --------------------
@app.route("/api/metrics", methods=["GET"])
def get_metrics():
    if os.path.exists(RESULTS_PATH):
        return jsonify(json.load(open(RESULTS_PATH)))
    return jsonify({"error": "Results file not found"}), 404

# -------------------- Run App --------------------
if __name__ == "__main__":
    app.run(debug=True, port=5000)
