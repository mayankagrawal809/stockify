import { WebSocketServer } from 'ws';

const stockSymbols = [
    'AAPL', 'GOOGL', 'MSFT', 'NVDA', 'TSLA', 'BINANCE:BTCUSDT', 'BINANCE:ETCBTC', 'BINANCE:BNBBTC'
];

function generateRandomTrade(symbol) {
    return {
        type: 'trade',
        data: [
            {
                p: (Math.random() * 1000).toFixed(2),
                s: symbol,
                t: Date.now(),
                v: (Math.random() * 10).toFixed(4),
            },
        ]
    };
}

export function startFakeWebSocketServer(port = 8085) {
    const wss = new WebSocketServer({ port });
    console.log(`Fake WebSocket server is running on ws://localhost:${port}`);

    wss.on('connection', (ws) => {
        console.log('Client connected to fake WebSocket server');

        const sendRandomTradeData = () => {
            const symbol = stockSymbols[Math.floor(Math.random() * stockSymbols.length)];
            const tradeData = generateRandomTrade(symbol);
            ws.send(JSON.stringify(tradeData));
        };

        const intervalId = setInterval(sendRandomTradeData, 1000);

        ws.on('close', () => {
            console.log('Client disconnected from fake WebSocket server');
            clearInterval(intervalId);
        });

        ws.on('error', (error) => {
            console.error('WebSocket error on fake server:', error);
        });
    });

    wss.on('error', (error) => {
        console.error('WebSocket server error:', error);
    });
}
