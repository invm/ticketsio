import { Publisher, Subjects, OrderCreatedEvent } from '@invmtickets/common';

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
	readonly subject = Subjects.OrderCreated;
}
