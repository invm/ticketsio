import { Publisher, Subjects, TicketUpdatedEvent } from "@invmtickets/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
