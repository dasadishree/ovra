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
        <div class="bg-white/60 backdrop-blur-sm rounded-2xl md:rounded-3xl p-4 sm:p-6 border border-gray-200/50 shadow-lg">
            <div class="flex flex-col sm:flex-row gap-4">
                <div class="w-full sm:w-20 md:w-24 lg:w-32 h-20 sm:h-24 md:h-32 bg-gray-100 rounded-xl md:rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img src="${item.image || 'logo.png'}" alt="${item.name}" class="w-full h-full object-cover">
                </div>
                <div class="flex-1 min-w-0">
                    <div class="flex justify-between items-start mb-2">
                        <h3 class="text-lg sm:text-xl md:text-2xl font-bold pr-2">${item.name}</h3>
                        <p class="text-lg sm:text-xl font-bold text-[#f5576c] flex-shrink-0">$${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                    <p class="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4">$${item.price.toFixed(2)} each</p>
                    <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                        <div class="flex items-center gap-3">
                            <label class="text-xs sm:text-sm font-semibold">Quantity:</label>
                            <div class="flex items-center gap-2">
                                <button onclick="updateQuantity('${item.id}', ${item.quantity - 1})" class="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-gray-300 hover:border-pink-500 flex items-center justify-center text-sm sm:text-base">-</button>
                                <span class="w-10 sm:w-12 text-center font-bold text-sm sm:text-base">${item.quantity}</span>
                                <button onclick="updateQuantity('${item.id}', ${item.quantity + 1})" class="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-gray-300 hover:border-pink-500 flex items-center justify-center text-sm sm:text-base">+</button>
                            </div>
                        </div>
                        <button onclick="removeItem('${item.id}')" class="text-red-500 hover:text-red-700 text-xs sm:text-sm font-semibold sm:ml-auto">Remove</button>
                    </div>
                </div>
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
