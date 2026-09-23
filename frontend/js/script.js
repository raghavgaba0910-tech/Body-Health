document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("predictForm");
  const results = document.getElementById("results");
  const emptyState = document.getElementById("emptyState");
  const submitButton = document.getElementById("submitButton");
  const formError = document.getElementById("formError");
  const copyStatus = document.getElementById("copyStatus");
  let latestResult = null;

  const byId = (id) => document.getElementById(id);
  const safeText = (value, fallback = "—") =>
    value === null || value === undefined || value === "" ? fallback : String(value);

  function setLoading(isLoading) {
    submitButton.disabled = isLoading;
    submitButton.classList.toggle("loading", isLoading);
    submitButton.querySelector(".button-label").textContent =
      isLoading ? "Generating your report…" : "Generate my health report";
  }

  function showError(message) {
    formError.textContent = message;
  }

  function setList(listId, items, type) {
    const list = byId(listId);
    list.replaceChildren();
    if (!Array.isArray(items) || items.length === 0) {
      const li = document.createElement("li");
      li.textContent = "No items were returned for this section.";
      list.appendChild(li);
      return;
    }
    items.forEach((item, index) => {
      const li = document.createElement("li");
      li.style.animationDelay = `${Math.min(index * 55, 330)}ms`;
      // Weekly plans may be strings or objects; render values as text, never HTML.
      if (typeof item === "string" || typeof item === "number") {
        li.textContent = String(item);
      } else if (item && typeof item === "object") {
        li.textContent = [item.day, item.activity, item.description, item.duration]
          .filter(Boolean).join(" · ") || JSON.stringify(item);
      } else {
        li.textContent = String(item);
      }
      list.appendChild(li);
    });
  }

  function animateNumber(element, target, suffix = "", decimals = 0) {
    const numeric = Number(target);
    if (!Number.isFinite(numeric)) {
      element.textContent = safeText(target);
      return;
    }
    const start = performance.now();
    const duration = 850;
    const from = 0;
    function frame(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = `${(from + (numeric - from) * eased).toFixed(decimals)}${suffix}`;
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function bmiCategory(bmi) {
    if (!Number.isFinite(bmi)) return "BMI returned by model";
    if (bmi < 18.5) return "Below reference range";
    if (bmi < 25) return "Within reference range";
    if (bmi < 30) return "Above reference range";
    return "Higher BMI range";
  }

  function updateBmi(bmiValue) {
    const bmi = Number(bmiValue);
    byId("bmiStatus").textContent = bmiCategory(bmi);
    const marker = byId("bmiMarker");
    // Visual position only; BMI classification is a broad adult reference.
    const position = Number.isFinite(bmi) ? Math.max(0, Math.min(100, ((bmi - 12) / 28) * 100)) : 0;
    marker.style.left = `calc(${position}% - 2px)`;
  }

  function updateBodyFat(bodyfat) {
    const numeric = Number(bodyfat);
    animateNumber(byId("bodyfatValue"), numeric, "%", 1);
    const gauge = byId("fatGauge");
    const degrees = Number.isFinite(numeric) ? Math.max(0, Math.min(100, numeric)) * 3.6 : 0;
    gauge.style.setProperty("--gauge", `${degrees}deg`);
    byId("bodyfatStatus").textContent = Number.isFinite(numeric) ? "Prediction received" : "Model estimate";
    byId("bodyfatInsight").textContent = Number.isFinite(numeric)
      ? "Use this estimate as one data point alongside your habits, measurements, and overall wellbeing."
      : "Your model returned a body-fat estimate.";
  }

  function renderResult(result) {
    if (!result || typeof result !== "object") throw new Error("The API returned an unexpected response.");

    latestResult = result;
    results.classList.remove("hidden");
    emptyState.classList.add("hidden");

    updateBodyFat(result.bodyfat);
    animateNumber(byId("bmiValue"), result.bmi, "", 1);
    updateBmi(result.bmi);
    animateNumber(byId("caloriesValue"), result.calories, "", 0);
    animateNumber(byId("proteinValue"), result.protein, "", 0);

    const diet = result.diet || {};
    const exercise = result.exercise || {};
    byId("dietTitle").textContent = safeText(diet.title, "Personalized nutrition plan");
    byId("dietDesc").textContent = safeText(diet.description, "Follow the nutrition guidance returned by your model.");
    byId("dietCalories").textContent = safeText(diet.calories, `${safeText(result.calories)} kcal`);
    byId("dietProtein").textContent = safeText(diet.protein, `${safeText(result.protein)} g`);
    setList("dietTips", diet.tips, "diet");

    byId("exerciseTitle").textContent = safeText(exercise.title, "Personalized movement plan");
    byId("exerciseDesc").textContent = safeText(exercise.description, "Build a consistent, sustainable movement routine.");
    setList("exercisePlan", exercise.weekly_plan, "exercise");

    // Always reveal the nutrition tab after a fresh prediction.
    activateTab("diet");
    results.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function activateTab(name) {
    const isDiet = name === "diet";
    byId("dietTab").classList.toggle("active", isDiet);
    byId("exerciseTab").classList.toggle("active", !isDiet);
    byId("dietTab").setAttribute("aria-selected", String(isDiet));
    byId("exerciseTab").setAttribute("aria-selected", String(!isDiet));
    byId("dietPanel").classList.toggle("hidden", !isDiet);
    byId("exercisePanel").classList.toggle("hidden", isDiet);
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    formError.textContent = "";
    copyStatus.textContent = "";

    const data = {
      age: byId("age").value.trim(),
      weight: byId("weight").value.trim(),
      height: byId("height").value.trim(),
      waist: byId("waist").value.trim()
    };

    const constraints = [
      ["age", 15, 80, "Age must be between 15 and 80 years."],
      ["weight", 20, 350, "Enter a weight between 20 and 350 kg."],
      ["height", 100, 250, "Enter a height between 100 and 250 cm."],
      ["waist", 40, 200, "Enter a waist measurement between 40 and 200 cm."]
    ];
    for (const [key, min, max, message] of constraints) {
      const value = Number(data[key]);
      if (data[key] === "" || !Number.isFinite(value) || value < min || value > max) {
        showError(message);
        byId(key).focus();
        return;
      }
    }

    setLoading(true);
    try {
      // Backend endpoint intentionally preserved from your original project.
      const response = await fetch("https://body-health-api.onrender.com/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        let detail = "";
        try {
          const body = await response.json();
          detail = body.error || body.message || "";
        } catch (_) {}
        throw new Error(detail || `Backend returned status ${response.status}.`);
      }

      const result = await response.json();
      renderResult(result);
    } catch (error) {
      console.error("Prediction request failed:", error);
      showError(
        `Couldn't generate a prediction. ${error.message || "Check your connection."} ` +
        "Make sure Flask is running (python app.py) and open this page through Live Server/localhost."
      );
    } finally {
      setLoading(false);
    }
  });

  byId("dietTab").addEventListener("click", () => activateTab("diet"));
  byId("exerciseTab").addEventListener("click", () => activateTab("exercise"));

  byId("resetButton").addEventListener("click", () => {
    form.reset();
    latestResult = null;
    results.classList.add("hidden");
    emptyState.classList.remove("hidden");
    formError.textContent = "";
    copyStatus.textContent = "";
    byId("age").focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  byId("copyReport").addEventListener("click", async () => {
    if (!latestResult) return;
    const r = latestResult;
    const lines = [
      "BODYFAT / INSIGHT — PERSONAL REPORT",
      `Predicted body fat: ${safeText(r.bodyfat)}%`,
      `BMI: ${safeText(r.bmi)}`,
      `Daily calories: ${safeText(r.calories)} kcal`,
      `Daily protein: ${safeText(r.protein)} g`,
      "",
      `Nutrition: ${safeText(r.diet?.title, "Plan")}`,
      safeText(r.diet?.description, ""),
      ...(Array.isArray(r.diet?.tips) ? r.diet.tips.map(t => `• ${typeof t === "string" ? t : JSON.stringify(t)}`) : []),
      "",
      `Movement: ${safeText(r.exercise?.title, "Plan")}`,
      safeText(r.exercise?.description, ""),
      ...(Array.isArray(r.exercise?.weekly_plan) ? r.exercise.weekly_plan.map(d => `• ${typeof d === "string" ? d : JSON.stringify(d)}`) : []),
      "",
      "General wellness information only; not a medical diagnosis."
    ];
    const text = lines.join("\n");
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const helper = document.createElement("textarea");
        helper.value = text;
        helper.style.position = "fixed";
        helper.style.opacity = "0";
        document.body.appendChild(helper);
        helper.select();
        const copied = document.execCommand("copy");
        helper.remove();
        if (!copied) throw new Error("Clipboard unavailable");
      }
      copyStatus.textContent = "Report copied!";
    } catch (error) {
      copyStatus.textContent = "Copy unavailable in this browser.";
    }
  });
});
