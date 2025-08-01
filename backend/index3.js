require('dotenv').config();
const pool = require('./db');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult, param } = require('express-validator');
const botDetectionMiddleware = require('./botDetectionMiddleware');
//const  = require('./adaptiveRateLimiter').fetchRateLimitMax;
//const {adaptiveRateLimiter, fetchRateLimitMax } = require('./adaptiveRateLimiter');
const adaptiveRateLimiter = require('./adaptiveRateLimiter');
const denylistMiddleware = require('./denylistMiddleware');

const app = express();
app.use(denylistMiddleware);
app.set('trust proxy', true);

app.use(helmet());
//app.use(fetchRateLimitMax);
app.use(adaptiveRateLimiter);
app.use(botDetectionMiddleware);

app.use(cors({
    origin: ['http://localhost:5173', 'https://practicum-eta.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
}));

app.use(express.json());

function generateToken(user) {
    return jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
        expiresIn: '1h'
    });
}


// Assuming denylistMiddleware is defined and working
app.get('/', denylistMiddleware, (req, res) => {
    res.status(200).json({ message: 'Welcome to the API' });
    res.set({
        'X-RateLimit-Limit': maxRequests,
        'X-RateLimit-Remaining': Math.max(maxRequests - current, 0),
    });

});



app.post('/signup',
    [
        body('email').isEmail(),
        body('password').isLength({ min: 6 }),
        body('name').notEmpty(),
        body('phoneno').notEmpty(),
        body('address').notEmpty(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, phoneno, address, email, password } = req.body;

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const result = await pool.query(
                'INSERT INTO users (name, phoneno, address, email, password) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email',
                [name, phoneno, address, email, hashedPassword]
            );
            const token = generateToken(result.rows[0]);
            res.status(201).json({ user: result.rows[0], token });
        } catch (error) {
            console.error('Error inserting user:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

// Login
app.post('/login',
    [
        body('email').isEmail(),
        body('password').notEmpty()
    ],
    async (req, res) => {
        const { email, password } = req.body;

        try {
            const result = await pool.query(
                'SELECT * FROM users WHERE email = $1',
                [email]
            );
            const user = result.rows[0];
            if (!user) return res.status(401).json({ error: 'Invalid credentials' });

            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

            const token = generateToken(user);
            res.status(200).json({ user: { id: user.id, name: user.name, email: user.email }, token });
        } catch (error) {
            console.error('Error logging in user:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

// Authentication middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

app.get('/allusers', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT id, name, email, phoneno, address FROM users');
        res.status(200).json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/users/:id',
    [param('id').isInt()],
    authenticateToken,
    async (req, res) => {
        const { id } = req.params;
        try {
            const result = await pool.query('SELECT id, name, email FROM users WHERE id = $1', [id]);
            if (result.rows.length > 0) {
                res.status(200).json(result.rows[0]);
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        } catch (error) {
            console.error('Error fetching user:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

app.put('/users/:id',
    authenticateToken,
    async (req, res) => {
        const { id } = req.params;
        const { name, phoneno, address, email, password } = req.body;

        try {
            const hashedPassword = await bcrypt.hash(password, 10);
            const result = await pool.query(
                'UPDATE users SET name = $1, phoneno = $2, address = $3, email = $4, password = $5 WHERE id = $6 RETURNING id, name, email',
                [name, phoneno, address, email, hashedPassword, id]
            );
            if (result.rows.length > 0) {
                res.status(200).json(result.rows[0]);
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        } catch (error) {
            console.error('Error updating user:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

app.delete('/users/:id',
    authenticateToken,
    async (req, res) => {
        const { id } = req.params;
        try {
            const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
            if (result.rows.length > 0) {
                res.status(200).json({ message: 'User deleted successfully' });
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });


//honeytoken endpoint human detection
app.post('/trap/human', async (req, res) => {
    const ip = req.ip === '::1' ? '127.0.0.1' : req.ip;

    try {
        await pool.query(
            `INSERT INTO denylist (ip_address, description, user_agent) VALUES ($1, $2, $3) ON CONFLICT (ip_address) 
            DO UPDATE SET 
        detection_count = denylist.detection_count + 1,
            denied_at = NOW()`,
            [ip, 'human', 'honeytoken']
        );
        console.log(`🧠 Honeytoken triggered by human at ${ip}`);
        res.status(429).json({ error: 429, message: 'IP logged as human' });

    } catch (err) {
        console.error('Error inserting human IP:', err);
        res.status(500).json({ message: 'Failed to log bot IP' });
    }
});

//honeytoken endpoint bot detection
app.post('/trap/bot', async (req, res) => {
    const ip = req.ip === '::1' ? '127.0.0.1' : req.ip;
    const userAgent = req.get('User-Agent') || 'unknown';

    try {
        await pool.query(
            `INSERT INTO denylist (ip_address, description, user_agent) VALUES ($1, $2, $3) ON CONFLICT (ip_address) 
            DO UPDATE SET 
        detection_count = denylist.detection_count + 1,
            denied_at = NOW()`,
            [ip, 'bot', userAgent]
        );
        console.log(`🧠 Honeytoken triggered by bot at ${ip}`);
        res.status(429).json({ error: 429, message: 'IP logged as bot' });

    } catch (err) {
        console.error('Error inserting bot IP:', err);
        res.status(500).json({ message: 'Failed to log bot IP' });
    }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Secure server is running on port ${PORT}`);
});

module.exports = app; // Export app and redisClient for testing and other uses
module.exports.pool = pool;
