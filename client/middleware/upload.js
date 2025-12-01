const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Asegurar que el directorio de uploads existe
const uploadDir = path.join(__dirname, '../public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de almacenamiento
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generar nombre único para el archivo
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        const filename = 'device-' + uniqueSuffix + extension;
        cb(null, filename);
    }
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
    // Verificar que sea una imagen
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos de imagen (JPEG, PNG, GIF, WebP)'), false);
    }
};

// Configuración de multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB máximo
    },
    fileFilter: fileFilter
});

// Middleware para manejar errores de upload
const handleUploadErrors = (error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                error: 'El archivo es demasiado grande. Tamaño máximo: 5MB'
            });
        }
        
        if (error.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                error: 'Demasiados archivos. Solo se permite 1 archivo por vez'
            });
        }
        
        if (error.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                error: 'Campo de archivo inesperado'
            });
        }
    }
    
    if (error) {
        return res.status(400).json({
            error: error.message
        });
    }
    
    next();
};

// Middlewares preconfigurados
const uploadSingle = (fieldName = 'imagen') => upload.single(fieldName);
const uploadMultiple = (fieldName = 'imagenes', maxCount = 5) => upload.array(fieldName, maxCount);

module.exports = {
    upload,
    uploadSingle,
    uploadMultiple,
    handleUploadErrors
};