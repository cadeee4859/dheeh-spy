const products = [
  { id: 1, name: "Morocco Bath", price: 1250 },
  { id: 2, name: "Facial", price: 480 },
  { id: 3, name: "Hair Treatment", price: 1890 }
];

const cart = [];
const accountStorageKey = "shopDemoAccount";
const balanceStorageKey = "shopDemoBalance";
const ordersStorageKey = "shopDemoOrders";
const cartStorageKey = "shopDemoCart";
let demoAccount = JSON.parse(localStorage.getItem(accountStorageKey) || "null");
let demoBalance = Number(localStorage.getItem(balanceStorageKey) || 0);
let demoOrders = JSON.parse(localStorage.getItem(ordersStorageKey) || "[]");
let purchaseInProgress = false;

const cartButton = document.getElementById("cart-button");
const cartCount = document.getElementById("cart-count");
const cartModal = document.getElementById("cart-modal");
const closeCartButton = document.getElementById("close-cart");
const browseProductsButton = document.getElementById("browse-products");
const cartItems = document.getElementById("cart-items");
const emptyCart = document.getElementById("empty-cart");
const cartTotal = document.getElementById("cart-total");
const checkoutBalance = document.getElementById("checkout-balance");
const checkoutButton = document.getElementById("checkout-button");
const confirmPurchaseButton = document.getElementById("confirm-purchase");
const checkoutMessage = document.getElementById("checkout-message");
const purchaseSuccess = document.getElementById("purchase-success");
const accountButton = document.getElementById("account-button");
const accountModal = document.getElementById("account-modal");
const closeAccountButton = document.getElementById("close-account");
const accountContent = document.getElementById("account-content");

const savedCart = JSON.parse(localStorage.getItem(cartStorageKey) || "[]");
savedCart.forEach((item) => {
  const product = products.find((productItem) => productItem.id === item.id);
  if (product && item.quantity > 0) {
    cart.push({ ...product, quantity: item.quantity });
  }
});

function formatPrice(price) { return `${price.toLocaleString()} ETB`; }

function saveDemoData() {
  if (demoAccount) localStorage.setItem(accountStorageKey, JSON.stringify(demoAccount));
  else localStorage.removeItem(accountStorageKey);
  localStorage.setItem(balanceStorageKey, String(demoBalance));
  localStorage.setItem(ordersStorageKey, JSON.stringify(demoOrders));
}

function saveCart() {
  localStorage.setItem(cartStorageKey, JSON.stringify(cart));
}

function getCartTotal() {
  return cart.reduce((total, item) => total + item.price * item.quantity, 0);
}

function showCheckoutMessage(message, isError = false) {
  checkoutMessage.textContent = message;
  checkoutMessage.classList.toggle("error", isError);
}

function addToCart(productId, button) {
  const product = products.find((item) => item.id === productId);
  const cartItem = cart.find((item) => item.id === productId);
  if (cartItem) cartItem.quantity += 1;
  else cart.push({ ...product, quantity: 1 });
  saveCart();
  updateCart();
  button.textContent = "Added ✓";
  button.classList.add("button-feedback");
  window.setTimeout(() => {
    button.textContent = "Add to Cart";
    button.classList.remove("button-feedback");
  }, 700);
}

function changeQuantity(productId, change) {
  const cartItem = cart.find((item) => item.id === productId);
  if (!cartItem) return;
  cartItem.quantity += change;
  if (cartItem.quantity <= 0) removeFromCart(productId);
  else {
    saveCart();
    updateCart();
  }
}

function removeFromCart(productId) {
  const itemIndex = cart.findIndex((item) => item.id === productId);
  if (itemIndex !== -1) {
    cart.splice(itemIndex, 1);
    saveCart();
    updateCart();
  }
}

function updateCart() {
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  cartCount.textContent = itemCount;
  cartTotal.textContent = formatPrice(getCartTotal());
  checkoutBalance.textContent = formatPrice(demoBalance);
  cartItems.innerHTML = "";
  emptyCart.hidden = cart.length > 0;
  if (!purchaseInProgress) {
    confirmPurchaseButton.hidden = true;
    confirmPurchaseButton.disabled = false;
    checkoutButton.disabled = false;
  }

  cart.forEach((item) => {
    const cartItem = document.createElement("div");
    cartItem.className = "cart-item";
    cartItem.innerHTML = `
      <div>
        <h3>${item.name}</h3>
        <p>${formatPrice(item.price)} each</p>
        <button class="remove-button" type="button" data-action="remove" data-product-id="${item.id}">Remove</button>
      </div>
      <div class="quantity-controls" aria-label="Change quantity for ${item.name}">
        <button type="button" data-action="decrease" data-product-id="${item.id}" aria-label="Decrease quantity">-</button>
        <span class="quantity">${item.quantity}</span>
        <button type="button" data-action="increase" data-product-id="${item.id}" aria-label="Increase quantity">+</button>
      </div>`;
    cartItems.appendChild(cartItem);
  });
}

function openCart() {
  updateCart();
  cartModal.hidden = false;
  closeCartButton.focus();
}

function closeCart() {
  cartModal.hidden = true;
  cartButton.focus();
}

function showBalanceNotification(amount) {
  const notification = document.createElement("div");
  notification.className = "balance-notification";
  notification.setAttribute("role", "status");
  notification.textContent = `+${formatPrice(amount)} added to your demo balance`;
  document.body.appendChild(notification);
  window.setTimeout(() => notification.remove(), 2600);
}

function renderOrderHistory() {
  if (demoOrders.length === 0) return '<p class="order-history-empty">No demo orders yet.</p>';
  return demoOrders.map((order) => `
    <div class="order-record">
      <strong>Order #${order.number}</strong>
      <span>${order.date}</span>
      ${order.items.map((item) => `<span>${item.name} × ${item.quantity}</span>`).join("")}
      <span>Total: ${formatPrice(order.total)}</span>
    </div>`).join("");
}

function renderAccount() {
  if (!demoAccount) {
    accountContent.innerHTML = `
      <form class="account-form" id="login-form">
        <label>Email<input id="account-email" type="email" required autocomplete="email"></label>
        <label>Password<input id="account-password" type="password" required autocomplete="current-password"></label>
        <button class="account-submit" type="submit">Login</button>
        <button class="account-option" id="create-account" type="button">Create Account</button>
        <p class="account-note">Frontend demo only: no password is saved, and this is not real secure authentication.</p>
        <p class="account-message" id="account-message" role="status"></p>
      </form>`;
    document.getElementById("login-form").addEventListener("submit", (event) => {
      event.preventDefault();
      demoAccount = { email: document.getElementById("account-email").value.trim() };
      saveDemoData();
      renderAccount();
    });
    document.getElementById("create-account").addEventListener("click", () => {
      const emailInput = document.getElementById("account-email");
      const message = document.getElementById("account-message");
      if (!emailInput.value.trim()) {
        message.textContent = "Enter an email first to create your demo account.";
        emailInput.focus();
        return;
      }
      demoAccount = { email: emailInput.value.trim() };
      saveDemoData();
      renderAccount();
    });
    return;
  }

  accountContent.innerHTML = `
    <div class="account-welcome">
      <h3>Welcome</h3>
      <p>${demoAccount.email}</p>
      <div class="wallet">
        <div class="wallet-label">Demo balance</div>
        <div class="wallet-balance" id="wallet-balance">${formatPrice(demoBalance)}</div>
        <button class="add-money-button" id="add-money" type="button">Add Money</button>
        <div class="amount-options" id="amount-options" hidden>
          <button class="amount-button" type="button" data-amount="100">100 ETB</button>
          <button class="amount-button" type="button" data-amount="500">500 ETB</button>
          <button class="amount-button" type="button" data-amount="1000">1,000 ETB</button>
          <button class="amount-button" type="button" data-amount="5000">5,000 ETB</button>
        </div>
        <p class="account-note">Demo feature only. This does not connect to a bank or payment service.</p>
        <p class="account-message" id="account-message" role="status"></p>
      </div>
      <div class="order-history">
        <h3>Order History</h3>
        ${renderOrderHistory()}
      </div>
      <button class="logout-button" id="logout-button" type="button">Logout</button>
    </div>`;

  document.getElementById("add-money").addEventListener("click", () => {
    document.getElementById("amount-options").hidden = false;
  });
  accountContent.querySelectorAll(".amount-button").forEach((button) => {
    button.addEventListener("click", () => {
      const amount = Number(button.dataset.amount);
      demoBalance += amount;
      saveDemoData();
      document.getElementById("wallet-balance").textContent = formatPrice(demoBalance);
      document.getElementById("account-message").textContent = "Demo balance updated.";
      updateCart();
      showBalanceNotification(amount);
    });
  });
  document.getElementById("logout-button").addEventListener("click", () => {
    demoAccount = null;
    saveDemoData();
    renderAccount();
  });
}

function showPurchaseSuccess(total) {
  purchaseSuccess.innerHTML = `
    <div class="success-check" aria-hidden="true">✓</div>
    <h3>Purchase Confirmed!</h3>
    <p>Your demo order has been placed successfully.</p>
    <p class="success-total">Total: ${formatPrice(total)}</p>
    <button class="success-close" id="close-success" type="button">Close Message</button>`;
  purchaseSuccess.hidden = false;
  document.getElementById("close-success").focus();
  document.getElementById("close-success").addEventListener("click", () => {
    purchaseSuccess.hidden = true;
  });
}

document.querySelectorAll(".add-button").forEach((button) => {
  button.addEventListener("click", () => addToCart(Number(button.dataset.productId), button));
});

cartItems.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const productId = Number(button.dataset.productId);
  if (button.dataset.action === "increase") changeQuantity(productId, 1);
  if (button.dataset.action === "decrease") changeQuantity(productId, -1);
  if (button.dataset.action === "remove") removeFromCart(productId);
});

browseProductsButton.addEventListener("click", () => {
  closeCart();
  document.getElementById("products").scrollIntoView({ behavior: "smooth" });
});

checkoutButton.addEventListener("click", () => {
  if (cart.length === 0) showCheckoutMessage("Add a product before checkout.", true);
  else if (!demoAccount) showCheckoutMessage("Please open Account and log in first.", true);
  else if (demoBalance < getCartTotal()) {
    showCheckoutMessage("Insufficient balance", true);
    checkoutMessage.insertAdjacentHTML("beforeend", "<br><span>Add money to your demo balance to continue.</span>");
  } else {
    showCheckoutMessage("Balance is ready for this demo purchase.");
    confirmPurchaseButton.hidden = false;
  }
});

confirmPurchaseButton.addEventListener("click", () => {
  if (purchaseInProgress || !demoAccount || demoBalance < getCartTotal()) return;
  purchaseInProgress = true;
  const total = getCartTotal();
  const purchasedItems = cart.map((item) => ({ name: item.name, quantity: item.quantity }));
  confirmPurchaseButton.disabled = true;
  checkoutButton.disabled = true;
  showCheckoutMessage("Processing...");

  window.setTimeout(() => {
    demoBalance -= total;
    demoOrders.unshift({
      number: 1001 + demoOrders.length,
      date: new Date().toLocaleString(),
      items: purchasedItems,
      total
    });
    cart.length = 0;
    saveCart();
    saveDemoData();
    purchaseInProgress = false;
    updateCart();
    showPurchaseSuccess(total);
  }, 650);
});

cartButton.addEventListener("click", openCart);
closeCartButton.addEventListener("click", closeCart);
accountButton.addEventListener("click", () => {
  renderAccount();
  accountModal.hidden = false;
  closeAccountButton.focus();
});
closeAccountButton.addEventListener("click", () => {
  accountModal.hidden = true;
  accountButton.focus();
});

[cartModal, accountModal].forEach((modal) => {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) modal.hidden = true;
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    cartModal.hidden = true;
    accountModal.hidden = true;
  }
});

updateCart();
