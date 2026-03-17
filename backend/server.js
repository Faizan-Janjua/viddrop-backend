const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.status(200).send('OK - Backend Running');
});

app.get('/health', (req, res) => {
  res.status(200).json({ ok: true });
});

const downloadRoute = require('./routes/download');
app.use('/download', downloadRoute);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
