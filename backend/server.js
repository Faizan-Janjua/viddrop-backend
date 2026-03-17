const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
const downloadRoute = require('./routes/download');
const infoRoute = require('./routes/info');

app.use('/download', downloadRoute);
app.use('/info', infoRoute);

// Health / test route
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Viddrop backend is running'
  });
});

// Railway port
const PORT = process.env.PORT || 3000;

// IMPORTANT: bind to 0.0.0.0
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
