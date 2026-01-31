export const Cart = {
    getCart() {
        const cart = localStorage.getItem('ovra_cart');
        return cart ? JSON.parse(cart) : [];
    },
    
    saveCart(cart) {
        localStorage.setItem('ovra_cart', JSON.stringify(cart));
        this.updateCartBadge();
    },
    
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
    
    removeItem(productId) {
        const cart = this.getCart().filter(item => item.id !== productId);
        this.saveCart(cart);
        return cart;
    },
    
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
    
    getTotalItems() {
        return this.getCart().reduce((sum, item) => sum + item.quantity, 0);
    },
    
    getTotalPrice() {
        return this.getCart().reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },
    
    clearCart() {
        localStorage.removeItem('ovra_cart');
        this.updateCartBadge();
    },
    
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

if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        Cart.updateCartBadge();
    });
}
