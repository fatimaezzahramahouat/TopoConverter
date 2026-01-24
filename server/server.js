const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Root route for testing
app.get('/', (req, res) => {
  res.send('TopoConverter API is running');
});

// Routes for static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/exports', express.static(path.join(__dirname, 'exports')));

// Multer Setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

const db = require('./db');

// Initialize Database Table
const initDB = async () => {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS conversions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        original_name VARCHAR(255),
        image_path VARCHAR(255),
        dxf_path VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('Database table "conversions" is ready');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
};
initDB();

// Conversion Endpoint
app.post('/api/convert', upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' });
  }

  const imagePath = req.file.path;
  const originalName = req.file.originalname;
  const scriptPath = path.join(__dirname, 'scripts', 'converter.py');

  // Spawn Python process (Using 'py' for Windows Launcher)
  const pythonProcess = spawn('py', [scriptPath, imagePath]);

  let resultData = '';
  let errorData = '';

  pythonProcess.on('error', (err) => {
    console.error('Failed to start Python process:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Python process failed to start', details: err.message });
    }
  });

  pythonProcess.stdout.on('data', (data) => {
    resultData += data.toString();
  });

  pythonProcess.stderr.on('data', (data) => {
    errorData += data.toString();
  });

  pythonProcess.on('close', async (code) => {
    if (code !== 0) {
      console.error(`Python script failed with code ${code}: ${errorData}`);
      return res.status(500).json({ error: 'Conversion failed', details: errorData });
    }

    const dxfPath = resultData.trim();
    if (!dxfPath || !fs.existsSync(dxfPath)) {
      return res.status(500).json({ error: 'Generated DXF file not found.' });
    }

    try {
      // Save to Database
      await db.query(
        'INSERT INTO conversions (original_name, image_path, dxf_path) VALUES (?, ?, ?)',
        [originalName, imagePath, dxfPath]
      );
    } catch (dbErr) {
      console.error('Database insertion failed:', dbErr);
    }

    // Return the relative path for the client to download
    const relativeDxfPath = path.basename(dxfPath);
    res.json({ 
      success: true, 
      dxfUrl: `http://localhost:${PORT}/exports/${relativeDxfPath}` 
    });
  });
});

// History Endpoint
app.get('/api/history', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM conversions ORDER BY created_at DESC LIMIT 10');
    const enrichedRows = rows.map(row => ({
      ...row,
      dxfUrl: `http://localhost:${PORT}/exports/${path.basename(row.dxf_path)}`
    }));
    res.json(enrichedRows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
