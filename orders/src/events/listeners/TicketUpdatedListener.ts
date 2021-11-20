import { Message } from 'node-nats-streaming';
import { Subjects, Listener, TicketUpdatedEvent } from '@invmtickets/common';
import { Ticket } from '../../models/ticket';
import { QUEUE_GROUP_NAME } from './queue-group-name';

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
	readonly subject = Subjects.TicketUpdated;
	queueGroupName = QUEUE_GROUP_NAME;

	async onMessage(data: TicketUpdatedEvent['data'], msg: Message) {

		const { id, title, price } = data;

		const ticket = await Ticket.findById(id);

		if (!ticket) {
			throw new Error('Ticket not found');
		}

		ticket.set({ title, price });

		await ticket.save();

		msg.ack();
	}
}
