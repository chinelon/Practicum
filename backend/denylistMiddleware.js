const pool = require('./db');

const denylistMiddleware = async (req, res, next) => {
  const ip = req.ip === '::1' ? '127.0.0.1' : req.ip;

  try {
    // Check if IP is in the denylist table in Postgres
    const result = await pool.query(
      'SELECT * FROM denylist WHERE ip_address = $1',
      [ip]
    );
    // If IP is found and description is 'human', block access returning 403 status code
    if (result.rows.length > 0 && result.rows[0].description === 'human') {
      console.log(`⛔ Access blocked for denylisted IP: ${ip}`);
      return res.status(403).json({
        message: 'Access denied. Your IP has been blocked.',
      });
    }

    next();
  } catch (err) {
    console.error('Denylist check error:', err);
    res.status(500).json({ message: 'Server error checking denylist' });
  }
};

module.exports = denylistMiddleware;
