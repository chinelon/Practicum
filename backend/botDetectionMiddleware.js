
// const pool = require('./db');
// const express = require('express');
// async function logBotToDatabase(ip, userAgent, detectionType) {
//     const cleanIp = ip === '::1' ? '127.0.0.1' : ip;

//     try {
//         const query = `
//       INSERT INTO denylist (ip_address, user_agent, description, denied_at, detection_count)
//       VALUES ($1, $2, $3, NOW(), $4)
//       ON CONFLICT (ip_address) 
//       DO UPDATE SET 
//         detection_count = denylist.detection_count + 1,
//         denied_at = NOW()
//       RETURNING *;
//     `;
//         await pool.query(query, [ip, userAgent, detectionType, 1]);
//         console.log(`Logged bot IP ${ip} to database`);
//     } catch (err) {
//         console.error('Error logging bot to database:', err);
//     }
// }

// function botDetectionMiddleware(req, res, next) {
//     const userAgent = req.headers['user-agent'] || '';
//     const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;

//     const botKeywords = [
//         'bot', 'crawl', 'slurp', 'spider', 'WhatsApp',
//         'TelegramBot', 'Slackbot', 'Viber',
//         'SkypeUriPreview', 'Googlebot', 'curl/7.68.0',
//         'python-requests/2.28',
//         'WhatsApp',
//         'python-requests/2.28',
//         'crawl',
//         'slurp',
//         'spider',
//         'TelegramBot',
//         'Slackbot',
//         'curl/7.68.0',
//         'Viber', '2ip.ru bot',
//         '360Spider',
//         'Adbeat bot',
//         'adbeat_bot',
//         'AdminLabs',
//         'AdsBot-Google-Mobile',
//         'advanced_crawler',
//         'Adventurer',
//         'AGAKIDSBOT',
//         'AhrefsBot',
//         'AhrefsSiteAudit',
//         'AI2Bot',
//         'aiHitBot',
//         'Alexabot',
//         'AlexandriaOrgBot',
//         'alienfarm',
//         'ALittle Client',
//         'allOrigins',
//         'alyze.com bot',
//         'Amazonbot',
//         'AndersPinkBot',
//         'AntBot',
//         'anthropic bot',
//         'anthropic-ai',
//         'Applebot',
//         'Applebot-Extended',
//         'Aragog',
//         'Aranea',
//         'archive-org_bot',
//         'archive.org_bot',
//         'ArchiveBot',
//         'ArchiveBox',
//         'ArchiveTeam crawler',
//         'Arquivo-web-crawler',
//         'Asana Crawler',
//         'Autoconfig Test from USTC',
//         'Awario crawler',
//         'AwarioBot',
//         'AwarioSmartBot',
//         'awin.com crawler',
//         'Bad-Neighborhood',
//         'Baiduspider',
//         'Barkrowler',
//         'BazQux',
//         'BDBot',
//         'BeeperBot',
//         'BetterStack bot',
//         'bingbot',
//         'BingPreview',
//         'Birdcrawlerbot',
//         'bitlybot',
//         'BitSightBot',
//         'bl.uk bot',
//         'Blackboard',
//         'BLEXBot',
//         'Blogtrottr',
//         'botify',
//         'BotPoke',
//         'BrandProtect bot',
//         'BrandVerity',
//         'BrightEdge Crawler',
//         'BrokenLinkCheck.com'
//     ];

//     const isBot = botKeywords.some(keyword =>
//         userAgent.toLowerCase().includes(keyword.toLowerCase())
//     );

//     if (isBot) {
//         console.log(`Bot detected from IP ${ip} - ${userAgent}`);
//         logBotToDatabase(ip, userAgent, 'bot');
//         // return res.status(200).send('Bot detected, no action taken');
//     }
//     console.log(`Request from IP ${ip} - ${userAgent}`);
//     next();
// }

// module.exports = botDetectionMiddleware;

const pool = require('./db');
const express = require('express');
const rateLimitMap = new Map();

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
    const path = req.path.toLowerCase();

    // Bot keyword detection in User-Agent
    const botKeywords = [
        'bot', 'crawl', 'slurp', 'spider', 'WhatsApp',
        'TelegramBot', 'Slackbot', 'Viber',
        'SkypeUriPreview', 'Googlebot', 'curl/7.68.0',
        'python-requests/2.28',
        'WhatsApp',
        'python-requests/2.28',
        'crawl',
        'slurp',
        'spider',
        'TelegramBot',
        'Slackbot',
        'curl/7.68.0',
        'Viber', '2ip.ru bot',
        '360Spider',
        'Adbeat bot',
        'adbeat_bot',
        'AdminLabs',
        'AdsBot-Google-Mobile',
        'advanced_crawler',
        'Adventurer',
        'AGAKIDSBOT',
        'AhrefsBot',
        'AhrefsSiteAudit',
        'AI2Bot',
        'aiHitBot',
        'Alexabot',
        'AlexandriaOrgBot',
        'alienfarm',
        'ALittle Client',
        'allOrigins',
        'alyze.com bot',
        'Amazonbot',
        'AndersPinkBot',
        'AntBot',
        'anthropic bot',
        'anthropic-ai',
        'Applebot',
        'Applebot-Extended',
        'Aragog',
        'Aranea',
        'archive-org_bot',
        'archive.org_bot',
        'ArchiveBot',
        'ArchiveBox',
        'ArchiveTeam crawler',
        'Arquivo-web-crawler',
        'Asana Crawler',
        'Autoconfig Test from USTC',
        'Awario crawler',
        'AwarioBot',
        'AwarioSmartBot',
        'awin.com crawler',
        'Bad-Neighborhood',
        'Baiduspider',
        'Barkrowler',
        'BazQux',
        'BDBot',
        'BeeperBot',
        'BetterStack bot',
        'bingbot',
        'BingPreview',
        'Birdcrawlerbot',
        'bitlybot',
        'BitSightBot',
        'bl.uk bot',
        'Blackboard',
        'BLEXBot',
        'Blogtrottr',
        'botify',
        'BotPoke',
        'BrandProtect bot',
        'BrandVerity',
        'BrightEdge Crawler',
        'BrokenLinkCheck.com'
    ];
    const isBotUA = botKeywords.some(keyword =>
        userAgent.toLowerCase().includes(keyword)
    );

    // Behavioral analysis
    const now = Date.now();
    const lastSeen = rateLimitMap.get(ip);
    rateLimitMap.set(ip, now);

    const timeSinceLastRequest = lastSeen ? now - lastSeen : null;
    const isTooFast = timeSinceLastRequest !== null && timeSinceLastRequest < 1000;

    const suspiciousEndpointPatterns = ['/admin', '/login', '/wp-login', '/signup', '/trap/bot', '/trap/human'];
    const isSuspiciousEndpoint = suspiciousEndpointPatterns.some(p =>
        path.includes(p)
    );

    if (isBotUA) {
        console.log(`Bot detected from IP ${ip} - ${userAgent}`);
        logBotToDatabase(ip, userAgent, 'bot');
       // return res.status(200).send('Bot detected, no action taken');
    } else if (isSuspiciousEndpoint && isTooFast) {
        console.log(`Suspicious behavior detected from IP ${ip} - ${userAgent}`);
        logBotToDatabase(ip, userAgent, 'bot');
        return res.status(200).send('Suspicious behavior detected, no action taken');
    }
    //  Flag suspicious behavior
    // if (isBotUA || (isSuspiciousEndpoint && isTooFast)) {
    //     const reason = isBotUA ? 'bot-ua' : 'behavioral-pattern';
    //     console.log(`Bot detected from IP ${ip} - Reason: ${reason} - UA: ${userAgent}`);
    //     logBotToDatabase(ip, userAgent, reason);
    //     return res.status(200).send('Bot detected, no action taken');
    // }

    console.log(`Request from IP ${ip} - ${userAgent}`);
    next();
}

module.exports = botDetectionMiddleware;
