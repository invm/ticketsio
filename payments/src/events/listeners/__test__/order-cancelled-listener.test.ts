import { OrderCancelledEvent, OrderStatus } from '@invmtickets/common';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledListener } from '../OrderCancelledListener';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Order } from '../../../models/order';

const setup = async () => {
	const listener = new OrderCancelledListener(natsWrapper.client);

	const orderId = new mongoose.Types.ObjectId().toHexString();

	const order = Order.build({
		id: orderId,
		version: 0,
		userId: new mongoose.Types.ObjectId().toHexString(),
		status: OrderStatus.Created,
		price: 20,
	});

  await order.save()

	const data: OrderCancelledEvent['data'] = {
		id: orderId,
		version: 0,
		ticket: {
			id: new mongoose.Types.ObjectId().toHexString(),
		},
	};

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return { listener, data, msg };
};

describe('order cancelled listener', () => {
	it('updates the order', async () => {
		const { listener, data, msg } = await setup();

		await listener.onMessage(data, msg);

		const updatedOrder = await Order.findById(data.id);

		expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
	});

	it('acks the message', async () => {
		const { listener, data, msg } = await setup();

		await listener.onMessage(data, msg);

		expect(msg.ack).toHaveBeenCalled();
	});
});
