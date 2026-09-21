from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np

app = Flask(__name__)
CORS(app)  # Allows frontend to call the API

# Load the three trained models
bodyfat_model = joblib.load("bodyfat_model.pkl")
calorie_model = joblib.load("calorie_model.pkl")
protein_model = joblib.load("protein_model.pkl")

def get_recommendations(bodyfat, bmi, calories, protein, age):
    # --------- Diet Recommendation ---------
    if bodyfat >= 25 or bmi >= 25:
        diet = {
            "title": "Fat Loss Diet",
            "description": "Calorie deficit with high protein to preserve muscle.",
            "calories": f"{int(calories - 400)} - {int(calories - 300)} kcal",
            "protein": f"{int(protein)} - {int(protein + 20)} g",
            "tips": [
                "Focus on lean proteins (chicken, fish, eggs, paneer)",
                "High volume vegetables",
                "Reduce sugar and fried food",
                "Drink 3-4 litres water daily"
            ]
        }
    elif bodyfat <= 15 and bmi < 22:
        diet = {
            "title": "Muscle Gain Diet",
            "description": "Calorie surplus with high protein for muscle building.",
            "calories": f"{int(calories + 250)} - {int(calories + 400)} kcal",
            "protein": f"{int(protein + 20)} - {int(protein + 40)} g",
            "tips": [
                "Eat every 3-4 hours",
                "Include complex carbs (rice, oats, sweet potato)",
                "Add healthy fats (nuts, peanut butter, olive oil)",
                "Prioritize protein in every meal"
            ]
        }
    else:
        diet = {
            "title": "Maintenance Diet",
            "description": "Balanced diet to maintain current physique.",
            "calories": f"{int(calories - 100)} - {int(calories + 100)} kcal",
            "protein": f"{int(protein)} g",
            "tips": [
                "Balanced plate: Protein + Carbs + Vegetables",
                "Include fruits and healthy fats",
                "Stay consistent with meal timing"
            ]
        }

    # --------- Exercise Recommendation ---------
    if bodyfat >= 25:
        exercise = {
            "title": "Fat Loss Focus",
            "description": "Combination of strength training + cardio.",
            "weekly_plan": [
                "Day 1: Full Body Strength",
                "Day 2: HIIT Cardio (20-25 min)",
                "Day 3: Upper Body",
                "Day 4: Active Recovery / Walk",
                "Day 5: Lower Body + Core",
                "Day 6: LISS Cardio (30-40 min walk/cycle)",
                "Day 7: Rest"
            ]
        }
    elif bodyfat <= 15:
        exercise = {
            "title": "Muscle Building Focus",
            "description": "Progressive strength training with controlled cardio.",
            "weekly_plan": [
                "Day 1: Push (Chest, Shoulders, Triceps)",
                "Day 2: Pull (Back, Biceps)",
                "Day 3: Legs",
                "Day 4: Rest or Light Walk",
                "Day 5: Upper Body",
                "Day 6: Legs + Core",
                "Day 7: Rest"
            ]
        }
    else:
        exercise = {
            "title": "Balanced Fitness",
            "description": "Mix of strength and cardio for overall health.",
            "weekly_plan": [
                "Day 1: Full Body Strength",
                "Day 2: Cardio + Core",
                "Day 3: Upper Body",
                "Day 4: Rest",
                "Day 5: Lower Body",
                "Day 6: Light Cardio or Sports",
                "Day 7: Rest"
            ]
        }

    return diet, exercise

@app.route("/predict", methods=["POST"])
def predict():
    data = request.json

    age = float(data["age"])
    weight_kg = float(data["weight"])
    height_cm = float(data["height"])
    abdomen = float(data["waist"])

    input_data = np.array([[age, weight_kg, height_cm, abdomen]])

    # Predictions
    bodyfat = float(bodyfat_model.predict(input_data)[0])
    calories = float(calorie_model.predict(input_data)[0])
    protein = float(protein_model.predict(input_data)[0])
    bmi = weight_kg / ((height_cm / 100) ** 2)

    # Get recommendations
    diet, exercise = get_recommendations(bodyfat, bmi, calories, protein, age)

    return jsonify({
        "bodyfat": round(bodyfat, 2),
        "bmi": round(bmi, 2),
        "calories": round(calories),
        "protein": round(protein, 1),
        "diet": diet,
        "exercise": exercise
    })

if __name__ == "__main__":
    app.run(debug=True, port=5000)