import { Publisher, Subjects, TicketCreatedEvent } from '@invmtickets/common';

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
	readonly subject = Subjects.TicketCreated;
}
