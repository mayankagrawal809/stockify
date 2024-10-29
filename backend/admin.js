import { Kafka } from "kafkajs";

const kafka = new Kafka({
    clientId: 'my-app',
    brokers: ['localhost:29092'],
});

const admin = kafka.admin();

const createTopics = async () => {
    await admin.connect();
    console.log('Connected to Kafka broker - 📪');

    const topicsToCreate = [
        { topic: 'GOOGL', numPartitions: 1, replicationFactor: 1 },
        { topic: 'MSFT', numPartitions: 1, replicationFactor: 1 },
        { topic: 'NVDA', numPartitions: 1, replicationFactor: 1 },
        { topic: 'TSLA', numPartitions: 1, replicationFactor: 1 },
        { topic: 'AAPL', numPartitions: 1, replicationFactor: 1 },
        { topic: 'BINANCE_ETCBTC', numPartitions: 1, replicationFactor: 1 },
        { topic: 'BINANCE_BNBBTC', numPartitions: 1, replicationFactor: 1 },
        { topic: 'BINANCE_BTCUSDT', numPartitions: 1, replicationFactor: 1 },
    ];

    await admin.createTopics({
        topics: topicsToCreate,
    });
    console.log('Topics created successfully - 📁');

    await admin.disconnect();
    console.log('Disconnected from Kafka broker');
};

createTopics().catch(console.error);
