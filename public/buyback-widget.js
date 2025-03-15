(function () {
  class Buyback {
    constructor({ apiUrl, apiKey }) {
      this.apiUrl = apiUrl;
      this.apiKey = apiKey;
      this.selectedOptions = {};
      this.loadWidget();
    }

    addStyles() {
      const style = document.createElement("style");
      style.innerHTML = `
        .buyback-widget {
          max-width: 500px;
          margin: auto;
          font-family: Arial, sans-serif;
        }
    
        #buyback-container {
          border: 1px solid #ddd;
          padding: 15px;
          border-radius: 10px;
          box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1);
          text-align: center;
        }

        .categories-grid, .brands-grid, .products-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-top: 15px;
        }

        .category-card, .brand-card, .product-card {
          display: flex;
          align-items: center;
          gap: 10px;
          border: 1px solid #ddd;
          padding: 10px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          background: #fff;
        }

        .category-card:hover, .brand-card:hover, .product-card:hover {
          background: #f5f5f5;
          box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
        }

        .category-card img, .brand-card img, .product-card img {
          width: 40px;
          height: 40px;
          object-fit: contain;
        }

        #back-button, #checkout-button {
          display: block;
          margin-top: 10px;
          padding: 8px 12px;
          background: #007bff;
          color: white;
          border: none;
          border-radius: 5px;
          cursor: pointer;
        }

        #back-button:hover, #checkout-button:hover {
          background: #0056b3;
        }


        
        .question-block {
          border: 1px solid #ddd;
          padding: 10px;
          border-radius: 8px;
          text-align: left;
          margin: 10px 0;
        }

        .checkout-summary {
          text-align: left;
          background: #f9f9f9;
          padding: 15px;
          border-radius: 8px;
          margin-top: 15px;
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

      // container.innerHTML = `
      //   <div id="buyback-container" style="border:1px solid #ddd; padding:10px; width:300px;">
      //     <h2>Trade-in Your Device</h2>
      //     <select id="buyback-category"></select>
      //     <select id="buyback-model" disabled></select>
      //     <select id="buyback-product" disabled></select>
      //     <div id="buyback-displayOptions"></div>
      //     <div id="buyback-price"></div>
      //     <div id="buyback-checkOut"></div>
      //   </div>
      // `;

      container.innerHTML = `
      <div id="buyback-container">
        <h2>Select Your Device</h2>
        <div id="buyback-content"></div>
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
      const content = document.getElementById("buyback-content");

      const data = await this.fetchData(`/api/allcategories`);
      if (!data) return;

      content.innerHTML = `
        <div class="categories-grid">
          ${data
            .map(
              (c) => `
                <div class="category-card" data-category="${c.name}">
                  <img src="${c.image_url || "default.png"}" alt="${c.name}">
                  <span>${c.name}</span>
                </div>
              `
            )
            .join("")}
        </div>
      `;

      document.querySelectorAll(".category-card").forEach((card) =>
        card.addEventListener("click", (event) => {
          const category = event.currentTarget.getAttribute("data-category");
          this.selectedOptions.category = category;
          this.loadBrands(category);
        })
      );
    }

    async loadBrands(category) {
      const content = document.getElementById("buyback-content");
      const data = await this.fetchData(
        `/api/brands/${category.toLowerCase()}`
      );
      if (!data) return;

      content.innerHTML = `
        <button id="back-button">Back</button>
        <h3>Select a Brand</h3>
        <div class="brands-grid">
          ${data
            .map(
              (b) => `
                <div class="brand-card" data-brand="${b.name}">
                  <img src="${b.image_url || "default.png"}" alt="${b.name}">
                  <span>${b.name}</span>
                </div>
              `
            )
            .join("")}
        </div>
      `;

      document
        .getElementById("back-button")
        .addEventListener("click", () => this.loadCategories());

      document.querySelectorAll(".brand-card").forEach((card) =>
        card.addEventListener("click", (event) => {
          const brand = event.currentTarget.getAttribute("data-brand");
          this.selectedOptions.brand = brand;
          this.loadProducts(category, brand);
        })
      );
    }

    async loadProducts(category, brand) {
      const content = document.getElementById("buyback-content");
      const data = await this.fetchData(
        `/api/catalog/${category.toLowerCase()}/${brand.toLowerCase()}`
      );
      if (!data) return;

      console.log("data in loadproduct", data);

      content.innerHTML = `
        <button id="back-button">Back</button>
        <h3>Select a Product</h3>
        <div class="products-grid">
          ${data
            .map(
              (p) => `
                <div class="product-card" data-product="${p.slug}">
                  <img src="${p.image || "default.png"}" alt="${p.name}">
                  <span>${p.name}</span>
                </div>
              `
            )
            .join("")}
        </div>
      `;

      document
        .getElementById("back-button")
        .addEventListener("click", () => this.loadBrands(category));

      document.querySelectorAll(".product-card").forEach((card) =>
        card.addEventListener("click", (event) => {
          const productSlug = event.currentTarget.getAttribute("data-product");
          this.selectedOptions.product = productSlug;
          this.displayOptions(productSlug);
        })
      );
    }

    async displayOptions(productSlug) {
      const content = document.getElementById("buyback-content");

      content.innerHTML = `
        <button id="back-button">Back</button>
        <h3>Choose Device Condition</h3>
        <div id="buyback-displayOptions">Loading...</div>
      `;

      document
        .getElementById("back-button")
        .addEventListener("click", () =>
          this.loadProducts(
            this.selectedOptions.category,
            this.selectedOptions.brand
          )
        );

      const product = await this.fetchData(`/api/product/${productSlug}`);
      if (!product) {
        console.error("Product data is missing!");
        return;
      }

      console.log("product", product);

      this.selectedOptions.product = productSlug;

      // **Fix: Ensure element exists before modifying innerHTML**
      const displayOptions = document.getElementById("buyback-displayOptions");
      if (!displayOptions) {
        console.error("Element #buyback-displayOptions not found!");
        return;
      }

      displayOptions.innerHTML = `
    ${
      Array.isArray(product.product?.options)
        ? product.product.options
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
            .join("")
        : "<p>No options available</p>"
    }

    <h3>Select Device Condition</h3>
    <form id="condition-form"> 
      ${
        Array.isArray(product.conditions.conditions)
          ? product.conditions.conditions
              .map(
                (condition) => `
                  <div class="question-block">
                    <label>
                      <input type="radio" name="device-condition" value="${
                        condition.name
                      }" data-id="${condition._id}">
                      ${condition.name}
                    </label>
                    <p>${condition.guideline}</p>
                    <p>${condition.terms.join(", ")}</p>
                  </div>
                `
              )
              .join("")
          : "<p>No conditions available</p>"
      }
    </form>
    
    <button id="checkout-button">Proceed to Checkout</button>
  `;

      // **Ensure only one condition can be selected at a time**
      document
        .querySelectorAll('input[name="device-condition"]')
        .forEach((radio) => {
          radio.addEventListener("change", (event) => {
            this.selectedOptions.condition = {
              name: event.target.value,
              id: event.target.getAttribute("data-id"),
            };
            console.log("Selected condition:", this.selectedOptions.condition);
          });
        });

      // Track question answers
      document.querySelectorAll('input[type="radio"]').forEach((radio) => {
        radio.addEventListener("change", (event) => {
          const category = event.target.name;
          const value = event.target.value;

          // Ensure this.selectedOptions.answers is initialized
          if (!this.selectedOptions.answers) {
            this.selectedOptions.answers = {};
          }

          // Store selected answer for the category
          this.selectedOptions.answers[category] = value;

          console.log("Selected options:", this.selectedOptions.answers);
        });
      });

      const checkoutButton = document.getElementById("checkout-button");
      checkoutButton.removeEventListener("click", this.checkOut);
      checkoutButton.addEventListener("click", () => this.checkOut(product));
    }

    async checkOut(data) {
      const content = document.getElementById("buyback-content");

      // Ensure checkOut div exists
      if (!document.getElementById("buyback-checkOut")) {
        content.innerHTML += `<div id="buyback-checkOut"></div>`;
      }
      const checkOutSelect = document.getElementById("buyback-checkOut");

      checkOutSelect.innerHTML = `<p>Processing...</p>`;

      console.log("Selected Options Before Processing:", this.selectedOptions);

      // Ensure a condition is selected
      if (!this.selectedOptions.condition) {
        checkOutSelect.innerHTML = `<p>Please select a condition.</p>`;
        return;
      }

      console.log("Base Price from Product:", data);
      // let finalPrice = data.basePrice;
      let finalPrice = data.product?.basePrice || 0;

      // const priceModifiersData = data.priceModifiers;

      // console.log("Price Modifiers Data:", priceModifiersData);
      // if (priceModifiersData && priceModifiersData.priceModifiers) {
      // const priceModifiersData = data.product?.priceModifiers;
      const priceModifiersData = data.priceModifiers?.priceModifiers || [];
      console.log("Price Modifiers Data:", priceModifiersData);

      // ✅ **Fix: Don't add Condition to formattedSelections**
      const formattedSelections = {};

      if (this.selectedOptions.answers) {
        for (const [category, value] of Object.entries(
          this.selectedOptions.answers
        )) {
          if (category.trim().toLowerCase() !== "device-condition") {
            formattedSelections[category.trim()] = value.trim();
          }
        }
      }

      console.log("Formatted Selections:", formattedSelections);

      if (priceModifiersData?.length) {
        priceModifiersData.forEach(({ category, condition, modifier }) => {
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
      } else {
        console.warn("No price modifiers found.");
      }

      // ✅ Now formattedSelections is always available here
      const finalData = {
        selectedOptions: this.selectedOptions,
        formattedSelections, // ✅ No more ReferenceError
        finalPrice,
      };
      console.log("✅ Final Data Passed to Checkout:", finalData);

      checkOutSelect.innerHTML = `<h3>Final Trade-in Value: <b>$${finalPrice}</b></h3>`;
    }
  }

  window.Buyback = Buyback;
})();
