import { TicketCreatedEvent } from '@invmtickets/common';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketCreatedListener } from '../TicketCreatedListener';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
	// create an instance of the listener
	const listener = new TicketCreatedListener(natsWrapper.client);

	// create a fake data event
	const data: TicketCreatedEvent['data'] = {
		id: new mongoose.Types.ObjectId().toHexString(),
		version: 0,
		title: 'concert',
		price: 10,
		userId: new mongoose.Types.ObjectId().toHexString(),
	};

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return { listener, data, msg };
};

describe('ticket created listener test', () => {
	it('creates and saves a ticket', async () => {
		const { listener, data, msg } = await setup();

		await listener.onMessage(data, msg);
		const ticket = await Ticket.findById(data.id);

		// write assertions to make sure that the ticket is created
		expect(ticket).toBeDefined();
		expect(ticket!.title).toEqual(data.title);
		expect(ticket!.price).toEqual(data.price);
	}),
		it('acks the message', async () => {
			const { listener, data, msg } = await setup();

			await listener.onMessage(data, msg);

			// write assertions to make sure that ask function is called
			expect(msg.ack).toHaveBeenCalled();
		});
});
