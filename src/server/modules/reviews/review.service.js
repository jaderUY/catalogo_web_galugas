const pool = require('../../config/db');
const createReview = async (usuario_id, dispositivo_id, calificacion, comentario) => {
    await pool.query(
        `INSERT INTO resena (fechaResena, calificacion, comentario, dispositivo_id, usuario_id)
         VALUES (NOW(), ?, ?, ?, ?)`,
        [calificacion, comentario, dispositivo_id, usuario_id]
    );
};
const getReviewsByProduct = async (dispositivo_id) => {
    const [rows] = await pool.query(`
        SELECT r.*, u.primer_nombre, u.primer_apellido
        FROM resena r
        JOIN usuario u ON r.usuario_id = u.usuario_id
        WHERE r.dispositivo_id = ?
        ORDER BY r.fechaResena DESC
    `, [dispositivo_id]);
    return rows;
};
module.exports = { createReview, getReviewsByProduct };