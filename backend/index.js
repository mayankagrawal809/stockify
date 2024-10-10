const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const cors = require('cors');

// Configuration
const port = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || '6F4D26CD5CCB494E8918D137C3CD5'; // Should be stored in .env file
const supportedStocks = ['GOOG', 'TSLA', 'AMZN', 'META', 'NVDA'];

// In-memory data (In production, use a proper database)
const users = [];
let clients = [];  // Clients subscribed to stock updates

// Middleware
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
// In productiion, this should be done via websockets too.
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

        // Remove client when connection closes
        req.on('close', () => {
            clients = clients.filter((client) => client !== newClient);
        });
    });
});

// Function to send stock updates to subscribed clients
// In a real-world scenario, this would be triggered by a change in stock prices
// Which should be fetched by websockets and update to the clients on change of values

function sendStockUpdates() {
    supportedStocks.forEach((ticker) => {
        const price = (Math.random() * 1000).toFixed(2);

        // Notify only clients subscribed to this specific ticker
        clients
            .filter((client) => client.ticker === ticker)
            .forEach((client) =>
                client.res.write(`data: ${JSON.stringify({ ticker, price })}\n\n`)
            );
    });
}

setInterval(sendStockUpdates, 1000);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
