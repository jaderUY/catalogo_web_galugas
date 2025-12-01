// Funcionalidades generales del frontend de Galugas

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar tooltips de Bootstrap
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Inicializar popovers
    var popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    var popoverList = popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });

    // Manejar formularios con confirmación
    const formsWithConfirm = document.querySelectorAll('form[data-confirm]');
    formsWithConfirm.forEach(form => {
        form.addEventListener('submit', function(e) {
            const message = this.getAttribute('data-confirm');
            if (!confirm(message)) {
                e.preventDefault();
            }
        });
    });

    // Mejorar la experiencia de búsqueda
    const searchInput = document.querySelector('input[name="q"]');
    if (searchInput) {
        // Autocompletado básico (podría extenderse con AJAX)
        searchInput.addEventListener('focus', function() {
            this.setAttribute('placeholder', 'Ej: iPhone, Samsung, Tablet...');
        });
        
        searchInput.addEventListener('blur', function() {
            this.setAttribute('placeholder', 'Buscar productos...');
        });
    }

    // Animaciones para cards de productos
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Manejar alertas automáticas
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        if (alert.classList.contains('alert-dismissible')) {
            setTimeout(() => {
                const bsAlert = new bootstrap.Alert(alert);
                bsAlert.close();
            }, 5000);
        }
    });

    // Contador para estadísticas en el hero
    function animateCounter(element, target, duration = 2000) {
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                element.textContent = target + '+';
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current) + '+';
            }
        }, 16);
    }

    // Animar contadores cuando son visibles
    const observerOptions = {
        threshold: 0.5
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counters = entry.target.querySelectorAll('.counter');
                counters.forEach(counter => {
                    const target = parseInt(counter.getAttribute('data-target'));
                    animateCounter(counter, target);
                });
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const statsSection = document.querySelector('.hero-section');
    if (statsSection) {
        observer.observe(statsSection);
    }

    // Mejorar formularios de contacto
    const contactForm = document.querySelector('form[action="/contact"]');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            const nombre = this.querySelector('input[name="nombre"]').value.trim();
            const email = this.querySelector('input[name="email"]').value.trim();
            const mensaje = this.querySelector('textarea[name="mensaje"]').value.trim();
            
            if (!nombre || !email || !mensaje) {
                e.preventDefault();
                alert('Por favor completa todos los campos requeridos.');
                return;
            }
            
            // Validación básica de email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                e.preventDefault();
                alert('Por favor ingresa un email válido.');
                return;
            }
        });
    }

    // Funcionalidad de filtros en catálogo
    const filterForm = document.querySelector('.filter-card form');
    if (filterForm) {
        const inputs = filterForm.querySelectorAll('input, select');
        inputs.forEach(input => {
            input.addEventListener('change', function() {
                // Podría agregarse aquí una búsqueda AJAX en lugar de recargar la página
                console.log('Filtro cambiado:', this.name, this.value);
            });
        });
    }

    // Smooth scroll para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Mejorar accesibilidad
    document.addEventListener('keydown', function(e) {
        // Atajos de teclado
        if (e.ctrlKey && e.key === '/') {
            e.preventDefault();
            const searchInput = document.querySelector('input[name="q"]');
            if (searchInput) {
                searchInput.focus();
            }
        }
    });

    // Cargar más productos (paginación infinita)
    let isLoading = false;
    let currentPage = 1;

    function loadMoreProducts() {
        if (isLoading) return;
        
        isLoading = true;
        currentPage++;
        
        // Simular carga de más productos
        setTimeout(() => {
            // Aquí iría una petición AJAX real
            console.log('Cargando página', currentPage);
            isLoading = false;
        }, 1000);
    }

    // Detectar cuando el usuario llega al final de la página
    window.addEventListener('scroll', function() {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
            loadMoreProducts();
        }
    });

    console.log('🚀 Galugas Frontend inicializado correctamente');
});

// Funciones utilitarias globales
const Galugas = {
    // Formatear precio
    formatPrice: (price) => {
        return new Intl.NumberFormat('es-ES', {
            style: 'currency',
            currency: 'USD'
        }).format(price);
    },
    
    // Validar email
    isValidEmail: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    // Mostrar notificación
    showNotification: (message, type = 'info') => {
        // Implementar notificaciones toast
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
};