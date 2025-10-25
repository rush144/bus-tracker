const express = require('express');
const router = express.Router();

// Example location route: update bus location
router.post('/update', (req, res) => {
  // TODO: Save location update to DB here
  res.json({ message: 'Location updated' });
});

module.exports = router;
