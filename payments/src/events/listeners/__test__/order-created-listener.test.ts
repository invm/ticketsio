import { OrderCreatedEvent, OrderStatus } from '@invmtickets/common';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCreatedListener } from '../OrderCreatedListener';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Order } from '../../../models/order';

const setup = async () => {
	const listener = new OrderCreatedListener(natsWrapper.client);

	const data: OrderCreatedEvent['data'] = {
		id: new mongoose.Types.ObjectId().toHexString(),
		version: 0,
		status: OrderStatus.Created,
		userId: new mongoose.Types.ObjectId().toHexString(),
		expiresAt: '',
		ticket: {
			id: new mongoose.Types.ObjectId().toHexString(),
			price: 10,
		},
	};

	// @ts-ignore
	const msg: Message = { ack: jest.fn() };

	return { listener, data, msg };
};

describe('order created listener', () => {
	it('acks the message', async () => {
		const { listener, data, msg } = await setup();

		await listener.onMessage(data, msg);

		expect(msg.ack).toHaveBeenCalled();
	});

	it('replicates the order info', async () => {
		const { listener, data, msg } = await setup();

		await listener.onMessage(data, msg);

		const order = await Order.findById(data.id);

		expect(order!.price).toEqual(data.ticket.price);
	});
});
