import WebSocket from 'ws';
import dotenv from 'dotenv/config';
import { Kafka, CompressionTypes, logLevel } from 'kafkajs';
import ip from 'ip';


// Send the stock price to Kafka
export async function fetchAndPublishStockPrices() {
    const socket = new WebSocket(`wss://ws.finnhub.io?token=${process.env.FINNHUB_TOKEN}`);
    socket.addEventListener('open', function (event) {
        socket.send(JSON.stringify({ 'type': 'subscribe', 'symbol': 'AAPL' }))
        socket.send(JSON.stringify({ 'type': 'subscribe', 'symbol': 'BINANCE:BTCUSDT' }))
        socket.send(JSON.stringify({ 'type': 'subscribe', 'symbol': 'IC MARKETS:1' }))
    });
    const host = process.env.HOST_IP || ip.address()
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
                    topic: 'stock-price',
                    messages: [
                        { value: JSON.stringify(trade) },
                    ],
                });
            });
        } else {
            console.warn("Received unexpected message format:", message);
        }
    });
    // TODO: Should I close the connection?
}


