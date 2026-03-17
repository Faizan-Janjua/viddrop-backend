console.log('BOOT: file loaded');

process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION:', err);
});

const express = require('express');
console.log('BOOT: express loaded');

const app = express();

app.get('/', (req, res) => {
  res.status(200).send('OK');
});

const PORT = Number(process.env.PORT) || 3000;
console.log('BOOT: about to listen on', PORT);

app.listen(PORT, '0.0.0.0', () => {
  console.log('BOOT: server listening on', PORT);
});
