const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors'); // Import the CORS package

app.use(cors());

// Basic route
app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/api/data', (req, res) => {
    console.log('Hello from the backend!');
    res.json({ message: 'Hello from the backend!' });
});



// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
