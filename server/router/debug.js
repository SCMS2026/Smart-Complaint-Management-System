const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const router = require('express').Router();

// Diagnostic endpoint to check OAuth config
router.get('/debug-oauth', (req, res) => {
  const config = {
    clientIdSet: !!process.env.GOOGLE_CLIENT_ID,
    clientIdPreview: process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.substring(0, 30) + '...' : 'NOT SET',
    clientSecretSet: !!process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'NOT SET',
    nodeEnv: process.env.NODE_ENV,
    timestamp: new Date().toISOString()
  };

  console.log('🔍 OAuth Debug Info:', config);
  res.json(config);
});

module.exports = router;
