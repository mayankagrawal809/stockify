import WebSocket from 'ws';
import dotenv from 'dotenv/config';
import { Kafka, CompressionTypes, logLevel } from 'kafkajs';
import { startFakeWebSocketServer } from './fakeWebSocketServer.js';
import ip from 'ip';
const USE_FAKE_WEBSOCKET = true; // Set to `false` to use real WebSocket

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

    // Start the fake WebSocket server if testing
    if (USE_FAKE_WEBSOCKET) {
        startFakeWebSocketServer(8085);
    }

    const wsURL = USE_FAKE_WEBSOCKET
        ? 'ws://localhost:8085'
        : `wss://ws.finnhub.io?token=${process.env.FINNHUB_TOKEN}`;

    const socket = new WebSocket(wsURL);

    if (!USE_FAKE_WEBSOCKET) {
        socket.addEventListener('open', function () {
            Object.keys(stockTopics).forEach((symbol) => {
                socket.send(JSON.stringify({ type: 'subscribe', symbol }));
            });
        });
    }

    const kafka = new Kafka({
        brokers: ['localhost:29092'],
        clientId: 'example-producer',
    });

    const producer = kafka.producer();
    await producer.connect();
    socket.addEventListener('message', function (event) {
        const message = JSON.parse(event.data);
        console.log('Received message:', message);
        if (message.type === 'trade' && Array.isArray(message.data)) {
            message.data.forEach(async (trade) => {
                const topic = stockTopics[trade.s];
                if (topic) {
                    await producer.send({
                        topic,
                        messages: [
                            { value: JSON.stringify(trade) },
                        ],
                    });
                }
            });
        } else {
            console.warn("Received unexpected message format:", message);
        }
    });
    // TODO: Should I close the producer?

    socket.on('error', (error) => {
        console.error('WebSocket error:', error);
    });

    socket.on('close', () => {
        console.log('WebSocket connection closed');
    });
}


