console.log('BOOT: file loaded');

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err);
});

const express = require('express');
const app = express();

console.log('BOOT: express loaded');

// Basic test route (must respond)
app.get('/', (req, res) => {
  res.status(200).send('OK - Backend Running');
});

// Optional health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 3000;

console.log('BOOT: about to listen on', PORT);

// IMPORTANT: no '0.0.0.0'
app.listen(PORT, () => {
  console.log(`BOOT: server listening on ${PORT}`);
});
