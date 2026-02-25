// ============================================
// VARIABLES GLOBALES
// ============================================

let products = [];
let whatsappNumber = '';
let cart = {};

// ============================================
// ELEMENTOS DEL DOM
// ============================================

const productsGrid = document.getElementById('productsGrid');
const summaryItems = document.getElementById('summaryItems');
const totalAmount = document.getElementById('totalAmount');
const mobileTotalAmount = document.getElementById('mobileTotalAmount');
const whatsappBtn = document.getElementById('whatsappBtn');
const whatsappBtnMobile = document.getElementById('whatsappBtnMobile');
const clearCartBtn = document.getElementById('clearCartBtn');
const emptyCartMessage = document.getElementById('emptyCartMessage');

// ============================================
// CARGAR DATOS DESDE products.json
// ============================================

async function loadProducts() {
    try {
        const response = await fetch('products.json');
        if (!response.ok) {
            throw new Error('Error cargando products.json');
        }
        const data = await response.json();
        
        // Cargar número de WhatsApp
        whatsappNumber = data.whatsappNumber;
        
        // Cargar solo productos activos
        products = data.products.filter(p => p.active === true);
        
        // Renderizar productos
        renderProducts();
        updateSummary();
    } catch (error) {
        console.error('Error:', error);
        productsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; color: #E94FA3; padding: 2rem;">
                <p>Error cargando productos. Verifica que existe el archivo <strong>products.json</strong></p>
                <p style="font-size: 0.9rem; color: #999; margin-top: 0.5rem;">${error.message}</p>
            </div>
        `;
    }
}

// ============================================
// RENDERIZAR PRODUCTOS
// ============================================

function renderProducts() {
    productsGrid.innerHTML = '';

    if (products.length === 0) {
        productsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #999;">No hay productos disponibles</p>';
        return;
    }

    products.forEach(product => {
        const quantity = cart[product.id] || 0;
        const subtotal = product.price * quantity;

        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img 
                src="${product.image}" 
                alt="${product.name}" 
                class="product-image" 
                onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22280%22 height=%22240%22%3E%3Crect fill=%22%23f5f5f5%22 width=%22280%22 height=%22240%22/%3E%3Ctext x=%2250%25%22 y=%2250%25%22 font-size=%2214%22 fill=%22%23999%22 text-anchor=%22middle%22 dy=%22.3em%22%3EImagen no disponible%3C/text%3E%3C/svg%3E'"
            >
            <div class="product-content">
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-price">${formatPrice(product.price)}</div>
                
                <div class="product-controls">
                    <button class="quantity-btn" onclick="decreaseQuantity(${product.id})" ${quantity === 0 ? 'disabled' : ''}>−</button>
                    <input 
                        type="number" 
                        class="quantity-input" 
                        value="${quantity}" 
                        min="0" 
                        max="999" 
                        onchange="setQuantity(${product.id}, this.value)"
                    >
                    <button class="quantity-btn" onclick="increaseQuantity(${product.id})">+</button>
                </div>
                
                ${quantity > 0 ? `
                    <div class="product-subtotal">
                        Subtotal: <span class="product-subtotal-amount">${formatPrice(subtotal)}</span>
                    </div>
                ` : ''}
            </div>
        `;

        productsGrid.appendChild(card);
    });
}

// ============================================
// FUNCIONES DE CANTIDAD
// ============================================

function increaseQuantity(productId) {
    const currentQty = cart[productId] || 0;
    if (currentQty < 999) {
        cart[productId] = currentQty + 1;
        updateSummary();
    }
}

function decreaseQuantity(productId) {
    const currentQty = cart[productId] || 0;
    if (currentQty > 0) {
        cart[productId] = currentQty - 1;
        if (cart[productId] === 0) {
            delete cart[productId];
        }
        updateSummary();
    }
}

function setQuantity(productId, value) {
    let qty = parseInt(value) || 0;

    // Validar rango
    if (qty < 0) qty = 0;
    if (qty > 999) qty = 999;

    if (qty === 0) {
        delete cart[productId];
    } else {
        cart[productId] = qty;
    }

    updateSummary();
}

// ============================================
// ACTUALIZAR RESUMEN
// ============================================

function updateSummary() {
    renderProducts();
    updateSummaryItems();
    updateTotal();
    updateButtons();
}

function updateSummaryItems() {
    summaryItems.innerHTML = '';

    let hasItems = false;

    products.forEach(product => {
        const quantity = cart[product.id];
        if (quantity && quantity > 0) {
            hasItems = true;
            const subtotal = product.price * quantity;

            const item = document.createElement('div');
            item.className = 'summary-item';
            item.innerHTML = `
                <span class="summary-item-name">${product.name}</span>
                <span class="summary-item-qty">x${quantity}</span>
                <span class="summary-item-price">${formatPrice(subtotal)}</span>
            `;

            summaryItems.appendChild(item);
        }
    });

    if (!hasItems) {
        summaryItems.innerHTML = '<p class="empty-cart-message">Sin productos seleccionados</p>';
    }
}

function updateTotal() {
    const total = calculateTotal();
    const formattedTotal = formatPrice(total);

    totalAmount.textContent = formattedTotal;
    mobileTotalAmount.textContent = formattedTotal;
}

function calculateTotal() {
    return products.reduce((sum, product) => {
        const quantity = cart[product.id] || 0;
        return sum + (product.price * quantity);
    }, 0);
}

function updateButtons() {
    const hasItems = Object.values(cart).some(qty => qty > 0);

    whatsappBtn.disabled = !hasItems;
    whatsappBtnMobile.disabled = !hasItems;

    if (hasItems) {
        emptyCartMessage.style.display = 'none';
    } else {
        emptyCartMessage.style.display = 'block';
    }
}

// ============================================
// FUNCIONES DE FORMATO
// ============================================

function formatPrice(price) {
    return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(price);
}

function generateWhatsAppMessage() {
    let message = 'Hola! Quiero hacer este pedido en Didactiland:\n\n';

    products.forEach(product => {
        const quantity = cart[product.id];
        if (quantity && quantity > 0) {
            const subtotal = product.price * quantity;
            message += `• ${product.name} x${quantity} = ${formatPrice(subtotal)}\n`;
        }
    });

    const total = calculateTotal();
    message += `\nTotal: ${formatPrice(total)}\n\n¡Gracias!`;

    return message;
}

// ============================================
// ENVIAR A WHATSAPP
// ============================================

function sendToWhatsApp() {
    const hasItems = Object.values(cart).some(qty => qty > 0);

    if (!hasItems) {
        alert('Seleccioná al menos un producto');
        return;
    }

    if (!whatsappNumber) {
        alert('Error: Número de WhatsApp no configurado');
        return;
    }

    const message = generateWhatsAppMessage();
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');
}

// ============================================
// VACIAR CARRITO
// ============================================

function clearCart() {
    cart = {};
    updateSummary();
}

// ============================================
// EVENT LISTENERS
// ============================================

whatsappBtn.addEventListener('click', sendToWhatsApp);
whatsappBtnMobile.addEventListener('click', sendToWhatsApp);
clearCartBtn.addEventListener('click', clearCart);

// Permitir enviar con Enter en inputs de cantidad
document.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && e.target.classList.contains('quantity-input')) {
        e.target.blur();
    }
});

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    loadProducts();
});
