import { Publisher, Subjects, PaymentCreatedEvent } from '@invmtickets/common';

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
	readonly subject = Subjects.PaymentCreated;
}
