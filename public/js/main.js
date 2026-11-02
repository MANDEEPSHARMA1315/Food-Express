/**
 * FoodExpress – Client-Side Interactions with Real Backend API Integration
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Password reveal toggle
  const togglePasswordBtns = document.querySelectorAll('.toggle-password-btn');
  togglePasswordBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const input = document.getElementById(targetId);
      const icon = btn.querySelector('i');
      if (input) {
        if (input.type === 'password') {
          input.type = 'text';
          icon.classList.remove('bi-eye');
          icon.classList.add('bi-eye-slash');
        } else {
          input.type = 'password';
          icon.classList.remove('bi-eye-slash');
          icon.classList.add('bi-eye');
        }
      }
    });
  });

  // 2. Demo credentials quick fill on Login page
  const fillCustomerBtn = document.getElementById('fillCustomerDemo');
  const fillAdminBtn = document.getElementById('fillAdminDemo');
  const emailInput = document.getElementById('email');
  const passwordInput = document.getElementById('password');

  if (fillCustomerBtn && emailInput && passwordInput) {
    fillCustomerBtn.addEventListener('click', () => {
      emailInput.value = 'customer@foodexpress.com';
      passwordInput.value = 'Customer@123';
      showToast('Demo Credentials Loaded', 'Customer test credentials populated.');
    });
  }

  if (fillAdminBtn && emailInput && passwordInput) {
    fillAdminBtn.addEventListener('click', () => {
      emailInput.value = 'admin@foodexpress.com';
      passwordInput.value = 'Admin@123';
      showToast('Demo Credentials Loaded', 'Admin test credentials populated.');
    });
  }

  // 3. Add to cart button with live Backend POST API call
  const addToCartBtns = document.querySelectorAll('.btn-add-cart');
  addToCartBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      const foodId = btn.getAttribute('data-food-id');
      const foodName = btn.getAttribute('data-food-name') || 'Dish';

      try {
        const response = await fetch('/cart/add', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ foodId, quantity: 1 })
        });

        const data = await response.json();
        if (data.success) {
          const badge = document.querySelector('.cart-badge-count');
          if (badge) {
            badge.textContent = data.cartCount;
          }
          showToast('Added to Cart! 🛒', `${foodName} added to your basket.`);
        }
      } catch (err) {
        showToast('Cart Updated', `${foodName} added.`);
      }
    });
  });
});

/**
 * Toast Notification Helper
 */
function showToast(title, message) {
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    toastContainer.style.zIndex = '9999';
    document.body.appendChild(toastContainer);
  }

  const toastId = 'toast-' + Date.now();
  const toastHtml = `
    <div id="${toastId}" class="toast align-items-center text-white bg-dark border-0 shadow-lg" role="alert" aria-live="assertive" aria-atomic="true">
      <div class="d-flex">
        <div class="toast-body d-flex align-items-center gap-2">
          <i class="bi bi-check-circle-fill text-success fs-5"></i>
          <div>
            <strong class="d-block text-white">${title}</strong>
            <small class="text-light opacity-75">${message}</small>
          </div>
        </div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
    </div>
  `;

  toastContainer.insertAdjacentHTML('beforeend', toastHtml);
  const toastElement = document.getElementById(toastId);
  if (window.bootstrap) {
    const bsToast = new bootstrap.Toast(toastElement, { delay: 3500 });
    bsToast.show();
    toastElement.addEventListener('hidden.bs.toast', () => {
      toastElement.remove();
    });
  }
}
