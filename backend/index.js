const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors'); // Import the CORS package

app.use(cors());
app.use(express.json());

// Basic route
app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/api/data', (req, res) => {
    console.log('Hello from the backend!');
    res.json({ message: 'Hello from the backend!' });
});


app.post('/api/login', (req, res) => {

    const username = req.body.username;
    const password = req.body.password;
    if (username === 'admin' && password === 'admin') {
        res.json({ message: 'Login successful' });
    } else {
        res.status(401).json({ message: 'Login failed' });
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
