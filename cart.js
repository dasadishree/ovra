// Shopping Cart Utility
export const Cart = {
    // Get cart from localStorage
    getCart() {
        const cart = localStorage.getItem('ovra_cart');
        return cart ? JSON.parse(cart) : [];
    },
    
    // Save cart to localStorage
    saveCart(cart) {
        localStorage.setItem('ovra_cart', JSON.stringify(cart));
        this.updateCartBadge();
    },
    
    // Add item to cart
    addItem(product) {
        const cart = this.getCart();
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += product.quantity || 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: product.quantity || 1
            });
        }
        
        this.saveCart(cart);
        return cart;
    },
    
    // Remove item from cart
    removeItem(productId) {
        const cart = this.getCart().filter(item => item.id !== productId);
        this.saveCart(cart);
        return cart;
    },
    
    // Update item quantity
    updateQuantity(productId, quantity) {
        const cart = this.getCart();
        const item = cart.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                return this.removeItem(productId);
            }
            item.quantity = quantity;
        }
        this.saveCart(cart);
        return cart;
    },
    
    // Get total items count
    getTotalItems() {
        return this.getCart().reduce((sum, item) => sum + item.quantity, 0);
    },
    
    // Get total price
    getTotalPrice() {
        return this.getCart().reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },
    
    // Clear cart
    clearCart() {
        localStorage.removeItem('ovra_cart');
        this.updateCartBadge();
    },
    
    // Update cart badge in navbar
    updateCartBadge() {
        const badge = document.getElementById('cart-badge');
        const count = this.getTotalItems();
        if (badge) {
            if (count > 0) {
                badge.textContent = count;
                badge.classList.remove('hidden');
            } else {
                badge.classList.add('hidden');
            }
        }
    }
};

// Initialize cart badge on page load
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        Cart.updateCartBadge();
    });
}
