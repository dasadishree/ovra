import { Cart } from './cart.js';

const products = [
    {
        id: 'pad-regular',
        name: 'Regular Pads',
        price: 12.99,
        image: 'logo.png',
        description: 'Comfortable and absorbent regular flow pads'
    },
    {
        id: 'pad-heavy',
        name: 'Heavy Flow Pads',
        price: 14.99,
        image: 'logo.png',
        description: 'Extra absorbent pads for heavy flow days'
    },
    {
        id: 'pad-light',
        name: 'Light Pads',
        price: 10.99,
        image: 'logo.png',
        description: 'Lightweight pads for light flow days'
    }
];

// products
function displayProducts() {
    const grid = document.getElementById('products-grid');
    if (!grid) return;
    
    grid.innerHTML = products.map(product => `
        <div class="bg-white/60 backdrop-blur-sm rounded-2xl md:rounded-3xl p-4 sm:p-6 md:p-8 border border-gray-200/50 shadow-xl hover:shadow-2xl transition-shadow">
            <div class="h-28 sm:h-40 md:h-48 lg:h-64 mb-3 md:mb-4 bg-gray-100 rounded-xl md:rounded-2xl flex items-center justify-center overflow-hidden">
                <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover">
            </div>
            <h3 class="text-xl sm:text-2xl md:text-3xl font-bold mb-1 md:mb-2">${product.name}</h3>
            <p class="text-sm sm:text-base text-gray-600 mb-3 md:mb-4">${product.description}</p>
            <div class="flex items-center justify-between mb-3 md:mb-4">
                <span class="text-xl sm:text-2xl md:text-3xl font-bold text-[#f5576c]">$${product.price.toFixed(2)}</span>
            </div>
            <button 
                onclick="addToCart('${product.id}', event)" 
                class="w-full btn-primary text-sm sm:text-base md:text-lg px-4 sm:px-6 py-2.5 sm:py-3 mt-2 md:mt-4"
            >
                Add to Cart
            </button>
        </div>
    `).join('');
}

//add to cart
window.addToCart = function(productId, event) {
    const product = products.find(p => p.id === productId);
    if (!product) {
        return;
    }
    
    try {
        Cart.addItem(product);        
        const btn = event ? event.target : document.querySelector(`button[onclick*="${productId}"]`);
        if (btn) {
            const originalText = btn.textContent;
            btn.textContent = 'Added!';
            btn.disabled = true;
            
            setTimeout(() => {
                btn.textContent = originalText;
                btn.disabled = false;
            }, 1000);
        }
    } catch(error) {
    }
};

document.addEventListener('DOMContentLoaded', () => {
    displayProducts();
    Cart.updateCartBadge();
});
