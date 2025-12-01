// Funcionalidades específicas del panel de administración de Galugas

class GalugasAdmin {
    constructor() {
        this.init();
    }

    init() {
        this.initSidebar();
        this.initDataTables();
        this.initImageUpload();
        this.initConfirmations();
        this.initFilters();
        this.initStatsUpdater();
    }

    // Sidebar mobile toggle
    initSidebar() {
        const sidebarToggle = document.querySelector('.sidebar-toggle');
        const sidebar = document.querySelector('.sidebar');
        const sidebarOverlay = document.querySelector('.sidebar-overlay');

        if (sidebarToggle && sidebar) {
            sidebarToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
                if (sidebarOverlay) {
                    sidebarOverlay.classList.toggle('active');
                }
            });
        }

        if (sidebarOverlay) {
            sidebarOverlay.addEventListener('click', () => {
                sidebar.classList.remove('active');
                sidebarOverlay.classList.remove('active');
            });
        }
    }

    // Inicializar tablas de datos
    initDataTables() {
        const tables = document.querySelectorAll('.table');
        tables.forEach(table => {
            this.enhanceTable(table);
        });
    }

    // Mejorar funcionalidad de tablas
    enhanceTable(table) {
        // Ordenamiento básico
        const headers = table.querySelectorAll('th[data-sort]');
        headers.forEach(header => {
            header.style.cursor = 'pointer';
            header.addEventListener('click', () => {
                this.sortTable(table, header.cellIndex);
            });
        });

        // Búsqueda en tabla
        const searchInput = table.parentElement.querySelector('.table-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterTable(table, e.target.value);
            });
        }
    }

    // Ordenar tabla
    sortTable(table, columnIndex) {
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        const isNumeric = !isNaN(parseFloat(rows[0]?.cells[columnIndex]?.textContent));

        rows.sort((a, b) => {
            const aValue = a.cells[columnIndex].textContent;
            const bValue = b.cells[columnIndex].textContent;

            if (isNumeric) {
                return parseFloat(aValue) - parseFloat(bValue);
            } else {
                return aValue.localeCompare(bValue);
            }
        });

        // Limpiar y reinsertar filas ordenadas
        while (tbody.firstChild) {
            tbody.removeChild(tbody.firstChild);
        }
        rows.forEach(row => tbody.appendChild(row));
    }

    // Filtrar tabla
    filterTable(table, searchTerm) {
        const tbody = table.querySelector('tbody');
        const rows = tbody.querySelectorAll('tr');
        const searchLower = searchTerm.toLowerCase();

        rows.forEach(row => {
            const text = row.textContent.toLowerCase();
            row.style.display = text.includes(searchLower) ? '' : 'none';
        });
    }

    // Upload de imágenes con preview
    initImageUpload() {
        const imageInputs = document.querySelectorAll('input[type="file"][accept^="image/"]');
        
        imageInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    this.handleImagePreview(input, file);
                }
            });
        });

        // Botones para eliminar preview
        const removeButtons = document.querySelectorAll('.remove-image-preview');
        removeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.removeImagePreview(button);
            });
        });
    }

    // Manejar preview de imagen
    handleImagePreview(input, file) {
        const reader = new FileReader();
        const previewContainer = input.closest('.image-preview-container');
        const previewImg = previewContainer?.querySelector('.image-preview');
        const noPreview = previewContainer?.querySelector('.no-image-preview');

        reader.onload = (e) => {
            if (noPreview) noPreview.style.display = 'none';
            if (previewImg) {
                previewImg.src = e.target.result;
                previewImg.style.display = 'block';
            }
        };
        
        reader.readAsDataURL(file);
    }

    // Eliminar preview de imagen
    removeImagePreview(button) {
        const previewContainer = button.closest('.image-preview-container');
        const previewImg = previewContainer?.querySelector('.image-preview');
        const noPreview = previewContainer?.querySelector('.no-image-preview');
        const fileInput = previewContainer?.querySelector('input[type="file"]');
        
        if (fileInput) fileInput.value = '';
        if (previewImg) previewImg.style.display = 'none';
        if (noPreview) noPreview.style.display = 'block';
    }

    // Confirmaciones para acciones destructivas
    initConfirmations() {
        // Botones de eliminar
        const deleteButtons = document.querySelectorAll('.btn-delete, form[action*="eliminar"] button');
        deleteButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                if (!confirm('¿Estás seguro de que quieres eliminar este elemento? Esta acción no se puede deshacer.')) {
                    e.preventDefault();
                }
            });
        });

        // Formularios con confirmación
        const confirmForms = document.querySelectorAll('form[data-confirm]');
        confirmForms.forEach(form => {
            form.addEventListener('submit', (e) => {
                const message = form.getAttribute('data-confirm');
                if (!confirm(message)) {
                    e.preventDefault();
                }
            });
        });
    }

    // Filtros dinámicos
    initFilters() {
        const filterForms = document.querySelectorAll('.admin-filters form');
        filterForms.forEach(form => {
            const inputs = form.querySelectorAll('input, select');
            inputs.forEach(input => {
                input.addEventListener('change', () => {
                    // Enviar formulario automáticamente
                    form.submit();
                });
            });
        });
    }

    // Actualizador de estadísticas en tiempo real
    initStatsUpdater() {
        // Actualizar cada 30 segundos si estamos en el dashboard
        if (window.location.pathname === '/admin') {
            setInterval(() => {
                this.updateStats();
            }, 30000);
        }
    }

    // Actualizar estadísticas via AJAX
    async updateStats() {
        try {
            const response = await fetch('/api/dispositivos/estadisticas');
            const data = await response.json();
            
            if (data.success) {
                this.updateStatsDisplay(data.data);
            }
        } catch (error) {
            console.error('Error actualizando estadísticas:', error);
        }
    }

    // Actualizar display de estadísticas
    updateStatsDisplay(stats) {
        // Actualizar números en las cards de stats
        const statNumbers = document.querySelectorAll('.stat-number');
        statNumbers.forEach(stat => {
            // Aquí se actualizarían los números según los datos recibidos
            console.log('Actualizando estadísticas:', stats);
        });
    }

    // Exportar datos
    initExportButtons() {
        const exportButtons = document.querySelectorAll('.btn-export');
        exportButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.exportData(button.dataset.exportType);
            });
        });
    }

    // Exportar datos
    async exportData(type) {
        try {
            const response = await fetch(`/admin/logs/exportar?type=${type}`);
            const blob = await response.blob();
            
            // Descargar archivo
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `galugas_${type}_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
        } catch (error) {
            console.error('Error exportando datos:', error);
            alert('Error al exportar los datos');
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.galugasAdmin = new GalugasAdmin();
    
    // Inicializar tooltips de Bootstrap
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Inicializar modales de confirmación
    const confirmationModals = document.querySelectorAll('.confirm-modal');
    confirmationModals.forEach(modal => {
        modal.addEventListener('show.bs.modal', function (event) {
            const button = event.relatedTarget;
            const form = modal.querySelector('form');
            if (form && button.dataset.formAction) {
                form.action = button.dataset.formAction;
            }
        });
    });

    console.log('🎯 Galugas Admin inicializado correctamente');
});