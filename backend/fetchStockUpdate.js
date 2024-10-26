import WebSocket from 'ws';
import dotenv from 'dotenv/config';


export function startFetchingStockPrices() {
    const socket = new WebSocket(`wss://ws.finnhub.io?token=${process.env.FINNHUB_TOKEN}`);
    socket.addEventListener('open', function (event) {
        socket.send(JSON.stringify({ 'type': 'subscribe', 'symbol': 'AAPL' }))
        socket.send(JSON.stringify({ 'type': 'subscribe', 'symbol': 'BINANCE:BTCUSDT' }))
        socket.send(JSON.stringify({ 'type': 'subscribe', 'symbol': 'IC MARKETS:1' }))
    });

    socket.addEventListener('message', function (event) {
        console.log('Message from server ', event.data);
    });
}


