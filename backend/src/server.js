require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const fs = require('fs');
const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json({ limit: '2mb' }));

const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    // Create logos subdirectory
    fs.mkdirSync(path.join(uploadsDir, 'logos'), { recursive: true });
}

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.get('/', (req, res) => res.json({ message: ' API running' }));

app.use('/api/auth', require('./routes/auth'));
// ─── Routes ──────────────────────────────────────────────────────

// ─── Mount routes ───────────────────────────────────────────────
app.use('/api', require('./routes/contactRoutes'));
app.use('/api/business', require('./routes/business'));

app.use('/api/clients', require('./routes/clients'));

app.use('/api/admin', require('./routes/admin'));

app.use('/api/businessprofile', require('./routes/businessProfileRoutes'));

mongoose.connect(process.env.MONGO_URI).then(() => { app.listen(process.env.PORT || 5000, () => console.log('API running on ' + (process.env.PORT || 5000))) }).catch(err => {
    console.error(err);
    process.exit(1)
});

