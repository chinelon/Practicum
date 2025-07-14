const pool = require('./db');

async function fetchUserRateLimit(ipAddress) {
  try {
    // Check if IP is denylisted
    const denyResult = await pool.query(
      'SELECT * FROM denylist WHERE ip_address = $1 AND denied_at IS NOT NULL',
      [ipAddress]
    );

    if (denyResult.rows.length > 0) {
      return { denylisted: true };
    }

    // Default config for normal users
    const rateLimitConfig = {
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: 100,         // default limit
    };

    // You can add DB logic here to get per-user/IP configs if needed

    return {
      denylisted: false,
      ...rateLimitConfig,
    };
  } catch (err) {
    console.error('Error in fetchUserRateLimit:', err);
    return { denylisted: false, windowMs: 15 * 60 * 1000, maxRequests: 100 };
  }
}

module.exports = fetchUserRateLimit;
