// Sistema de preview para upload de imágenes en Galugas

class ImageUploadPreview {
    constructor() {
        this.init();
    }

    init() {
        this.bindEvents();
        this.initDropzones();
    }

    bindEvents() {
        // Inputs de archivo
        const fileInputs = document.querySelectorAll('input[type="file"][accept*="image"]');
        fileInputs.forEach(input => {
            input.addEventListener('change', (e) => this.handleFileSelect(e));
        });

        // Botones de eliminar
        const removeButtons = document.querySelectorAll('.remove-preview');
        removeButtons.forEach(button => {
            button.addEventListener('click', (e) => this.removePreview(e));
        });
    }

    initDropzones() {
        const dropzones = document.querySelectorAll('.image-preview-container');
        dropzones.forEach(dropzone => {
            dropzone.addEventListener('dragover', (e) => this.handleDragOver(e));
            dropzone.addEventListener('dragleave', (e) => this.handleDragLeave(e));
            dropzone.addEventListener('drop', (e) => this.handleDrop(e));
        });
    }

    handleFileSelect(event) {
        const input = event.target;
        const files = input.files;
        
        if (files.length > 0) {
            this.processFiles(files, input);
        }
    }

    handleDragOver(event) {
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.classList.add('drag-over');
    }

    handleDragLeave(event) {
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.classList.remove('drag-over');
    }

    handleDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        event.currentTarget.classList.remove('drag-over');
        
        const files = event.dataTransfer.files;
        const input = event.currentTarget.querySelector('input[type="file"]');
        
        if (files.length > 0) {
            input.files = files;
            this.processFiles(files, input);
        }
    }

    processFiles(files, input) {
        const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        const file = files[0];
        
        // Validar tipo de archivo
        if (!validImageTypes.includes(file.type)) {
            this.showError('Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP)');
            input.value = '';
            return;
        }
        
        // Validar tamaño (5MB máximo)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            this.showError('La imagen es demasiado grande. Tamaño máximo: 5MB');
            input.value = '';
            return;
        }
        
        // Mostrar preview
        this.showPreview(file, input);
    }

    showPreview(file, input) {
        const reader = new FileReader();
        const previewContainer = input.closest('.image-preview-container');
        const previewImg = previewContainer.querySelector('.image-preview');
        const noPreview = previewContainer.querySelector('.no-image-preview');
        const fileName = previewContainer.querySelector('.file-name');
        const fileSize = previewContainer.querySelector('.file-size');
        
        reader.onload = (e) => {
            // Ocultar "no preview"
            if (noPreview) noPreview.style.display = 'none';
            
            // Mostrar imagen
            previewImg.src = e.target.result;
            previewImg.style.display = 'block';
            
            // Mostrar información del archivo
            if (fileName) {
                fileName.textContent = file.name;
                fileName.style.display = 'block';
            }
            
            if (fileSize) {
                fileSize.textContent = this.formatFileSize(file.size);
                fileSize.style.display = 'block';
            }
            
            // Mostrar botón de eliminar
            const removeBtn = previewContainer.querySelector('.remove-preview');
            if (removeBtn) removeBtn.style.display = 'block';
            
            // Agregar clase de éxito
            previewContainer.classList.add('has-preview');
        };
        
        reader.onerror = () => {
            this.showError('Error al cargar la imagen');
        };
        
        reader.readAsDataURL(file);
    }

    removePreview(event) {
        if (event) event.preventDefault();
        
        const button = event?.target.closest('.remove-preview') || event;
        const previewContainer = button.closest('.image-preview-container');
        const previewImg = previewContainer.querySelector('.image-preview');
        const noPreview = previewContainer.querySelector('.no-image-preview');
        const fileName = previewContainer.querySelector('.file-name');
        const fileSize = previewContainer.querySelector('.file-size');
        const input = previewContainer.querySelector('input[type="file"]');
        
        // Resetear input
        if (input) input.value = '';
        
        // Ocultar preview
        if (previewImg) previewImg.style.display = 'none';
        
        // Mostrar "no preview"
        if (noPreview) noPreview.style.display = 'block';
        
        // Ocultar información del archivo
        if (fileName) fileName.style.display = 'none';
        if (fileSize) fileSize.style.display = 'none';
        
        // Ocultar botón de eliminar
        button.style.display = 'none';
        
        // Remover clase de éxito
        previewContainer.classList.remove('has-preview');
    }

    showError(message) {
        // Podría implementarse un sistema de notificaciones más elaborado
        alert(message);
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Método para pre-cargar imagen existente (para edición)
    loadExistingImage(imageUrl, container) {
        const previewContainer = container || document.querySelector('.image-preview-container');
        const previewImg = previewContainer.querySelector('.image-preview');
        const noPreview = previewContainer.querySelector('.no-image-preview');
        const removeBtn = previewContainer.querySelector('.remove-preview');
        
        if (previewImg && imageUrl) {
            noPreview.style.display = 'none';
            previewImg.src = imageUrl;
            previewImg.style.display = 'block';
            if (removeBtn) removeBtn.style.display = 'block';
            previewContainer.classList.add('has-preview');
        }
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    window.imageUploadPreview = new ImageUploadPreview();
    
    // Cargar imágenes existentes si las hay
    const existingImages = document.querySelectorAll('[data-existing-image]');
    existingImages.forEach(img => {
        const imageUrl = img.getAttribute('data-existing-image');
        const container = img.closest('.image-preview-container');
        if (imageUrl && container) {
            window.imageUploadPreview.loadExistingImage(imageUrl, container);
        }
    });
});