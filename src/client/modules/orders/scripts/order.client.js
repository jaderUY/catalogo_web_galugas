// Cargar resumen del carrito en checkout
async function loadCartSummary() {
    const token = localStorage.getItem('token');
    if (!token) return;
    const res = await fetch('/api/cart', { headers: { 'Authorization': `Bearer ${token}` } });
    const cart = await res.json();
    const container = document.getElementById('cartSummary');
    if (!container) return;
    if (cart.length === 0) {
        container.innerHTML = '<div class="alert alert-warning">No hay productos en el carrito. <a href="/products">Ir al catálogo</a></div>';
        return;
    }
    let total = 0;
    let html = '<ul class="list-group">';
    cart.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        html += `<li class="list-group-item d-flex justify-content-between">
                    ${item.nombre} x ${item.cantidad}
                    <span>$${subtotal.toLocaleString('es-CO')}</span>
                </li>`;
    });
    html += `<li class="list-group-item active d-flex justify-content-between">
                Total: <span>$${total.toLocaleString('es-CO')}</span>
            </li></ul>`;
    container.innerHTML = html;
}

// Enviar pedido
const checkoutForm = document.getElementById('checkoutForm');
if (checkoutForm) {
    checkoutForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = localStorage.getItem('token');
        const direccion_envio = document.getElementById('direccion_envio').value;
        try {
            const res = await fetch('/api/orders/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ direccion_envio })
            });
            const data = await res.json();
            if (res.ok) {
                alert(`Pedido realizado con éxito. Número: ${data.pedido_id}`);
                window.location.href = '/orders';
            } else {
                throw new Error(data.message);
            }
        } catch (err) {
            alert(err.message);
        }
    });
}

// Cargar historial de pedidos
async function loadOrders() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
        return;
    }
    const res = await fetch('/api/orders', { headers: { 'Authorization': `Bearer ${token}` } });
    const orders = await res.json();
    const container = document.getElementById('ordersList');
    if (!container) return;
    if (orders.length === 0) {
        container.innerHTML = '<p>No has realizado ningún pedido aún.</p>';
        return;
    }
    let html = '';
    orders.forEach(order => {
        let detallesHtml = '';
        if (order.detalles) {
            const detalles = JSON.parse(order.detalles);
            detallesHtml = '<ul>';
            detalles.forEach(d => {
                detallesHtml += `<li>${d.nombre} x ${d.cantidad} - $${parseFloat(d.precio).toLocaleString('es-CO')}</li>`;
            });
            detallesHtml += '</ul>';
        }
        html += `
            <div class="card mb-3">
                <div class="card-header">
                    Pedido #${order.pedido_id} - ${new Date(order.fecha).toLocaleString()} - Estado: ${order.estado}
                </div>
                <div class="card-body">
                    <p><strong>Total:</strong> $${parseFloat(order.total).toLocaleString('es-CO')}</p>
                    <p><strong>Dirección de envío:</strong> ${order.direccion_envio || 'No especificada'}</p>
                    <h6>Productos:</h6>
                    ${detallesHtml}
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

if (document.getElementById('cartSummary')) loadCartSummary();
if (document.getElementById('ordersList')) loadOrders();