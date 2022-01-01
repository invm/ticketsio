import { TicketUpdatedEvent } from '@invmtickets/common';
import { natsWrapper } from '../../../nats-wrapper';
import { TicketUpdatedListener } from '../TicketUpdatedListener';
import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../../models/ticket';

const setup = async () => {
	// create an instance of the listener
	const listener = new TicketUpdatedListener(natsWrapper.client);

	const ticket = Ticket.build({
		id: new mongoose.Types.ObjectId().toHexString(),
		title: 'concert',
		price: 20,
	});

	await ticket.save();
	// create a fake data event
	const data: TicketUpdatedEvent['data'] = {
		id: ticket.id,
		version: ticket.version + 1,
		title: 'some different concert',
		price: 10,
		userId: new mongoose.Types.ObjectId().toHexString(),
	};

	// @ts-ignore
	const msg: Message = {
		ack: jest.fn(),
	};

	return { listener, data, msg, ticket };
};

describe('ticket updated listener test', () => {
	it('find, updates and saves a ticket', async () => {
		const { listener, data, msg, ticket } = await setup();

		await listener.onMessage(data, msg);
		const updatedTicket = await Ticket.findById(ticket.id);

		// write assertions to make sure that the ticket is created
		expect(updatedTicket!.title).toEqual(data.title);
		expect(updatedTicket!.price).toEqual(data.price);
		expect(updatedTicket!.version).toEqual(data.version);
	}),
		it('acks the message', async () => {
			const { listener, data, msg } = await setup();

			await listener.onMessage(data, msg);

			// write assertions to make sure that ask function is called
			expect(msg.ack).toHaveBeenCalled();
		});
	it('does not call ack if the event has skipped a version number', async () => {
		const { listener, data, msg } = await setup();

		data.version = 10;

		try {
			await listener.onMessage(data, msg);
		} catch (err) {}

		expect(msg.ack).not.toHaveBeenCalled();
	});
});
