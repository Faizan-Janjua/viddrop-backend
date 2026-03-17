const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health route
app.get('/', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Viddrop backend is running'
  });
});

// Only load download route for now
const downloadRoute = require('./routes/download');
app.use('/download', downloadRoute);

const PORT = process.env.PORT || 3000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
