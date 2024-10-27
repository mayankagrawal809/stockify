import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import cors from 'cors';
import { fetchAndPublishStockPrices } from './fetchStockUpdate.js';
import { Kafka, logLevel } from 'kafkajs';
import ip from 'ip';
import { createClient } from 'redis';
// Configuration
const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || '6F4D26CD5CCB494E8918D137C3CD5'; // Should be stored in .env file
const supportedStocks = [
    'AAPL', 'GOOGL', 'MSFT', 'NVDA', 'TSLA', 'BINANCE:BTCUSDT', 'BINANCE:ETCBTC', 'BINANCE:BNBBTC'
];
const stockTopics = {
    'AAPL': 'AAPL',
    'GOOGL': 'GOOGL',
    'MSFT': 'MSFT',
    'NVDA': 'NVDA',
    'TSLA': 'TSLA',
    'BINANCE:BTCUSDT': 'BINANCE_BTCUSDT',
    'BINANCE:ETCBTC': 'BINANCE_ETCBTC',
    'BINANCE:BNBBTC': 'BINANCE_BNBBTC',
};
const host = process.env.HOST_IP || ip.address()

// Redis client
const redisClient = createClient();
redisClient.on('error', (err) => {
    console.error('Redis error:', err);
});
await redisClient.connect();


// In-memory data (In production, use a proper database)
const users = [];
const clients = new Map(); // Key: stock symbol, Value: array of client response objects

// Middleware
const app = express();
app.use(cors());
app.use(express.json());

// Initialize users (In production, this would be a DB operation)
async function initializeUsers() {
    users.push({ id: 1, username: 'admin', password: await bcrypt.hash('admin', 10) });
    users.push({ id: 2, username: 'user1', password: await bcrypt.hash('password1', 10) });
    users.push({ id: 3, username: 'user2', password: await bcrypt.hash('password2', 10) });
}

initializeUsers();


function verifyToken(token, res, callback) {
    if (!token) {
        return res.status(401).json({ message: 'Access denied, no token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        callback(user);
    });
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    verifyToken(token, res, (user) => {
        req.user = user;
        next();
    });
}

// Login route
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;

    const user = users.find((user) => user.username === username);

    if (!user) {
        return res.status(401).json({ message: 'Login failed' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
        return res.status(401).json({ message: 'Login failed' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '3h' });
    res.json({ message: 'Login successful', token });
});

app.get('/api/supported-stocks', authenticateToken, (req, res) => {
    res.json({ stocks: supportedStocks });
});

// Stock updates via SSE (Server-Sent Events) 
// In productiion, this could be done via websockets too.
app.get('/api/stock-updates/:ticker', (req, res) => {
    const token = req.query.token; // Token passed as a query parameter (EventSource doesn't support headers)

    verifyToken(token, res, async (user) => {
        const ticker = req.params.ticker;

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Add client to subscribed list
        if (!clients.has(ticker)) {
            clients.set(ticker, []);
        }
        const clientList = clients.get(ticker);
        clientList.push(res);

        const stockPrice = await redisClient.get(ticker);
        res.write(`data: ${JSON.stringify(stockPrice)}\n\n`);


        // Remove client when connection closes
        req.on('close', () => {
            const clientList = clients.get(ticker);
            if (clientList) {
                const index = clientList.indexOf(res);
                if (index > -1) {
                    clientList.splice(index, 1);
                }
                // Remove the stock from the map if there are no clients
                if (clientList.length === 0) {
                    clients.delete(ticker);
                }
            }
        });
    });
});

// Consume the stock prices from Kafka and send to subscribed clients
async function sendStockUpdatesUsingSSE() {
    const kafka = new Kafka({
        logLevel: logLevel.INFO,
        brokers: [`${host}:9092`],
        clientId: 'example-consumer',
    })
    const consumer = kafka.consumer({ groupId: 'stock-price-group' })
    await consumer.connect();
    const topics = Object.values(stockTopics);
    await consumer.subscribe({ topics, fromBeginning: false });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const trade = JSON.parse(message.value.toString());
            if (clients.has(trade.s)) {
                clients.get(trade.s).forEach((client) => {
                    client.write(`data: ${trade.p}\n\n`);
                });
            }
        },
    });



}

async function seedRedisDB() {
    const stocks = supportedStocks;
    for (let i = 0; i < stocks.length; i++) {
        const stock = stocks[i];
        await redisClient.set(stock, '100');
    }
}

async function updateDbWithStockPrices() {
    const kafka = new Kafka({
        brokers: [`${host}:9092`],
        clientId: 'saving-to-db-consumer',
    });
    const consumer = kafka.consumer({ groupId: 'save-to-db-group' });
    await consumer.connect();
    const topics = Object.values(stockTopics);
    await consumer.subscribe({ topics, fromBeginning: false });

    await consumer.run({
        eachMessage: async ({ topic, partition, message }) => {
            const trade = JSON.parse(message.value.toString());
            console.log("Saving to db:", trade);
            await redisClient.set(trade.s, trade.p);
        },
    });
}

seedRedisDB();
sendStockUpdatesUsingSSE();
fetchAndPublishStockPrices();
updateDbWithStockPrices();
// Start fetching stock updates

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
