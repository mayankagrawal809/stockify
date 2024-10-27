import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import cors from 'cors';
import { fetchAndPublishStockPrices } from './fetchStockUpdate.js';
import { Kafka, logLevel } from 'kafkajs';
import ip from 'ip';

// Configuration
const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || '6F4D26CD5CCB494E8918D137C3CD5'; // Should be stored in .env file
const supportedStocks = ['GOOG', 'TSLA', 'BINANCE:BTCUSDT', 'META', 'NVDA'];
const host = process.env.HOST_IP || ip.address()


// In-memory data (In production, use a proper database)
const users = [];
let clients = [];  // Clients subscribed to stock updates

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

    verifyToken(token, res, (user) => {
        const ticker = req.params.ticker;

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');

        // Add client to subscribed list
        const newClient = { ticker, res };
        clients.push(newClient);
        // fetch from db, Push last price to the client

        // Remove client when connection closes
        req.on('close', () => {
            clients = clients.filter((client) => client !== newClient);
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
    await consumer.subscribe({ topic: 'stock-price', fromBeginning: false });

    await consumer.run({
        eachMessage: async ({ topic: _topic, partition: _partition, message }) => {
            const stockPrice = JSON.parse(message.value.toString());
            clients
                .filter((client) => client.ticker === stockPrice.s)
                .forEach((client) => {
                    client.res.write(`data: ${JSON.stringify(stockPrice)}\n\n`);
                });
        },
    });



}

sendStockUpdatesUsingSSE();
// Start fetching stock updates
fetchAndPublishStockPrices();

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
