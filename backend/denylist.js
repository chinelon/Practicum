const denylist = async (req, res, next) => {
    const ip = req.ip === '::1' ? '127.0.0.1' : req.ip;

    try {
        const result = await pool.query('SELECT * FROM denylist WHERE ip_address = $1', [ip]);
        if (result.rows.length > 0) {
            console.log(`🚫 Blocked request from denylisted IP: ${ip}`);
            return res.status(403).send('Access forbidden');
        }
    } catch (err) {
        console.error('Error checking denylist:', err);
    }

    next();
};
