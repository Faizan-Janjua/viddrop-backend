const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const downloadRoute = require('./routes/download');
app.use('/download', downloadRoute);

app.get('/', (req, res) => {
  res.send('Backend is running');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
