// Cargar productos en la página de listado
async function loadProducts(filters = {}) {
    const queryParams = new URLSearchParams(filters).toString();
    const res = await fetch(`/api/products?${queryParams}`);
    const products = await res.json();
    const container = document.getElementById('productsList');
    if (!container) return;
    if (products.length === 0) {
        container.innerHTML = '<div class="col-12"><p class="text-center">No se encontraron productos.</p></div>';
        return;
    }
    container.innerHTML = products.map(p => `
        <div class="col-md-4 mb-4">
            <div class="card h-100">
                <img src="${p.pathFoto || '/images/placeholder.png'}" class="card-img-top" alt="${p.nombre}" style="height: 200px; object-fit: contain;">
                <div class="card-body">
                    <h5 class="card-title">${p.nombre}</h5>
                    <p class="card-text">Marca: ${p.marca}<br>Precio: $${parseFloat(p.precio).toLocaleString('es-CO')}</p>
                    <a href="/products/${p.dispositivo_id}" class="btn btn-primary">Ver detalle</a>
                </div>
            </div>
        </div>
    `).join('');
}

// Cargar marcas para el filtro
async function loadBrands() {
    const res = await fetch('/api/products/brands');
    const brands = await res.json();
    const brandSelect = document.getElementById('brandFilter');
    if (brandSelect) {
        brands.forEach(b => {
            const option = document.createElement('option');
            option.value = b.marca_id;
            option.textContent = b.nombre;
            brandSelect.appendChild(option);
        });
    }
}

// Aplicar filtros
function initFilters() {
    const applyBtn = document.getElementById('applyFilters');
    if (applyBtn) {
        applyBtn.addEventListener('click', () => {
            const filters = {
                categoria_id: document.getElementById('categoryFilter').value,
                marca_id: document.getElementById('brandFilter').value,
                search: document.getElementById('searchInput').value,
                minPrice: document.getElementById('minPrice').value,
                maxPrice: document.getElementById('maxPrice').value
            };
            // Eliminar vacíos
            Object.keys(filters).forEach(k => !filters[k] && delete filters[k]);
            loadProducts(filters);
        });
    }
}

// Agregar al carrito (página detalle)
const addBtn = document.getElementById('addToCartBtn');
if (addBtn) {
    addBtn.addEventListener('click', async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
            return;
        }
        const dispositivo_id = addBtn.dataset.id;
        const cantidad = document.getElementById('quantity').value;
        try {
            const res = await fetch('/api/cart/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ dispositivo_id, cantidad: parseInt(cantidad) })
            });
            const data = await res.json();
            const msgDiv = document.getElementById('cartMessage');
            if (res.ok) {
                msgDiv.className = 'alert alert-success mt-3';
                msgDiv.textContent = 'Producto agregado al carrito';
                // Actualizar contador del navbar
                window.dispatchEvent(new Event('cartUpdated'));
            } else {
                throw new Error(data.message);
            }
            msgDiv.classList.remove('d-none');
            setTimeout(() => msgDiv.classList.add('d-none'), 3000);
        } catch (err) {
            const msgDiv = document.getElementById('cartMessage');
            msgDiv.className = 'alert alert-danger mt-3';
            msgDiv.textContent = err.message;
            msgDiv.classList.remove('d-none');
        }
    });
}

// Cargar datos iniciales
if (document.getElementById('productsList')) {
    loadProducts();
    loadBrands();
    initFilters();
}