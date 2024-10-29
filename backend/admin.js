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

    const existingTopics = await admin.listTopics();

    const topicsToActuallyCreate = topicsToCreate.filter(topicConfig => {
        return !existingTopics.includes(topicConfig.topic);
    });

    if (topicsToActuallyCreate.length > 0) {
        const created = await admin.createTopics({
            topics: topicsToActuallyCreate,
        });

        if (created) {
            console.log('Topics created successfully - 📁');
        } else {
            console.log('Some topics may not have been created. They might already exist.');
        }
    } else {
        console.log('All topics already exist - 📁');
    }

    await admin.disconnect();
    console.log('Disconnected from Kafka broker');
};

createTopics().catch(console.error);