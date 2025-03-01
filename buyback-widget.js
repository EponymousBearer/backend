(function () {
  class Buyback {
    constructor({ apiUrl }) {
      this.apiUrl = apiUrl;
      this.loadWidget();
    }

    async loadWidget() {
      const container = document.querySelector(".buyback-widget");
      if (!container) {
        console.error("Buyback widget container not found.");
        return;
      }

      container.innerHTML = `
          <div id="buyback-container" style="border:1px solid #ddd; padding:10px; width:300px;">
            <h2>Trade-in Your Device</h2>
            <select id="buyback-category"></select>
            <select id="buyback-model" disabled></select>
            <select id="buyback-condition" disabled></select>
            <div id="buyback-price"></div>
          </div>
        `;

      await this.loadCategories();
    }

    async loadCategories() {
      const categorySelect = document.getElementById("buyback-category");
      try {
        const response = await fetch(`${this.apiUrl}/api/categories`);
        const categories = await response.json();

        categorySelect.innerHTML =
          `<option>Select Brand</option>` +
          categories.map((c) => `<option>${c}</option>`).join("");
        categorySelect.addEventListener("change", () =>
          this.loadModels(categorySelect.value)
        );
      } catch (error) {
        console.error("Error loading categories:", error);
      }
    }

    async loadModels(category) {
      const modelSelect = document.getElementById("buyback-model");
      modelSelect.disabled = false;

      try {
        const response = await fetch(`${this.apiUrl}/api/models/${category}`);
        const models = await response.json();

        modelSelect.innerHTML =
          `<option>Select Model</option>` +
          models.map((m) => `<option>${m}</option>`).join("");
        modelSelect.addEventListener("change", () =>
          this.loadConditions(modelSelect.value)
        );
      } catch (error) {
        console.error("Error loading models:", error);
      }
    }

    async loadConditions(model) {
      const conditionSelect = document.getElementById("buyback-condition");
      conditionSelect.disabled = false;

      try {
        const response = await fetch(`${this.apiUrl}/api/conditions`);
        const conditions = await response.json();

        conditionSelect.innerHTML =
          `<option>Select Condition</option>` +
          conditions.map((c) => `<option>${c}</option>`).join("");
        conditionSelect.addEventListener("change", () =>
          this.loadPrice(model, conditionSelect.value)
        );
      } catch (error) {
        console.error("Error loading conditions:", error);
      }
    }

    async loadPrice(model, condition) {
      const priceDiv = document.getElementById("buyback-price");

      try {
        const response = await fetch(
          `${this.apiUrl}/api/price/${model}/${condition}`
        );
        const data = await response.json();

        priceDiv.innerHTML = `Trade-in Value: <b>$${data.price}</b>`;
      } catch (error) {
        console.error("Error loading price:", error);
      }
    }
  }

  // ✅ Attach Buyback class to the global window object
  if (typeof window !== "undefined") {
    window.Buyback = Buyback;
  }

  console.log("Buyback Widget Loaded:", window.Buyback); // Debugging
})();
