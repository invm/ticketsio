import { OrderCancelledEvent, TicketUpdatedEvent } from '@invmtickets/common';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCancelledListener } from '../OrderCancelledListener';
import mongoose from 'mongoose';
import { Ticket } from '../../../models/ticket';
import { Message } from 'node-nats-streaming';

const setup = async () => {
	const listener = new OrderCancelledListener(natsWrapper.client);

	const orderId = new mongoose.Types.ObjectId().toHexString();
	const ticket = Ticket.build({
		title: 'concert',
		price: 20,
		userId: 'asdf',
	});

	ticket.set({ orderId });

	await ticket.save();

	const data: OrderCancelledEvent['data'] = {
		id: orderId,
		version: 0,
		ticket: {
			id: ticket.id,
		},
	};

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return { listener, ticket, data, msg, orderId };
};

describe('order cancelled listener', () => {
	it('updates the ticket', async () => {
		const { listener, data, ticket, msg } = await setup();

		await listener.onMessage(data, msg);

		const updatedTicket = await Ticket.findById(ticket.id);

		expect(updatedTicket!.orderId).toEqual(undefined);
	});

	it('acks the message', async () => {
		const { listener, data, msg } = await setup();

		await listener.onMessage(data, msg);

		expect(msg.ack).toHaveBeenCalled();
	});

	it('publishes a ticket updated event', async () => {
		const { listener, data, msg } = await setup();

		await listener.onMessage(data, msg);

		expect(natsWrapper.client.publish).toHaveBeenCalled();

		const ticketData: TicketUpdatedEvent['data'] = JSON.parse(
			(natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
		);

		expect(ticketData!.orderId).toBeUndefined();
	});
});
