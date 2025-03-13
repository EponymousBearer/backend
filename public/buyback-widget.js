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
      // const categorySelect = document.getElementById("buyback-content");
      // const data = await this.fetchData(`/api/allcategories`);
      // console.log(data.map((c) => c.name));
      const content = document.getElementById("buyback-content");
      const data = await this.fetchData(`/api/allcategories`);
      if (!data) return;
      // if (!data) return;

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

      content.innerHTML = `
        <button id="back-button">Back</button>
        <h3>Select a Product</h3>
        <div class="products-grid">
          ${data
            .map(
              (p) => `
                <div class="product-card" data-product="${p.slug}">
                  <img src="${p.image_url || "default.png"}" alt="${p.name}">
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

      // productSelect.disabled = false;
      // productSelect.addEventListener("change", (event) => {
      //   const selectedProductSlug = event.target.value;
      //   const selectedProduct = data.find(
      //     (p) => p.slug === selectedProductSlug
      //   );

      // if (selectedProduct) {
      //   this.displayOptions(selectedProduct);
      // }
      // });
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
      if (!product) return;

      console.log("product", product);

      const data = await this.fetchData(`/api/conditions/${productSlug}`);
      if (!data) return;

      document.getElementById("buyback-displayOptions").innerHTML = `
        ${data.conditions
          .map(
            (option) => `
              <div class="question-block">
                <label>
                  <input type="radio" name="condition" value="${option.name}">
                  ${option.name}
                </label>
              </div>
            `
          )
          .join("")}
        <button id="checkout-button">Proceed to Checkout</button>
      `;

      document
        .getElementById("checkout-button")
        .addEventListener("click", () => this.showCheckout());

      // // const displayOptions = document.getElementById("buyback-displayOptions");
      // if (!displayOptions) {
      //   console.error("Element #buyback-displayOptions not found!");
      //   return;
      // }

      // const productSlug = data.slug;
      // console.log("productSlug", productSlug);

      // // loading product conditions
      // const conditions = await this.fetchData(`/api/conditions/${productSlug}`);
      // if (!conditions) return;

      // console.log("conditions", conditions.conditions);

      // // displayOptions.innerHTML = `<option>Loading...</option>`;
      // let selectedOptions = {}; // Object to store selected answers
      // displayOptions.innerHTML = `
      // ${data.options
      //   .map(
      //     (option) => `
      //       <div class="question-block">
      //           <h3>${option.question}</h3>
      //           <form>
      //               ${option.answers
      //                 .map(
      //                   (answer) => `
      //                   <label>
      //                       <input type="radio" name="${option.category}" value="${answer}">
      //                       ${answer}
      //                   </label><br>
      //               `
      //                 )
      //                 .join("")}
      //           </form>
      //       </div>
      //     `
      //   )
      //   .join("")}

      //   ${conditions.conditions
      //     .map(
      //       (option) => `
      //         <div class="question-block">
      //             <br/>
      //             <form>
      //                 <label>
      //                   <input type="radio" name="condition" value="${
      //                     option.name
      //                   }">
      //                     ${option.name}
      //                 </label>
      //                 <p>${option.guideline}</p>
      //                 <p>${option.terms.join(", ")}</p>
      //             </form>
      //             <br/>
      //         </div>
      //       `
      //     )
      //     .join("")}
      //   `;

      // Add event listeners for all radio buttons

      // content.querySelectorAll("input[type='radio']").forEach((input) => {
      //   input.addEventListener("change", (event) => {
      //     const { name, value } = event.target;
      //     selectedOptions[name] = value; // Store selection

      //     // Log the selected options for debugging
      //     console.log("Selected Options:", selectedOptions);
      //   });
      // });

      // // **Event Listener for All Options**
      // const checkOutSelect = document.getElementById("buyback-content");
      // // **Event Listener for All Options**
      // content.querySelectorAll("input[type='radio']").forEach((input) => {
      //   input.addEventListener("change", async (event) => {
      //     const { name, value } = event.target;

      //     // If it's a condition, uncheck others first
      //     if (name === "condition") {
      //       content
      //         .querySelectorAll(`input[name="condition"]`)
      //         .forEach((radio) => {
      //           radio.checked = false;
      //         });
      //       event.target.checked = true;
      //     }

      //     selectedOptions[name] = value;

      //     console.log("Selected Options:", selectedOptions);

      //     // **Trigger price update whenever an option is changed**
      //     checkOutSelect.innerHTML = `<p>Updating Price...</p>`;
      //     await this.checkOut(selectedOptions, data);
      //   });
      // });

      // // Initial price calculation
      // await this.checkOut(selectedOptions, data);
    }

    showCheckout() {
      document.getElementById("buyback-content").innerHTML = `
        <h3>Order Summary</h3>
        <p><strong>Category:</strong> ${this.selectedOptions.category}</p>
        <p><strong>Brand:</strong> ${this.selectedOptions.brand}</p>
        <p><strong>Product:</strong> ${this.selectedOptions.product}</p>
        <button id="back-button">Back</button>
      `;

      document
        .getElementById("back-button")
        .addEventListener("click", () => this.loadCategories());
    }
  }
  //   async checkOut(selectedOptions, data) {
  //     const checkOutSelect = document.getElementById("buyback-checkOut");
  //     checkOutSelect.innerHTML = `<p>Processing...</p>`;

  //     console.log("Selected Options:", selectedOptions);

  //     const selectedCondition = selectedOptions["condition"];
  //     if (!selectedCondition) {
  //       checkOutSelect.innerHTML = `<p>Please select a condition.</p>`;
  //       return;
  //     }
  //     console.log("Base Price from Product:", data);
  //     let finalPrice = data.basePrice;

  //     const priceModifiersData = await this.fetchData(
  //       `/api/priceModifiers/${data.slug}`
  //     );

  //     console.log("Price Modifiers Data:", priceModifiersData);
  //     if (priceModifiersData && priceModifiersData.priceModifiers) {
  //       const priceModifiers = priceModifiersData.priceModifiers;
  //       // console.log("priceModifiers", priceModifiers);

  //       // 🔹 **Map selectedOptions keys to category names**
  //       const formattedSelections = { Condition: selectedCondition.trim() };

  //       for (const [category, value] of Object.entries(selectedOptions)) {
  //         if (category !== "condition") {
  //           formattedSelections[category.trim()] = value.trim();
  //         }
  //       }
  //       console.log("Formatted Selections:", formattedSelections);

  //       // 🔹 **Apply price modifications**
  //       priceModifiers.forEach(({ category, condition, modifier }) => {
  //         if (
  //           formattedSelections.hasOwnProperty(category.trim()) &&
  //           formattedSelections[category.trim()] === condition.trim()
  //         ) {
  //           console.log(
  //             `Applying Modifier: ${modifier} for ${category} -> ${condition}`
  //           );
  //           finalPrice += modifier;
  //         }
  //       });
  //     }

  //     checkOutSelect.innerHTML = `<h3>Final Trade-in Value: <b>$${finalPrice}</b></h3>`;
  //   }
  // }

  window.Buyback = Buyback;
})();
