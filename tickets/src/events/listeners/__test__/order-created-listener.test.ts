import {
	OrderCreatedEvent,
	OrderStatus,
	TicketUpdatedEvent,
} from '@invmtickets/common';
import { natsWrapper } from '../../../nats-wrapper';
import { OrderCreatedListener } from '../OrderCreatedListener';
import mongoose from 'mongoose';
import { Ticket } from '../../../models/ticket';
import { Message } from 'node-nats-streaming';

const setup = async () => {
	const listener = new OrderCreatedListener(natsWrapper.client);

	const ticket = Ticket.build({
		title: 'concert',
		price: 20,
		userId: 'asdf',
	});

	await ticket.save();

	const data: OrderCreatedEvent['data'] = {
		id: new mongoose.Types.ObjectId().toHexString(),
		version: 0,
		status: OrderStatus.Created,
		userId: new mongoose.Types.ObjectId().toHexString(),
		expiresAt: '',
		ticket: {
			id: ticket.id,
			price: ticket.price,
		},
	};

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return { listener, ticket, data, msg };
};

describe('order created listener', () => {
	it('it sets the user id of the ticket', async () => {
		const { listener, data, ticket, msg } = await setup();

		await listener.onMessage(data, msg);

		const updatedTicket = await Ticket.findById(ticket.id);

		expect(updatedTicket!.orderId).toEqual(data.id);
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

		expect(data.id).toEqual(ticketData.orderId);

	});
});
