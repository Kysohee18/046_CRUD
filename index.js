const express = require('express');
const { Pool } = require('pg');

//web server initialisasi
const app = express();
const port = 5000;


const pool = new Pool({
    user: 'postgres',                   
    host: 'localhost',
    database: 'mahasiswa',
    password: 'Magelang2005', 
    port: 5432,
    max: 10,
    idleTimeoutMillis: 30000,
});


pool.on('connect', () => {
    console.log('Koneksi Pool ke PostgreSQL berhasil distabilkan.');
});

// 3. Middleware 
app.use(express.json());

// get api
app.get('/', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, nama, nim, kelas FROM biodata ORDER BY id ASC');
        
        res.status(200).json({
            status: 'success',
            total_data: result.rowCount,
            data: result.rows
        });
    } catch (error) {
        console.error('sistem tidak berhasil mengambil data:', error.message);
        res.status(500).json({ 
            status: 'error', 
            message: 'Internal Server Error' 
        });
    }
});

// turn web server
app.listen(port, () => {
    console.log(`sistem hidup le. Akses API di postman`);
});
//http://localhost:${port}/api/biodata/

// GET all biodata
app.get('/api/biodata', async (req, res) => {
    try {
        const result = await pool.query('SELECT id, nama, nim, kelas FROM biodata ORDER BY id ASC');
        res.status(200).json({
            status: 'success',
            total_data: result.rowCount,
            data: result.rows
        });
    } catch (error) {
        console.error('Sistem gagal mengambil semua data:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'Internal Server Error'
        });
    }
});

// GET biodata by ID
app.get('/api/biodata/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('SELECT id, nama, nim, kelas FROM biodata WHERE id = $1', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({
                status: 'error',
                message: `Data dengan ID ${id} tidak ditemukan`
            });
        }
        res.status(200).json({
            status: 'success',
            data: result.rows[0]
        });
    } catch (error) {
        console.error(`Sistem gagal mengambil data dengan ID ${id}:`, error.message);
        res.status(500).json({
            status: 'error',
            message: 'Internal Server Error'
        });
    }
});


// POST create a new biodata
app.post('/api/biodata', async (req, res) => {
    const { nama, nim, kelas } = req.body;
    if (!nama || !nim || !kelas) {
        return res.status(400).json({
            status: 'error',
            message: 'Kolom nama, nim, dan kelas wajib diisi'
        });
    }

    try {
        const result = await pool.query(
            'INSERT INTO biodata (nama, nim, kelas) VALUES ($1, $2, $3) RETURNING *',
            [nama, nim, kelas]
        );
        res.status(201).json({
            status: 'success',
            message: 'Data biodata berhasil ditambahkan',
            data: result.rows[0]
        });
    } catch (error) {
        console.error('Sistem gagal menambahkan data:', error.message);
        res.status(500).json({
            status: 'error',
            message: 'Internal Server Error'
        });
    }
});


// PUT update biodata by ID
app.put('/api/biodata/:id', async (req, res) => {
    const { id } = req.params;
    const { nama, nim, kelas } = req.body;

    if (!nama || !nim || !kelas) {
        return res.status(400).json({
            status: 'error',
            message: 'Kolom nama, nim, dan kelas wajib diisi'
        });
    }

    try {
        const result = await pool.query(
            'UPDATE biodata SET nama = $1, nim = $2, kelas = $3 WHERE id = $4 RETURNING *',
            [nama, nim, kelas, id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({
                status: 'error',
                message: `Data dengan ID ${id} tidak ditemukan`
            });
        }

        res.status(200).json({
            status: 'success',
            message: 'Data biodata berhasil diperbarui',
            data: result.rows[0]
        });
    } catch (error) {
        console.error(`Sistem gagal memperbarui data dengan ID ${id}:`, error.message);
        res.status(500).json({
            status: 'error',
            message: 'Internal Server Error'
        });
    }
});


// DELETE biodata by ID
app.delete('/api/biodata/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM biodata WHERE id = $1 RETURNING *', [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({
                status: 'error',
                message: `Data dengan ID ${id} tidak ditemukan`
            });
        }

        res.status(200).json({
            status: 'success',
            message: `Data dengan ID ${id} berhasil dihapus`,
            deleted_data: result.rows[0]
        });
    } catch (error) {
        console.error(`Sistem gagal menghapus data dengan ID ${id}:`, error.message);
        res.status(500).json({
            status: 'error',
            message: 'Internal Server Error'
        });
    }
});
