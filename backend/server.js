const express = require('express');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.status(200).send('OK - Backend Running');
});

app.get('/health', (req, res) => {
  res.status(200).json({
    ok: true,
    message: 'Viddrop backend is healthy'
  });
});

const downloadRoute = require('./routes/download');
app.use('/download', downloadRoute);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
