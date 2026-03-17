const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  res.json({
    ok: true,
    message: 'Info route working'
  });
});

module.exports = router;
