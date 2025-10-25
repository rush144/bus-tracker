const express = require('express');
const router = express.Router();

// Example buses route: get all buses
router.get('/', (req, res) => {
  // TODO: Fetch buses from DB here
  res.json([{ number: '255', route: 'Colombo - Galle' }]);
});

module.exports = router;
