(function () {
  class Buyback {
    constructor({ apiUrl, apiKey }) {
      this.apiUrl = apiUrl;
      this.apiKey = apiKey;
      this.loadWidget();
    }

    addStyles() {
      const style = document.createElement("style");
      style.innerHTML = `
        .buyback-widget {
          max-width: 400px;
          margin: auto;
          font-family: Arial, sans-serif;
        }
    
        #buyback-container {
          border: 1px solid #ddd;
          padding: 15px;
          border-radius: 10px;
          box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
        }
    
        h2 {
          text-align: center;
          color: #333;
        }
    
        select {
          width: 100%;
          padding: 10px;
          margin: 8px 0;
          border: 1px solid #ccc;
          border-radius: 5px;
          background-color: #f9f9f9;
          font-size: 16px;
          cursor: pointer;
        }
    
        .question-block {
          padding: 10px;
          border-bottom: 1px solid #ddd;
        }
    
        .question-block h3 {
          margin-bottom: 8px;
        }
    
        label {
          display: flex;
          align-items: center;
          padding: 5px;
          cursor: pointer;
        }
    
        input[type="radio"] {
          margin-right: 10px;
        }
    
        input[type="radio"]:checked + span {
          font-weight: bold;
          color: #007bff;
        }
    
        #buyback-checkOut {
          text-align: center;
          margin-top: 15px;
          padding: 10px;
          font-size: 18px;
          background: #f1f1f1;
          border-radius: 5px;
          font-weight: bold;
        }
      `;
      document.head.appendChild(style);
    }

    async loadWidget() {
      this.addStyles(); // Injects CSS dynamically
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
          <select id="buyback-product" disabled></select>
          <div id="buyback-displayOptions"></div>
          <div id="buyback-price"></div>
          <div id="buyback-checkOut"></div>
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
      const data = await this.fetchData(`/api/allcategories`);
      // console.log(data.map((c) => c.name));
      if (!data) return;

      categorySelect.innerHTML =
        `<option value="">Select Category</option>` +
        data
          .map((c) => `<option value="${c.name}">${c.name}</option>`)
          .join("");
      categorySelect.addEventListener("change", () =>
        this.loadModels(categorySelect.value.toLowerCase())
      );
    }

    async loadModels(category) {
      const modelSelect = document.getElementById("buyback-model");
      modelSelect.disabled = true;
      modelSelect.innerHTML = `<option>Loading...</option>`;

      const data = await this.fetchData(`/api/brands/${category}`);
      // console.log("data", data);
      if (!data) return;

      modelSelect.innerHTML =
        `<option value="">Select Brand</option>` +
        data
          .map((m) => `<option value="${m.name}">${m.name}</option>`)
          .join("");
      modelSelect.disabled = false;
      modelSelect.addEventListener("change", () =>
        this.loadProduct(modelSelect.value.toLowerCase(), category)
      );
    }

    async loadProduct(model, category) {
      const productSelect = document.getElementById("buyback-product");
      productSelect.disabled = true;
      productSelect.innerHTML = `<option>Loading...</option>`;
      // console.log("category", category, "model", model);
      const data = await this.fetchData(`/api/catalog/${category}/${model}`);
      // console.log("product data", data);
      if (!data) return;

      productSelect.innerHTML =
        `<option value="">Select Product</option>` +
        data
          .map((c) => `<option value="${c.slug}">${c.name}</option>`)
          .join("");
      productSelect.disabled = false;
      productSelect.addEventListener("change", (event) => {
        const selectedProductSlug = event.target.value;
        const selectedProduct = data.find(
          (p) => p.slug === selectedProductSlug
        );

        if (selectedProduct) {
          this.displayOptions(selectedProduct);
        }
      });
    }

    async displayOptions(data) {
      const displayOptions = document.getElementById("buyback-displayOptions");
      if (!displayOptions) {
        console.error("Element #buyback-displayOptions not found!");
        return;
      }

      const productSlug = data.slug;
      console.log("productSlug", productSlug);

      // loading product conditions
      const conditions = await this.fetchData(`/api/conditions/${productSlug}`);
      if (!conditions) return;

      console.log("conditions", conditions.conditions);

      // displayOptions.innerHTML = `<option>Loading...</option>`;
      let selectedOptions = {}; // Object to store selected answers
      displayOptions.innerHTML = `
      ${data.options
        .map(
          (option) => `
            <div class="question-block">
                <h3>${option.question}</h3>
                <form>
                    ${option.answers
                      .map(
                        (answer) => `
                        <label>
                            <input type="radio" name="${option.category}" value="${answer}">
                            ${answer}
                        </label><br>
                    `
                      )
                      .join("")}
                </form>
            </div>
          `
        )
        .join("")}
    
        ${conditions.conditions
          .map(
            (option) => ` 
              <div class="question-block">
                  <br/>
                  <form>    
                      <label>
                        <input type="radio" name="condition" value="${
                          option.name
                        }">
                          ${option.name}
                      </label>
                      <p>${option.guideline}</p>
                      <p>${option.terms.join(", ")}</p>
                  </form>
                  <br/>
              </div>
            `
          )
          .join("")}
        `;

      // Add event listeners for all radio buttons
      // displayOptions
      //   .querySelectorAll("input[type='radio']")
      //   .forEach((input) => {
      //     input.addEventListener("change", (event) => {
      //       const { name, value } = event.target;
      //       selectedOptions[name] = value; // Store selection

      //       // Log the selected options for debugging
      //       console.log("Selected Options:", selectedOptions);
      //     });
      //   });

      // **Event Listener for All Options**
      const checkOutSelect = document.getElementById("buyback-checkOut");
      // **Event Listener for All Options**
      displayOptions
        .querySelectorAll("input[type='radio']")
        .forEach((input) => {
          input.addEventListener("change", async (event) => {
            const { name, value } = event.target;

            // If it's a condition, uncheck others first
            if (name === "condition") {
              displayOptions
                .querySelectorAll(`input[name="condition"]`)
                .forEach((radio) => {
                  radio.checked = false;
                });
              event.target.checked = true;
            }

            selectedOptions[name] = value;

            console.log("Selected Options:", selectedOptions);

            // **Trigger price update whenever an option is changed**
            checkOutSelect.innerHTML = `<p>Updating Price...</p>`;
            await this.checkOut(selectedOptions, data);
          });
        });

      // Initial price calculation
      await this.checkOut(selectedOptions, data);
    }

    async checkOut(selectedOptions, data) {
      const checkOutSelect = document.getElementById("buyback-checkOut");
      checkOutSelect.innerHTML = `<p>Processing...</p>`;

      console.log("Selected Options:", selectedOptions);

      const selectedCondition = selectedOptions["condition"];
      if (!selectedCondition) {
        checkOutSelect.innerHTML = `<p>Please select a condition.</p>`;
        return;
      }
      console.log("Base Price from Product:", data);
      let finalPrice = data.basePrice;

      const priceModifiersData = await this.fetchData(
        `/api/priceModifiers/${data.slug}`
      );

      console.log("Price Modifiers Data:", priceModifiersData);
      if (priceModifiersData && priceModifiersData.priceModifiers) {
        const priceModifiers = priceModifiersData.priceModifiers;
        // console.log("priceModifiers", priceModifiers);

        // 🔹 **Map selectedOptions keys to category names**
        const formattedSelections = { Condition: selectedCondition.trim() };

        for (const [category, value] of Object.entries(selectedOptions)) {
          if (category !== "condition") {
            formattedSelections[category.trim()] = value.trim();
          }
        }
        console.log("Formatted Selections:", formattedSelections);

        // 🔹 **Apply price modifications**
        priceModifiers.forEach(({ category, condition, modifier }) => {
          if (
            formattedSelections.hasOwnProperty(category.trim()) &&
            formattedSelections[category.trim()] === condition.trim()
          ) {
            console.log(
              `Applying Modifier: ${modifier} for ${category} -> ${condition}`
            );
            finalPrice += modifier;
          }
        });
      }

      checkOutSelect.innerHTML = `<h3>Final Trade-in Value: <b>$${finalPrice}</b></h3>`;
    }
  }

  window.Buyback = Buyback;
})();
