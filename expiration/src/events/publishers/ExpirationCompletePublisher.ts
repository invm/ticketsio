import { Publisher, Subjects, ExpirationCompleteEvent } from "@invmtickets/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent > {
  readonly subject = Subjects.ExpirationComplete;
}
