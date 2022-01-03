import { natsWrapper } from '../../../nats-wrapper';
import { ExpirationCompleteListener } from '../ExpirationCompleteListener';
import {
	ExpirationCompleteEvent,
	OrderCancelledEvent,
	OrderStatus,
} from '@invmtickets/common';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';
import { Order } from '../../../models/order';

const setup = async () => {
	// create an instance of the listener
	const listener = new ExpirationCompleteListener(natsWrapper.client);

	const ticket = Ticket.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		title: 'concert',
		price: 20,
	});

	await ticket.save();

	const order = Order.build({
		userId: new mongoose.Types.ObjectId().toHexString(),
		status: OrderStatus.Created,
		expiresAt: new Date(),
		ticket: ticket,
	});

	await order.save();
	// create a fake data event
	const data: ExpirationCompleteEvent['data'] = { orderId: order.id };

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return { listener, data, msg, order };
};

describe('expiration complete listener', () => {
	it('update the order status to cancelled', async () => {
		const { listener, data, msg, order } = await setup();

		await listener.onMessage(data, msg);

		const updatedOrder = await Order.findById(order.id);

		// write assertions to make sure that the ticket is created
		expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
	}),
		it('acks the message', async () => {
			const { listener, data, msg } = await setup();

			await listener.onMessage(data, msg);

			// write assertions to make sure that ask function is called
			expect(msg.ack).toHaveBeenCalled();
		});
	it('emits orders cancelled event', async () => {
		const { listener, data, msg, order } = await setup();

		await listener.onMessage(data, msg);

		expect(natsWrapper.client.publish).toHaveBeenCalled();

		const eventData: OrderCancelledEvent['data'] = JSON.parse(
			(natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
		);

		expect(eventData.id).toEqual(order.id);
	});
});
