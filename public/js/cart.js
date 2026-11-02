/**
 * FoodExpress – Shopping Cart Client-side State & Calculation Logic
 */

document.addEventListener('DOMContentLoaded', () => {
  const cartRows = document.querySelectorAll('.cart-row');
  let currentDiscount = 0;

  function recalculateTotals() {
    let subtotal = 0;
    const activeRows = document.querySelectorAll('.cart-row');

    activeRows.forEach(row => {
      const price = parseFloat(row.getAttribute('data-price') || '0');
      const qtyInput = row.querySelector('.qty-input');
      const qty = parseInt(qtyInput ? qtyInput.value : '1', 10);
      const rowTotal = price * qty;
      
      const rowTotalEl = row.querySelector('.row-total');
      if (rowTotalEl) {
        rowTotalEl.textContent = `₹${rowTotal.toFixed(0)}`;
      }
      subtotal += rowTotal;
    });

    const subtotalEl = document.getElementById('summarySubtotal');
    const deliveryEl = document.getElementById('summaryDelivery');
    const taxEl = document.getElementById('summaryTax');
    const discountEl = document.getElementById('summaryDiscount');
    const totalEl = document.getElementById('summaryTotal');
    const freeDeliveryNotice = document.getElementById('freeDeliveryNotice');

    if (subtotalEl) {
      subtotalEl.textContent = `₹${subtotal.toFixed(0)}`;
    }

    // Delivery calculation: Free if subtotal > 499
    let deliveryFee = 0;
    if (subtotal > 0) {
      deliveryFee = subtotal >= 499 ? 0 : 40;
    }

    if (deliveryEl) {
      if (deliveryFee === 0 && subtotal > 0) {
        deliveryEl.innerHTML = '<span class="text-success fw-bold">FREE</span>';
      } else {
        deliveryEl.textContent = `₹${deliveryFee}`;
      }
    }

    if (freeDeliveryNotice) {
      if (subtotal >= 499) {
        freeDeliveryNotice.innerHTML = '<span class="badge bg-success-subtle text-success"><i class="bi bi-patch-check-fill me-1"></i>You unlocked Free Delivery!</span>';
      } else if (subtotal > 0) {
        const remaining = 499 - subtotal;
        freeDeliveryNotice.innerHTML = `<small class="text-muted">Add <strong class="text-primary">₹${remaining.toFixed(0)}</strong> more to get Free Delivery!</small>`;
      }
    }

    const tax = Math.round(subtotal * 0.05);
    if (taxEl) taxEl.textContent = `₹${tax}`;

    if (discountEl) discountEl.textContent = `-₹${currentDiscount}`;

    const grandTotal = Math.max(0, subtotal + deliveryFee + tax - currentDiscount);
    if (totalEl) totalEl.textContent = `₹${grandTotal}`;

    // Update cart badge
    const badge = document.querySelector('.cart-badge-count');
    if (badge) {
      badge.textContent = activeRows.length;
    }

    // Empty state check
    if (activeRows.length === 0) {
      const cartTableContainer = document.getElementById('cartTableContainer');
      const emptyCartState = document.getElementById('emptyCartState');
      if (cartTableContainer && emptyCartState) {
        cartTableContainer.style.display = 'none';
        emptyCartState.style.display = 'block';
      }
    }
  }

  // Handle Quantity Increase & Decrease
  document.querySelectorAll('.qty-control').forEach(control => {
    const decBtn = control.querySelector('.qty-dec');
    const incBtn = control.querySelector('.qty-inc');
    const input = control.querySelector('.qty-input');

    if (decBtn && incBtn && input) {
      decBtn.addEventListener('click', () => {
        let val = parseInt(input.value || '1', 10);
        if (val > 1) {
          input.value = val - 1;
          recalculateTotals();
        }
      });

      incBtn.addEventListener('click', () => {
        let val = parseInt(input.value || '1', 10);
        if (val < 20) {
          input.value = val + 1;
          recalculateTotals();
        }
      });
    }
  });

  // Handle Remove Item
  document.querySelectorAll('.btn-remove-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const row = btn.closest('.cart-row');
      if (row) {
        row.style.transition = 'all 0.3s ease';
        row.style.opacity = '0';
        row.style.transform = 'translateX(20px)';
        setTimeout(() => {
          row.remove();
          recalculateTotals();
          if (typeof showToast === 'function') {
            showToast('Item Removed', 'Food item removed from your cart.');
          }
        }, 300);
      }
    });
  });

  // Handle Coupon Application
  const applyCouponBtn = document.getElementById('btnApplyCoupon');
  const couponInput = document.getElementById('couponCodeInput');
  const couponFeedback = document.getElementById('couponFeedback');

  if (applyCouponBtn && couponInput) {
    applyCouponBtn.addEventListener('click', () => {
      const code = couponInput.value.trim().toUpperCase();
      if (!code) return;

      if (code === 'EXPRESS50' || code === 'FOODFIRST') {
        currentDiscount = 50;
        recalculateTotals();
        if (couponFeedback) {
          couponFeedback.innerHTML = '<span class="text-success"><i class="bi bi-check-circle-fill me-1"></i>Coupon applied! ₹50 OFF</span>';
        }
        if (typeof showToast === 'function') {
          showToast('Coupon Applied! 🎉', 'You saved ₹50 on this order.');
        }
      } else {
        if (couponFeedback) {
          couponFeedback.innerHTML = '<span class="text-danger"><i class="bi bi-x-circle-fill me-1"></i>Invalid coupon code. Try <strong>EXPRESS50</strong></span>';
        }
      }
    });
  }
});
