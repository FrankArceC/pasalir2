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
// 1. SERVICIO DE REGISTRO
// Registra usuario y correo. Regresa el ID.
// ==========================================
app.post('/api/register', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'El email es obligatorio' });
    }

    try {
        const query = 'INSERT INTO users (email) VALUES ($1) RETURNING id';
        const result = await pool.query(query, [email]);

        res.status(201).json({
            message: 'Usuario registrado exitosamente',
            userId: result.rows[0].id
        });
    } catch (error) {
        console.error(error);
        if (error.code === '23505') { // Código de error de Postgres para valor duplicado
            return res.status(409).json({ error: 'El correo ya está registrado' });
        }
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});



// Iniciar servidor
const PORT = 3006;
app.listen(PORT, () => {
    console.log(`Servicios corriendo en http://localhost:${PORT}`);
});