async function loadCart() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login';
        return;
    }
    const res = await fetch('/api/cart', {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const cart = await res.json();
    const container = document.getElementById('cartContainer');
    if (cart.length === 0) {
        container.innerHTML = '<div class="alert alert-info">Tu carrito está vacío.</div>';
        document.getElementById('checkoutBtn').style.display = 'none';
        return;
    }
    let total = 0;
    let html = `<table class="table table-bordered">
        <thead>
            <tr><th>Producto</th><th>Precio</th><th>Cantidad</th><th>Subtotal</th><th></th></tr>
        </thead>
        <tbody>`;
    cart.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        html += `
            <tr>
                <td><img src="${item.pathFoto || '/images/placeholder.png'}" width="50"> ${item.nombre}</td>
                <td>$${parseFloat(item.precio).toLocaleString('es-CO')}</td>
                <td>
                    <input type="number" class="form-control qty-input" data-id="${item.carrito_id}" value="${item.cantidad}" min="1" style="width:80px">
                </td>
                <td>$${subtotal.toLocaleString('es-CO')}</td>
                <td><button class="btn btn-danger btn-sm remove-item" data-id="${item.carrito_id}">Eliminar</button></td>
            </tr>
        `;
    });
    html += `</tbody>
        <tfoot>
            <tr><th colspan="3" class="text-end">Total:</th><th colspan="2">$${total.toLocaleString('es-CO')}</th></tr>
        </tfoot>
    </table>`;
    container.innerHTML = html;

    // Eventos de cantidad
    document.querySelectorAll('.qty-input').forEach(input => {
        input.addEventListener('change', async (e) => {
            const carrito_id = e.target.dataset.id;
            const cantidad = e.target.value;
            const token = localStorage.getItem('token');
            await fetch(`/api/cart/${carrito_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ cantidad })
            });
            loadCart();
            window.dispatchEvent(new Event('cartUpdated'));
        });
    });
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const carrito_id = btn.dataset.id;
            const token = localStorage.getItem('token');
            await fetch(`/api/cart/${carrito_id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            loadCart();
            window.dispatchEvent(new Event('cartUpdated'));
        });
    });
}

document.addEventListener('DOMContentLoaded', loadCart);
window.addEventListener('cartUpdated', loadCart);