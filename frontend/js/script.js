document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("predictForm");
    const resultsDiv = document.getElementById("results");

    if (!form) {
        console.error("Form not found!");
        return;
    }

    form.addEventListener("submit", async function (e) {
        e.preventDefault();          // ← This stops the page from refreshing
        e.stopPropagation();

        console.log("Form submitted..."); // for testing

        const data = {
            age: document.getElementById("age").value,
            weight: document.getElementById("weight").value,
            height: document.getElementById("height").value,
            waist: document.getElementById("waist").value
        };

        // Simple validation
        if (!data.age || !data.weight || !data.height || !data.waist) {
            alert("Please fill all fields");
            return;
        }

        try {
            const response = await fetch("http://127.0.0.1:5000/predict", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error("Backend error: " + response.status);
            }

            const result = await response.json();
            console.log("Result received:", result);

            // Show results section
            resultsDiv.classList.remove("hidden");

            // Fill metrics
            document.getElementById("bodyfatValue").textContent = result.bodyfat + "%";
            document.getElementById("bmiValue").textContent = result.bmi;
            document.getElementById("caloriesValue").textContent = result.calories + " kcal";
            document.getElementById("proteinValue").textContent = result.protein + " g";

            // Diet
            document.getElementById("dietTitle").textContent = result.diet.title;
            document.getElementById("dietDesc").textContent = result.diet.description;
            document.getElementById("dietCalories").textContent = result.diet.calories;
            document.getElementById("dietProtein").textContent = result.diet.protein;

            const tipsList = document.getElementById("dietTips");
            tipsList.innerHTML = "";
            result.diet.tips.forEach(tip => {
                const li = document.createElement("li");
                li.textContent = tip;
                tipsList.appendChild(li);
            });

            // Exercise
            document.getElementById("exerciseTitle").textContent = result.exercise.title;
            document.getElementById("exerciseDesc").textContent = result.exercise.description;

            const planList = document.getElementById("exercisePlan");
            planList.innerHTML = "";
            result.exercise.weekly_plan.forEach(day => {
                const li = document.createElement("li");
                li.innerHTML = `<span class="text-indigo-600">•</span> ${day}`;
                planList.appendChild(li);
            });

            // Scroll to results
            resultsDiv.scrollIntoView({ behavior: "smooth" });

        } catch (error) {
            console.error("Error:", error);
            alert("Error connecting to backend.\n\nMake sure:\n1. Flask is running (python app.py)\n2. You opened the page using Live Server or localhost");
        }
    });
});