import { Cart } from './cart.js';

function displayCart() {
    const cart = Cart.getCart();
    const cartItems = document.getElementById('cart-items');
    const emptyCart = document.getElementById('empty-cart');
    const cartSummary = document.getElementById('cart-summary');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (cart.length === 0) {
        cartItems.classList.add('hidden');
        emptyCart.classList.remove('hidden');
        cartSummary.classList.add('hidden');
        return;
    }
    
    cartItems.classList.remove('hidden');
    emptyCart.classList.add('hidden');
    cartSummary.classList.remove('hidden');
    
    cartItems.innerHTML = cart.map(item => `
        <div class="bg-white/60 backdrop-blur-sm rounded-3xl p-4 md:p-6 border border-gray-200/50 shadow-lg flex flex-col md:flex-row gap-4">
            <div class="w-full md:w-32 h-32 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0">
                <img src="${item.image || 'logo.png'}" alt="${item.name}" class="w-full h-full object-cover">
            </div>
            <div class="flex-1">
                <h3 class="text-xl md:text-2xl font-bold mb-2">${item.name}</h3>
                <p class="text-gray-600 mb-4">$${item.price.toFixed(2)} each</p>
                <div class="flex items-center gap-4">
                    <label class="text-sm font-semibold">Quantity:</label>
                    <div class="flex items-center gap-2">
                        <button onclick="updateQuantity('${item.id}', ${item.quantity - 1})" class="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-pink-500 flex items-center justify-center">-</button>
                        <span class="w-12 text-center font-bold">${item.quantity}</span>
                        <button onclick="updateQuantity('${item.id}', ${item.quantity + 1})" class="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-pink-500 flex items-center justify-center">+</button>
                    </div>
                    <button onclick="removeItem('${item.id}')" class="text-red-500 hover:text-red-700 text-sm font-semibold ml-auto">Remove</button>
                </div>
            </div>
            <div class="text-right">
                <p class="text-xl font-bold text-[#f5576c]">$${(item.price * item.quantity).toFixed(2)}</p>
            </div>
        </div>
    `).join('');
    
    document.getElementById('cart-total').textContent = `$${Cart.getTotalPrice().toFixed(2)}`;
}

window.updateQuantity = function(productId, quantity) {
    Cart.updateQuantity(productId, quantity);
    displayCart();
    Cart.updateCartBadge();
};

window.removeItem = function(productId) {
    Cart.removeItem(productId);
    displayCart();
    Cart.updateCartBadge();
};

document.addEventListener('DOMContentLoaded', () => {
    displayCart();
    Cart.updateCartBadge();
});
