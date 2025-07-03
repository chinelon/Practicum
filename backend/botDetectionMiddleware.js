// middleware.js
const pool = require('./db');
const express = require('express');
async function logBotToDatabase(ip, userAgent, detectionType) {
    const cleanIp = ip === '::1' ? '127.0.0.1' : ip;

    try {
        const query = `
      INSERT INTO denylist (ip_address, user_agent, description, denied_at, detection_count)
      VALUES ($1, $2, $3, NOW(), $4)
      ON CONFLICT (ip_address) 
      DO UPDATE SET 
        detection_count = denylist.detection_count + 1,
        denied_at = NOW()
      RETURNING *;
    `;
        await pool.query(query, [ip, userAgent, detectionType, 1]);
        console.log(`Logged bot IP ${ip} to database`);
    } catch (err) {
        console.error('Error logging bot to database:', err);
    }
}
function botDetectionMiddleware(req, res, next) {
    const userAgent = req.headers['user-agent'] || '';
    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

    const botKeywords = [
        'bot', 'crawl', 'slurp', 'spider', 'WhatsApp',
        'TelegramBot', 'Slackbot', 'Viber', 'Discordbot',
        'SkypeUriPreview', 'Googlebot'
    ];

    const isBot = botKeywords.some(keyword =>
        userAgent.toLowerCase().includes(keyword.toLowerCase())
    );

    if (isBot) {
        console.log(`Bot detected from IP ${ip} - ${userAgent}`);
        logBotToDatabase(ip, userAgent, 'bot');
        return res.status(200).send('Bot detected, no action taken');
    }
    console.log(`Request from IP ${ip} - ${userAgent}`);
    next();
}

module.exports = botDetectionMiddleware;