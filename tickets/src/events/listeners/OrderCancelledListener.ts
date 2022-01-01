import { Listener, OrderCancelledEvent, Subjects } from '@invmtickets/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/TicketUpdatedPublisher';
import { queueGroupName } from './queue-group-name';

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
	readonly subject = Subjects.OrderCancelled;
	queueGroupName = queueGroupName;

	async onMessage(data: OrderCancelledEvent['data'], msg: Message) {
		// find the ticket that the order is reserving
		const ticket = await Ticket.findById(data.ticket.id);

		// if not ticket, throw error
		if (!ticket) throw new Error('Ticket not found');

		// mark the ticket as being unreserved by setting its orderId property to null
		ticket.set({ orderId: undefined });

		// save the ticket
		await ticket.save();

		// publish an event that the ticket has been changed
		await new TicketUpdatedPublisher(this.client).publish({
			id: ticket.id,
			title: ticket.title,
			price: ticket.price,
			userId: ticket.userId,
			version: ticket.version,
      orderId: ticket.orderId
		});

		// ack the message
		msg.ack();
	}
}

