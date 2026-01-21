const express = require('express');
const { Pool } = require('pg');
const fetch = require('node-fetch'); // Asegúrate de tener node-fetch o usa el nativo en Node v18+

const app = express();
app.use(express.json());


// ==========================================
// 2. SERVICIO GENERADOR DE CÓDIGO
// Genera código de 8 dígitos, verifica email y llama webhook.
// ==========================================
app.post('/api/generate-code', async (req, res) => {
    const { userId } = req.body;

    if (!userId) {
        return res.status(400).json({ error: 'El ID de usuario es obligatorio' });
    }

    try {
        // A. Generar código de 8 dígitos
        const code = Math.floor(10000000 + Math.random() * 90000000).toString();

        // B. Verificar que existe y actualizar (Atomic Update)
        const query = `
      UPDATE users 
      SET verification_code = $1 
      WHERE id = $2 
      RETURNING email
    `;
        const result = await pool.query(query, [code, userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }

        const userEmail = result.rows[0].email;

        // C. Consumir Webhook para enviar correo (Simulación)
        // En un caso real, aquí harías fetch('https://tu-servicio-de-email.com/send', ...)
        await mockEmailWebhook(userEmail, code);

        res.json({
            message: 'Código generado y enviado al webhook',
            info: 'Revisa la consola del servidor para ver el código simulado'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al generar código' });
    }
});

// Iniciar servidor
const PORT = 3002;
app.listen(PORT, () => {
    console.log(`Servicios corriendo en http://localhost:${PORT}`);
});