(function () {
  class Buyback {
    constructor({ apiUrl, apiKey }) {
      this.apiUrl = apiUrl;
      this.apiKey = apiKey;
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

    async fetchData(endpoint) {
      try {
        const response = await fetch(`${this.apiUrl}${endpoint}`, {
          mode: "cors",
          headers: { Authorization: `Bearer ${this.apiKey}` },
        });
        if (!response.ok)
          throw new Error(`HTTP error! Status: ${response.status}`);
        return await response.json();
      } catch (error) {
        console.error(`Error fetching ${endpoint}:`, error);
        return null;
      }
    }

    async loadCategories() {
      const categorySelect = document.getElementById("buyback-category");
      const data = await this.fetchData(`/api/categories`);
      if (!data || !data.categories) return;

      categorySelect.innerHTML =
        `<option value="">Select Brand</option>` +
        data.categories
          .map((c) => `<option value="${c}">${c}</option>`)
          .join("");
      categorySelect.addEventListener("change", () =>
        this.loadModels(categorySelect.value)
      );
    }

    async loadModels(category) {
      const modelSelect = document.getElementById("buyback-model");
      modelSelect.disabled = true;
      modelSelect.innerHTML = `<option>Loading...</option>`;

      const data = await this.fetchData(`/api/models/${category}`);
      if (!data || !data.models) return;

      modelSelect.innerHTML =
        `<option value="">Select Model</option>` +
        data.models.map((m) => `<option value="${m}">${m}</option>`).join("");
      modelSelect.disabled = false;
      modelSelect.addEventListener("change", () =>
        this.loadConditions(modelSelect.value)
      );
    }

    async loadConditions(model) {
      const conditionSelect = document.getElementById("buyback-condition");
      conditionSelect.disabled = true;
      conditionSelect.innerHTML = `<option>Loading...</option>`;

      const data = await this.fetchData("/api/conditions");
      if (!data || !data.conditions) return;

      conditionSelect.innerHTML =
        `<option value="">Select Condition</option>` +
        data.conditions
          .map((c) => `<option value="${c}">${c}</option>`)
          .join("");
      conditionSelect.disabled = false;
      conditionSelect.addEventListener("change", () =>
        this.loadPrice(model, conditionSelect.value)
      );
    }

    async loadPrice(model, condition) {
      const priceDiv = document.getElementById("buyback-price");
      priceDiv.innerHTML = "Calculating price...";

      const data = await this.fetchData(`/api/price/${model}/${condition}`);
      if (!data || data.price === undefined) {
        priceDiv.innerHTML = "Error fetching price.";
        return;
      }

      priceDiv.innerHTML = `Trade-in Value: <b>$${data.price}</b>`;
    }
  }

  window.Buyback = Buyback;
})();
