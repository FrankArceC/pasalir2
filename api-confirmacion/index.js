const express = require('express');
const { Pool } = require('pg');
const fetch = require('node-fetch'); // Asegúrate de tener node-fetch o usa el nativo en Node v18+

const app = express();
app.use(express.json());

// CONFIGURACIÓN DE CONEXIÓN
// NOTA: Reemplaza 'password' con tu contraseña real de la base de datos
const connectionString = 'postgresql://postgres.gzsqgsdxcxdycewmqgtw:parvuk-9gyhqu-zumRos@aws-0-us-west-2.pooler.supabase.com:6543/postgres';

const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false } // Necesario para conexiones SSL de Supabase
});


// ==========================================
// 3. SERVICIO DE CONFIRMACIÓN
// Confirma con email y código.
// ==========================================
app.post('/api/confirm', async (req, res) => {
    const { email, code } = req.body;

    if (!email || !code) {
        return res.status(400).json({ error: 'Email y código son obligatorios' });
    }

    try {
        // Busca usuario con ese email y código.
        // Si encuentra, actualiza 'confirmed' a true.
        const query = `
      UPDATE users 
      SET confirmed = TRUE 
      WHERE email = $1 AND verification_code = $2 
      RETURNING id, confirmed
    `;

        const result = await pool.query(query, [email, code]);

        if (result.rows.length === 0) {
            return res.status(400).json({
                error: 'Falló la confirmación. El código es incorrecto o el email no coincide.'
            });
        }

        res.json({
            message: 'Cuenta confirmada exitosamente',
            status: 'confirmed'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al confirmar usuario' });
    }
});

// Iniciar servidor
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Servicios corriendo en http://localhost:${PORT}`);
});