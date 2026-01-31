import { Cart } from './cart.js';

let orderData;

function displayOrderSummary() {
    const cart = Cart.getCart();
    const orderItems = document.getElementById('order-items');
    const subtotal = Cart.getTotalPrice();
    const shipping = 5.00;
    const total = subtotal + shipping;
    
    if (cart.length === 0) {
        window.location.href = 'cart.html';
        return;
    }
    
    orderItems.innerHTML = cart.map(item => `
        <div class="flex justify-between">
            <span>${item.name} x${item.quantity}</span>
            <span>$${(item.price * item.quantity).toFixed(2)}</span>
        </div>
    `).join('');
    
    document.getElementById('order-subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('order-total').textContent = `$${total.toFixed(2)}`;
    
    orderData = { cart, subtotal, shipping, total };
    return orderData;
}

async function handlePayPalCheckout(e) {
    e.preventDefault();
    
    const form = document.getElementById('shipping-form');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const shippingInfo = {
        name: document.getElementById('shipping-name').value.trim(),
        email: document.getElementById('shipping-email').value.trim(),
        phone: document.getElementById('shipping-phone').value.trim(),
        address: document.getElementById('shipping-address').value.trim(),
        city: document.getElementById('shipping-city').value.trim(),
        zip: document.getElementById('shipping-zip').value.trim()
    };
    
    const tempOrderId = 'order_' + Date.now();
    const orderToSave = {
        items: orderData.cart,
        shipping: shippingInfo,
        total: orderData.total,
        subtotal: orderData.subtotal,
        shippingCost: orderData.shipping,
        status: 'pending',
        tempOrderId: tempOrderId
    };
    
    localStorage.setItem('pending_order', JSON.stringify(orderToSave));
    
    let paypalConfig;
    try {
        paypalConfig = await import('./paypal-config.js');
    } catch(e) {
        const paypalInput = prompt('Enter your PayPal email or PayPal.me username to receive payments:');
        paypalConfig = { paypalEmail: paypalInput.trim() };
    }
    
    const amount = orderData.total.toFixed(2);
    const paypalEmail = paypalConfig.paypalEmail || paypalConfig.defaultPayPalEmail;
    const isEmail = paypalEmail.includes('@');
    
    if (isEmail) {
        const paypalLink = `https://www.paypal.com/send?amount=${amount}&currencyCode=USD&recipient=${encodeURIComponent(paypalEmail)}`;
        window.open(paypalLink, '_blank');
    } else {
        const paypalLink = `https://www.paypal.com/paypalme/${encodeURIComponent(paypalEmail)}/${amount}?locale.x=en_US`;
        window.open(paypalLink, '_blank');
    }
    
    const confirmed = confirm(`Opened PayPal in a new tab.\n\nPlease complete the payment of $${amount}.\n\nAfter payment, click OK to confirm your order.\n\nOrder ID: ${tempOrderId}`);
    if (confirmed) {
        completeOrder(orderToSave, tempOrderId);
    }
}

async function savePendingOrder(orderData) {
    try {
        const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js");
        const { getFirestore, collection, addDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js");
        const { firebaseConfig } = await import("./firebase-config.js");
        
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        
        await addDoc(collection(db, "orders"), {
            ...orderData,
            timestamp: serverTimestamp()
        });
    } catch(error) {
    }
}

function checkPayPalReturn() {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('orderId');
    const paymentStatus = urlParams.get('payment_status');
    
    if (orderId && paymentStatus === 'Completed') {
        const pendingOrder = JSON.parse(localStorage.getItem('pending_order') || '{}');
        if (pendingOrder.tempOrderId === orderId) {
            completeOrder(pendingOrder, orderId);
        }
    }
}

async function completeOrder(orderData, orderId) {
    try {
        const { initializeApp } = await import("https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js");
        const { getFirestore, collection, addDoc, serverTimestamp } = await import("https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js");
        const { firebaseConfig } = await import("./firebase-config.js");
        
        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);
        
        await addDoc(collection(db, "orders"), {
            ...orderData,
            payment: {
                id: orderId,
                status: 'completed',
                method: 'PayPal'
            },
            timestamp: serverTimestamp()
        });
        
        localStorage.removeItem('pending_order');
        Cart.clearCart();
        
        window.location.href = `order-success.html?orderId=${orderId}`;
    } catch(error) {
        localStorage.removeItem('pending_order');
        Cart.clearCart();
        window.location.href = 'preorder.html';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    displayOrderSummary();
    Cart.updateCartBadge();
    checkPayPalReturn();
    
    const paypalContainer = document.getElementById('paypal-button-container');
    paypalContainer.innerHTML = `
        <button onclick="handlePayPalCheckout(event)" class="w-full btn-primary text-center py-4 flex items-center justify-center gap-3">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.174 1.351 1.05 3.3.93 4.791v.006c-.11 1.316-.24 2.885-.24 2.885s.13 1.1.13 2.85c0 .78-.11 1.54-.24 2.16-.11.57-.24 1.07-.24 1.07s.05.38.07 1.04c.02.78.02 1.68.02 2.54 0 .84-.01 1.62-.02 2.4 0 .66-.05 1.04-.07 1.04s-.13-.5-.24-1.07c-.13-.62-.24-1.38-.24-2.16 0-1.75-.13-2.85-.13-2.85s.13-1.57.24-2.89v-.01c.12-1.49.24-3.44-.93-4.79-1.11-1.27-3.12-1.81-5.69-1.81H8.736c-.78 0-1.19.46-1.25 1.16l-.05.38c-.05.7-.38 1.16-1.16 1.16H5.78c-.78 0-1.19.46-1.25 1.16l-.05.38c-.05.7-.38 1.16-1.16 1.16H3.82c-.78 0-1.19.46-1.25 1.16l-.05.38c-.05.7-.38 1.16-1.16 1.16H1.86c-.78 0-1.19.46-1.25 1.16l-.05.38c-.05.7-.38 1.16-1.16 1.16H.9c-.78 0-1.19.46-1.25 1.16l-.05.38c-.05.7-.38 1.16-1.16 1.16v.01z"/>
            </svg>
            Pay with PayPal
        </button>
        <p class="text-sm text-gray-600 text-center mt-3">You'll be redirected to PayPal to log in and complete payment</p>
    `;
    
    window.handlePayPalCheckout = handlePayPalCheckout;
});
