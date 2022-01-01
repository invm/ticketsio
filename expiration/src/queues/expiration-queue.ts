import Queue from 'bull';

interface Payload {
	orderId: string;
}

const expirationQueue = new Queue<Payload>('order-expiration', {
	redis: { host: process.env.REDIS_HOST },
});

expirationQueue.process(async (job: any) => {
	console.log('Job:', job.data.orderId);
});

export { expirationQueue };
