import WebSocket from 'ws';
import dotenv from 'dotenv/config';
import { Kafka, CompressionTypes, logLevel } from 'kafkajs';
import ip from 'ip';
// Create a mapping of stock symbols to their topic names
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

// Send the stock price to Kafka
export async function fetchAndPublishStockPrices() {
    const host = process.env.HOST_IP || ip.address()

    const socket = new WebSocket(`wss://ws.finnhub.io?token=${process.env.FINNHUB_TOKEN}`);
    socket.addEventListener('open', function (event) {
        socket.send(JSON.stringify({ 'type': 'subscribe', 'symbol': 'AAPL' }))
        socket.send(JSON.stringify({ 'type': 'subscribe', 'symbol': 'GOOGL' }))
        socket.send(JSON.stringify({ 'type': 'subscribe', 'symbol': 'MSFT' }))
        socket.send(JSON.stringify({ 'type': 'subscribe', 'symbol': 'NVDA' }))
        socket.send(JSON.stringify({ 'type': 'subscribe', 'symbol': 'TSLA' }))
        socket.send(JSON.stringify({ 'type': 'subscribe', 'symbol': 'BINANCE:BTCUSDT' }))
        socket.send(JSON.stringify({ 'type': 'subscribe', 'symbol': 'BINANCE:ETCBTC' }))
        socket.send(JSON.stringify({ 'type': 'subscribe', 'symbol': 'BINANCE:BNBBTC' }))
    });

    const kafka = new Kafka({
        brokers: [`${host}:9092`],
        clientId: 'example-producer',
    });

    const producer = kafka.producer();
    await producer.connect();
    socket.addEventListener('message', function (event) {
        const message = JSON.parse(event.data);
        if (message.type === 'trade' && Array.isArray(message.data)) {
            message.data.forEach(async (trade) => {
                await producer.send({
                    topic: stockTopics[trade.s],
                    messages: [
                        { value: JSON.stringify(trade) },
                    ],
                });
            });
        } else {
            console.warn("Received unexpected message format:", message);
        }
    });
    // TODO: Should I close the producer?
}


