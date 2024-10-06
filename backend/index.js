const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const jwt = require('jsonwebtoken');
const JWT_SECRET = '6F4D26CD5CCB494E8918D137C3CD5'; // Should store in .env file
const bcrypt = require('bcrypt');
const cors = require('cors');
const users = [];

async function initializeUsers() {
    users.push({
        id: 1,
        username: 'admin',
        password: await bcrypt.hash('admin', 10), // Hash with salt rounds of 10
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

// Basic route
app.get('/', authenticateToken, (req, res) => {
    res.send('Hello World!');
});

app.get('/api/data', authenticateToken, (req, res) => {
    console.log('Hello from the backend!');
    res.json({ message: 'Hello from the backend!' });
});


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

    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, {
        expiresIn: '3h', // Token expires in 3 hours
    });
    res.json({ message: 'Login successful', token });
});

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
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

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
