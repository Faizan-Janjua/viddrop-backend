const express = require('express');
const cors = require('cors');
const path = require('path');

const infoRoutes = require('./routes/info');
const downloadRoutes = require('./routes/download');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

app.use('/api/info', infoRoutes);
app.use('/api/download', downloadRoutes);

// General error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://localhost:${PORT}`);
    console.log(`Access it also via http://127.0.0.1:${PORT}`);
});
