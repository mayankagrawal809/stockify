const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const jwt = require('jsonwebtoken');
const JWT_SECRET = '6F4D26CD5CCB494E8918D137C3CD5'; // Should store in .env file
const bcrypt = require('bcrypt');
const cors = require('cors');
const users = [];
const supportedStocks = ['GOOG', 'TSLA', 'AMZN', 'META', 'NVDA'];

async function initializeUsers() {
    users.push({
        id: 1,
        username: 'admin',
        password: await bcrypt.hash('admin', 10),
    });
    users.push({
        id: 2,
        username: 'user1',
        password: await bcrypt.hash('password1', 10),
    });
    users.push({
        id: 3,
        username: 'user2',
        password: await bcrypt.hash('password2', 10),
    });
}

initializeUsers();

app.use(cors());
app.use(express.json());




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

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
        expiresIn: '3h', // Token expires in 3 hours
    });
    res.json({ message: 'Login successful', token });
});


// Endpoint to get supported stocks
app.get('/api/supported-stocks', authenticateToken, (req, res) => {
    res.json({ stocks: supportedStocks });
});

// In-memory list of clients with their subscribed stock
let clients = [];

// Endpoint to handle SSE connections for a specific stock
app.get('/api/stock-updates/:ticker', (req, res) => {
    const ticker = req.params.ticker;

    // Set headers to establish SSE connection
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Save the connection for future updates
    const newClient = { ticker, res };
    clients.push(newClient);

    // Remove client when connection closes
    req.on('close', () => {
        clients = clients.filter((client) => client !== newClient);
    });
});

function sendStockUpdates() {
    supportedStocks.forEach((ticker) => {
        const price = (Math.random() * 1000).toFixed(2);

        // Notify only the clients subscribed to this specific ticker
        clients
            .filter((client) => client.ticker === ticker)
            .forEach((client) =>
                client.res.write(`data: ${JSON.stringify({ ticker, price })}\n\n`)
            );
    });
}

function authenticateToken(req, res, next) {

    const authHeader = req.headers['authorization'] || req.headers['Authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Access denied, no token provided' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;
        next();
    });
}
setInterval(sendStockUpdates, 2000);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
