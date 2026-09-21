# BodyFat Health Recommender

A complete full-stack health recommendation system that predicts **Body Fat Percentage**, **BMI**, **Daily Calorie Need**, and **Protein Requirement** using Linear Regression models, and provides personalized **Diet** and **Exercise** plans.

---

## Features

- Predict Body Fat % using Linear Regression
- Calculate BMI automatically
- Estimate Daily Calorie & Protein requirements
- Personalized Diet Plan (Fat Loss / Muscle Gain / Maintenance)
- Personalized Weekly Exercise Plan
- Clean and modern responsive UI
- Flask REST API backend
- Ready for deployment on Render

---

## Tech Stack

**Machine Learning**
- Python
- Scikit-learn (Linear Regression)
- Joblib

**Backend**
- Flask
- Flask-CORS
- Gunicorn (for production)

**Frontend**
- HTML5
- Tailwind CSS
- Vanilla JavaScript

**Dataset**
- Body Fat Prediction Dataset (Kaggle)

---

## Project Structure

```text
bodyfat-health-recommender/
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── bodyfat_model.pkl
│   ├── calorie_model.pkl
│   └── protein_model.pkl
├── frontend/
│   ├── index.html
│   ├── style.css
│   └── script.js
├── notebooks/
│   └── 01_train_models.ipynb
├── data/
│   └── raw/
│       └── bodyfat.csv
├── .gitignore
└── README.md
```

---

## How to Run Locally

### 1. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server
python app.py
```

Backend will run at: [http://127.0.0.1:5000](http://127.0.0.1:5000)

### 2. Frontend Setup

**Option A (Recommended):**  
Use **Live Server** extension in VS Code → Right click on `index.html` → Open with Live Server

**Option B:**
```bash
cd frontend
python -m http.server 5500
```
Then open: [http://localhost:5500](http://localhost:5500)

---

## Models Used

| Model              | Algorithm           | Target                     |
|--------------------|---------------------|----------------------------|
| Body Fat Model     | Linear Regression   | Body Fat Percentage        |
| Calorie Model      | Linear Regression   | Daily Calorie Need (kcal)  |
| Protein Model      | Linear Regression   | Daily Protein Need (grams) |

---

## API Endpoint

**POST** `/predict`

**Request Body:**
```json
{
  "age": 28,
  "weight": 75,
  "height": 175,
  "waist": 85
}
```

**Sample Response:**
```json
{
  "bodyfat": 18.45,
  "bmi": 24.49,
  "calories": 2450,
  "protein": 140.5,
  "diet": {
    "title": "Maintenance Diet",
    "description": "Balanced diet to maintain current physique.",
    "calories": "2350 - 2550 kcal",
    "protein": "140 g",
    "tips": ["..."]
  },
  "exercise": {
    "title": "Balanced Fitness",
    "description": "Mix of strength and cardio for overall health.",
    "weekly_plan": ["Day 1: Full Body Strength", "..."]
  }
}
```

---

## Deploying to Render

1. Push your complete code to GitHub (including the three `.pkl` model files).
2. Go to [https://render.com](https://render.com) and create an account.
3. Click **New +** → **Web Service**.
4. Connect your GitHub repository.
5. Configure the service:

| Setting          | Value                              |
|------------------|------------------------------------|
| Name             | bodyfat-health-api (or any name)   |
| Root Directory   | `backend`                          |
| Environment      | Python 3                           |
| Build Command    | `pip install -r requirements.txt`  |
| Start Command    | `gunicorn app:app`                 |
| Instance Type    | Free                               |

6. Click **Create Web Service**.

After deployment, you will get a live URL like:  
`https://bodyfat-health-api.onrender.com`

Then update the frontend `script.js` fetch URL to your new Render URL.

---

## Important Notes

- Make sure the three model files (`bodyfat_model.pkl`, `calorie_model.pkl`, `protein_model.pkl`) are present inside the `backend` folder before deploying.
- Free tier on Render sleeps after inactivity. First request after sleep may take 30–50 seconds.
- For production, consider adding environment variables and better error handling.

---

## Future Improvements

- Add Gender as input feature
- Support both Metric and Imperial units
- User authentication and prediction history
- Better recommendation engine
- Deploy frontend on Vercel / Netlify
- Add input validation and better error messages

---

## Author

Built as a practical project to learn Linear Regression + Full Stack integration (Flask + Frontend).
```
