(function () {
  class Buyback {
    constructor({ apiUrl, apiKey }) {
      this.apiUrl = apiUrl;
      this.apiKey = apiKey;
      this.selectedItems = [];
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

      container.innerHTML = `
      <div id="buyback-container">
        <h2>Select Your Device</h2>
        <div id="buyback-categories"></div>
        <div id="buyback-brands" style="display: none;"></div>
        <div id="buyback-products" style="display: none;"></div>
        <div id="buyback-displayOptions" style="display: none;"></div>
        <div id="buyback-conditions" style="display: none;"></div>
        <div id="buyback-checkOut" style="display: none;"></div>
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
      const loadCategories = document.getElementById("buyback-categories");

      if (!loadCategories) {
        console.error("Element #buyback-categories not found!");
        return;
      }
      const data = await this.fetchData(`/api/allcategories`);
      if (!data) return;

      loadCategories.innerHTML = `
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
      this.addCategoryClickListeners();
    }

    addCategoryClickListeners() {
      const categoryCards = document.querySelectorAll(".category-card");
      categoryCards.forEach((card) => {
        card.addEventListener("click", (event) => {
          const category = event.currentTarget.getAttribute("data-category");
          console.log("Selected category:", category); // Debugging log
          this.selectedOptions.category = category;
          this.hideElement("buyback-categories");
          this.loadBrands(category);
        });
      });
    }

    async loadBrands(category) {
      const loadBrands = document.getElementById("buyback-brands");

      if (!loadBrands) {
        console.error("Element #buyback-brands not found!");
        return;
      }

      const data = await this.fetchData(
        `/api/brands/${category.toLowerCase()}`
      );
      if (!data) return;

      loadBrands.innerHTML = `
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
      this.showElement("buyback-brands");
      this.hideElement("buyback-categories");

      // Attach the back button event listener
      const backButton = document.getElementById("back-button");
      if (backButton) {
        backButton.addEventListener("click", () => {
          console.log("Back button clicked"); // Debugging log
          this.showElement("buyback-categories");
          this.hideElement("buyback-brands");
        });
      } else {
        console.error("Back button not found in the DOM!");
      }

      this.addBrandClickListeners();
    }

    addBrandClickListeners() {
      // const loadBrands = document.getElementById("buyback-brands");
      document.querySelectorAll(".brand-card").forEach((card) =>
        card.addEventListener("click", (event) => {
          const brand = event.currentTarget.getAttribute("data-brand");
          this.selectedOptions.brand = brand;
          this.showElement("buyback-products");
          this.loadProducts(this.selectedOptions.category, brand);
        })
      );
    }

    async loadProducts(category, brand) {
      const content = document.getElementById("buyback-products");
      if (!content) {
        console.error("Element #buyback-products not found!");
        return;
      }
      // Show products and hide brands
      this.hideElement("buyback-brands");
      this.showElement("buyback-products");
      const data = await this.fetchData(
        `/api/catalog/${category.toLowerCase()}/${brand.toLowerCase()}`
      );
      if (!data) return;

      console.log("data in loadproduct", data);

      content.innerHTML = `
        <button id="back-buttonn">Back</button>
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

      // Attach the back button event listener
      const backButton = document.getElementById("back-buttonn");
      if (backButton) {
        backButton.addEventListener("click", () => {
          console.log("Back button clicked"); // Debugging log
          this.showElement("buyback-brands");
          this.hideElement("buyback-products");
        });
      } else {
        console.error("Back button not found in the DOM!");
      }

      this.addProductClickListeners(); // Ensure product click listeners are added
    }

    addProductClickListeners() {
      const content = document.getElementById("buyback-products");
      document.querySelectorAll(".product-card").forEach((card) =>
        card.addEventListener("click", (event) => {
          const productSlug = event.currentTarget.getAttribute("data-product");
          this.selectedOptions.product = productSlug;
          this.showElement("buyback-displayOptions");
          this.displayOptions(productSlug);
        })
      );
    }

    async displayOptions(productSlug) {
      // const content = document.getElementById("buyback-displayOptions");
      // **Fix: Ensure element exists before modifying innerHTML**
      const displayOptions = document.getElementById("buyback-displayOptions");
      if (!displayOptions) {
        console.error("Element #buyback-displayOptions not found!");
        return;
      }

      displayOptions.innerHTML = `
        <button id="back-buttonnn">Back</button>
        <div id="questions-section">Loading...</div>
        <div id="condition-section" style="display: none;">
          <h3>Select Device Condition</h3>
          <form id="buyback-conditions"></form>
          <button id="checkout-button" style="display: none;">Proceed to Checkout</button>
        </div>
      `;

      // Show brands and hide categories
      this.hideElement("buyback-brands");
      this.hideElement("buyback-categories");
      this.hideElement("buyback-products");

      document.getElementById("back-buttonnn").addEventListener("click", () => {
        this.showElement("buyback-products");
        this.hideElement("buyback-displayOptions");
      });

      const product = await this.fetchData(`/api/product/${productSlug}`);
      if (!product) {
        console.error("Product data is missing!");
        return;
      }

      console.log("product", product);

      this.selectedOptions.product = productSlug;

      // **Show Questions First**
      const questions = Array.isArray(product.product?.options)
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
        : "<p>No questions available</p>";

      document.getElementById("questions-section").innerHTML = questions;

      this.trackAnswers(product);
    }

    async trackAnswers(product) {
      // displayOptions.innerHTML = questions;

      // **Track question answers and show conditions after all are answered**
      const totalQuestions = product.product?.options.length || 0;
      let answeredQuestions = 0;
      this.selectedOptions.answers = {}; // Ensure this is initialized

      document.querySelectorAll('input[type="radio"]').forEach((radio) => {
        radio.addEventListener("change", (event) => {
          const category = event.target.name;
          const value = event.target.value;

          if (!this.selectedOptions.answers[category]) {
            answeredQuestions++; // Only count if it's the first time selecting
          }

          this.selectedOptions.answers[category] = value;
          console.log("Selected options:", this.selectedOptions.answers);

          if (answeredQuestions === totalQuestions) {
            this.hideElement("questions-section");
            this.showElement("condition-section");
            this.loadConditions(product);
          }
        });
      });
    }
    // Function to load conditions after answering all questions
    async loadConditions(product) {
      const conditionForm = document.getElementById("buyback-conditions");

      conditionForm.innerHTML = Array.isArray(product.conditions.conditions)
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
        : "<p>No conditions available</p>";

      this.addConditionChangeListeners(product);

      // document
      //   .querySelectorAll('input[name="device-condition"]')
      //   .forEach((radio) => {
      //     radio.addEventListener("change", (event) => {
      //       this.selectedOptions.condition = {
      //         name: event.target.value,
      //         id: event.target.getAttribute("data-id"),
      //       };
      //       document.getElementById("checkout-button").style.display = "block";
      //     });
      //   });

      // document
      //   .getElementById("checkout-button")
      //   .addEventListener("click", () => {
      //     this.checkOut();
      //   });
    }

    addConditionChangeListeners(product) {
      document
        .querySelectorAll('input[name="device-condition"]')
        .forEach((radio) => {
          radio.addEventListener("change", (event) => {
            this.selectedOptions.condition = {
              name: event.target.value,
              id: event.target.getAttribute("data-id"),
            };
            document.getElementById("checkout-button").style.display = "block";
          });
        });

      document
        .getElementById("checkout-button")
        .addEventListener("click", () => {
          this.checkOut(product);
        });
    }

    async checkOut(data) {
      const checkOutSelect = document.getElementById("buyback-checkOut");
      this.hideElement("buyback-displayOptions");
      this.hideElement("buyback-conditions");

      // Hide display options and condition section
      // document.getElementById("buyback-displayOptions").style.display = "none";
      // document.getElementById("buyback-conditions").style.display = "none";

      checkOutSelect.innerHTML = `<p>Processing...</p>`;

      console.log("Selected Options Before Processing:", this.selectedOptions);

      // Ensure a condition is selected
      if (!this.selectedOptions.condition) {
        checkOutSelect.innerHTML = `<p>Please select a condition.</p>`;
        return;
      }

      // Check if data is defined and has the required properties
      if (!data || !data.product) {
        checkOutSelect.innerHTML = `<p>Error: Product data is missing.</p>`;
        console.error("Data or product is undefined:", data);
        return;
      }

      console.log("Base Price from Product:", data);
      // let finalPrice = data.basePrice;
      let finalPrice = data.product?.basePrice || 0;
      let quantity = 1; // Default quantity

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
        // formattedSelections, // ✅ No more ReferenceError
        finalPrice,
      };

      // Remove "device-condition" from answers
      if (finalData.selectedOptions.answers) {
        delete finalData.selectedOptions.answers["device-condition"];
      }
      console.log("✅ Final Data Passed to Checkout:", finalData);

      // checkOutSelect.innerHTML = `<h3>Final Trade-in Value: <b>$${finalPrice}</b></h3>`;

      // const order = await this.fetchData(
      //   `/api/orders/${category.toLowerCase()}/}`
      // );
      // if (!data) return;

      // console.log("Location Data", data);

      // ✅ **Display Checkout UI**
      checkOutSelect.innerHTML = `
    <div style="padding: 16px; border-radius: 8px; background: #f9f9f9;">
        <button id="back-buttonnnn" style="border: none; background: none; font-size: 16px; cursor: pointer;">
            ← Back
        </button>

        <div style="margin-top: 16px; padding: 12px; border: 1px solid #ddd; border-radius: 8px;">
            <h3 style="margin: 0;">Store Location</h3>
            <p style="font-weight: bold; font-size: 18px;">📍 ${
              data.storeLocation?.city || "Unknown"
            }</p>
            <p>${data.storeLocation?.address || "Address not available"}</p>
        </div>

        <div style="margin-top: 16px; padding: 12px; border: 1px solid #ddd; border-radius: 8px;">
            <h3 style="margin: 0;">Your Trade-in Item</h3>
            <div style="display: flex; align-items: center; gap: 12px;">
                <img src="${
                  data.product?.image || "default.jpg"
                }" width="60" height="60" style="border-radius: 6px;">
                <div>
                    <p style="font-weight: bold;">${
                      data.product?.name || "Unknown Device"
                    }</p>
                    <p>${
                      Object.entries(this.selectedOptions.answers || {})
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(", ") || "No selections made"
                    }</p>
                    <p>${
                      this.selectedOptions.condition.name || "Unknown Condition"
                    }</p>
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <button id="decreaseQuantity" style="border: none; background: #ddd; padding: 6px; cursor: pointer;">-</button>
                        <span id="quantityValue">${quantity}</span>
                        <button id="increaseQuantity" style="border: none; background: #ddd; padding: 6px; cursor: pointer;">+</button>
                    </div>
                </div>
            </div>
        </div>

        <div style="margin-top: 16px; padding: 12px; border: 1px solid #ddd; border-radius: 8px;">
            <h3 style="margin: 0;">Total Payout: <b><span id="totalPayout">${finalPrice.toFixed(
              2
            )} د.إ</span></b></h3>
        </div>

        <div style="margin-top: 16px;">
            <button style="padding: 12px 24px; background: blue; color: white; border-radius: 6px; border: none; cursor: pointer;">
                Continue
            </button>
            <button id="another-item" style="padding: 12px 24px; background: blue; color: white; border-radius: 6px; border: none; cursor: pointer;">
                Add Another Item
            </button>
        </div>
    </div>
`;

      // ✅ **Fix: Ensure the Back Button Works Properly**
      document.getElementById("another-item").addEventListener("click", () => {
        console.log("Another Item clicked! Showing from start.");
        this.showElement("buyback-categories");
        // this.hideElement("buyback-checkOut");
      });

      // ✅ **Fix: Delay Event Listener Attachment**
      setTimeout(() => {
        const increaseBtn = document.getElementById("increaseQuantity");
        const decreaseBtn = document.getElementById("decreaseQuantity");

        if (increaseBtn && decreaseBtn) {
          increaseBtn.addEventListener("click", () => updateQuantity(1));
          decreaseBtn.addEventListener("click", () => updateQuantity(-1));
        } else {
          console.error("Quantity buttons not found!");
        }
      }, 0);

      function updateQuantity(change) {
        if (quantity + change >= 1) {
          quantity += change;
          document.getElementById("quantityValue").innerText = quantity;
          document.getElementById("totalPayout").innerText = (
            finalPrice * quantity
          ).toFixed(2);
        }
      }

      this.showElement("buyback-checkOut");
    }

    showElement(elementId) {
      const element = document.getElementById(elementId);
      if (element) {
        element.style.display = "block";
      }
    }

    hideElement(elementId) {
      const element = document.getElementById(elementId);
      if (element) {
        element.style.display = "none";
      }
    }
  }

  window.Buyback = Buyback;
})();
