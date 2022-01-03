import { Publisher, Subjects, OrderCancelledEvent } from '@invmtickets/common';

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
	readonly subject = Subjects.OrderCancelled;
}
