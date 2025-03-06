// (function () {
//   class Buyback {
//     constructor({ apiUrl, apiKey }) {
//       this.apiUrl = apiUrl;
//       this.apiKey = apiKey;
//       this.loadWidget();
//     }

//     async loadWidget() {
//       const container = document.querySelector(".buyback-widget");
//       if (!container) {
//         console.error("Buyback widget container not found.");
//         return;
//       }

//       container.innerHTML = `
//         <div id="buyback-container" style="border:1px solid #ddd; padding:10px; width:300px;">
//           <h2>Trade-in Your Device</h2>
//           <select id="buyback-category"></select>
//           <select id="buyback-model" disabled></select>
//           <select id="buyback-condition" disabled></select>
//           <div id="buyback-price"></div>
//         </div>
//       `;

//       await this.loadCategories();
//     }

//     async fetchData(endpoint) {
//       try {
//         const response = await fetch(`${this.apiUrl}${endpoint}`, {
//           mode: "cors",
//           headers: { Authorization: `Bearer ${this.apiKey}` },
//         });
//         if (!response.ok)
//           throw new Error(`HTTP error! Status: ${response.status}`);
//         return await response.json();
//       } catch (error) {
//         console.error(`Error fetching ${endpoint}:`, error);
//         return null;
//       }
//     }

//     async loadCategories() {
//       const categorySelect = document.getElementById("buyback-category");
//       const data = await this.fetchData(`/api/categories`);
//       if (!data || !data.categories) return;

//       categorySelect.innerHTML =
//         `<option value="">Select Brand</option>` +
//         data.categories
//           .map((c) => `<option value="${c}">${c}</option>`)
//           .join("");
//       categorySelect.addEventListener("change", () =>
//         this.loadModels(categorySelect.value)
//       );
//     }

//     async loadModels(category) {
//       const modelSelect = document.getElementById("buyback-model");
//       modelSelect.disabled = true;
//       modelSelect.innerHTML = `<option>Loading...</option>`;

//       const data = await this.fetchData(`/api/models/${category}`);
//       if (!data || !data.models) return;

//       modelSelect.innerHTML =
//         `<option value="">Select Model</option>` +
//         data.models.map((m) => `<option value="${m}">${m}</option>`).join("");
//       modelSelect.disabled = false;
//       modelSelect.addEventListener("change", () =>
//         this.loadConditions(modelSelect.value)
//       );
//     }

//     async loadConditions(model) {
//       const conditionSelect = document.getElementById("buyback-condition");
//       conditionSelect.disabled = true;
//       conditionSelect.innerHTML = `<option>Loading...</option>`;

//       const data = await this.fetchData("/api/conditions");
//       if (!data || !data.conditions) return;

//       conditionSelect.innerHTML =
//         `<option value="">Select Condition</option>` +
//         data.conditions
//           .map((c) => `<option value="${c}">${c}</option>`)
//           .join("");
//       conditionSelect.disabled = false;
//       conditionSelect.addEventListener("change", () =>
//         this.loadPrice(model, conditionSelect.value)
//       );
//     }

//     async loadPrice(model, condition) {
//       const priceDiv = document.getElementById("buyback-price");
//       priceDiv.innerHTML = "Calculating price...";

//       const data = await this.fetchData(`/api/price/${model}/${condition}`);
//       if (!data || data.price === undefined) {
//         priceDiv.innerHTML = "Error fetching price.";
//         return;
//       }

//       priceDiv.innerHTML = `Trade-in Value: <b>$${data.price}</b>`;
//     }
//   }

//   window.Buyback = Buyback;
// })();

(function () {
  class Buyback {
    constructor({ apiUrl, apiKey }) {
      this.apiUrl = apiUrl;
      this.apiKey = apiKey;
      this.selectedItems = [];
      this.currentStep = 1;
      this.loadWidget();
    }

    async loadWidget() {
      const container = document.querySelector(".buyback-widget");
      if (!container) {
        console.error("Buyback widget container not found.");
        return;
      }

      container.innerHTML = `
        <div id="buyback-container" style="max-width: 500px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
          <div id="progress-bar" style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <div class="step active">1</div>
            <div class="step">2</div>
            <div class="step">3</div>
            <div class="step">4</div>
          </div>
          <div id="buyback-content"></div>
        </div>
      `;

      this.updateStep(1);
    }

    updateStep(step) {
      this.currentStep = step;
      document.querySelectorAll(".step").forEach((el, index) => {
        el.classList.toggle("active", index + 1 === step);
      });

      const content = document.getElementById("buyback-content");
      if (step === 1) {
        content.innerHTML = `
          <h2>Select Category</h2>
          <div id="category-list"></div>
        `;
        this.loadCategories();
      } else if (step === 2) {
        content.innerHTML = `
          <h2>Select Model</h2>
          <div id="model-list"></div>
          <button onclick="buyback.updateStep(1)">Back</button>
        `;
      } else if (step === 3) {
        content.innerHTML = `
          <h2>Answer Questions</h2>
          <div id="questions-list"></div>
          <button onclick="buyback.updateStep(2)">Back</button>
        `;
      } else if (step === 4) {
        content.innerHTML = `
          <h2>Review & Checkout</h2>
          <div id="review-list"></div>
          <button onclick="buyback.updateStep(3)">Back</button>
        `;
      }
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
      const data = await this.fetchData(`/api/categories`);
      if (!data || !data.categories) return;

      const categoryList = document.getElementById("category-list");
      categoryList.innerHTML = data.categories
        .map(
          (c) =>
            `<div class="category-item" onclick="buyback.selectCategory('${c}')">${c}</div>`
        )
        .join("");
    }

    async selectCategory(category) {
      this.selectedCategory = category;
      this.updateStep(2);
      this.loadModels(category);
    }

    async loadModels(category) {
      const data = await this.fetchData(`/api/models/${category}`);
      if (!data || !data.models) return;

      const modelList = document.getElementById("model-list");
      modelList.innerHTML = data.models
        .map(
          (m) =>
            `<div class="model-item" onclick="buyback.selectModel('${m}')">${m}</div>`
        )
        .join("");
    }

    async selectModel(model) {
      this.selectedModel = model;
      this.updateStep(3);
      this.loadQuestions();
    }

    async loadQuestions() {
      const data = await this.fetchData("/api/conditions");
      if (!data || !data.conditions) return;

      const questionsList = document.getElementById("questions-list");
      questionsList.innerHTML = data.conditions
        .map(
          (c) =>
            `<div class="question-item" onclick="buyback.selectCondition('${c}')">${c}</div>`
        )
        .join("");
    }

    async selectCondition(condition) {
      this.selectedCondition = condition;
      const priceData = await this.fetchData(
        `/api/price/${this.selectedModel}/${condition}`
      );
      const price = priceData ? `$${priceData.price}` : "Error fetching price";

      this.selectedItems.push({
        category: this.selectedCategory,
        model: this.selectedModel,
        condition: this.selectedCondition,
        price,
      });

      this.updateStep(4);
      this.loadReview();
    }

    loadReview() {
      const reviewList = document.getElementById("review-list");
      reviewList.innerHTML = this.selectedItems
        .map(
          (item, index) =>
            `<div>
              <b>${item.model} (${item.condition})</b> - ${item.price}
              <button onclick="buyback.removeItem(${index})">Remove</button>
            </div>`
        )
        .join("");

      reviewList.innerHTML += `
        <button onclick="buyback.updateStep(1)">Add More</button>
        <button onclick="buyback.proceedToCheckout()">Checkout</button>
      `;
    }

    removeItem(index) {
      this.selectedItems.splice(index, 1);
      this.loadReview();
    }

    proceedToCheckout() {
      alert("Proceeding to checkout...");
      // Redirect to checkout API or page
    }
  }

  // window.Buyback = Buyback;
  window.buyback = new Buyback({
    apiUrl: "https://backend-vert-pi-68.vercel.app",
    apiKey: "mySecretKey123",
  });
})();
