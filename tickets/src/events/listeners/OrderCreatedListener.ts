import { Listener, OrderCreatedEvent, Subjects } from '@invmtickets/common';
import { Message } from 'node-nats-streaming';
import { Ticket } from '../../models/ticket';
import { TicketUpdatedPublisher } from '../publishers/TicketUpdatedPublisher';
import { queueGroupName } from './queue-group-name';

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
	readonly subject = Subjects.OrderCreated;
	queueGroupName = queueGroupName;

	async onMessage(data: OrderCreatedEvent['data'], msg: Message) {
		// find the ticket that the order is reserving
		const ticket = await Ticket.findById(data.ticket.id);

		// if not ticket, throw error
		if (!ticket) throw new Error('Ticket not found');

		// mark the ticket as being reserved by setting its orderId property
		ticket.set({ orderId: data.id });

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
