import { randomBytes } from "crypto";
import nats from "node-nats-streaming";
import { TicketCreatedPublisher } from "./events/ticket-created-publisher";

console.clear();

const client = nats.connect("ticketsio", "abc", {
  url: "http://localhost:4222",
});

client.on("connect", async () => {
  console.log("publisher connected to nats");
  const publisher = new TicketCreatedPublisher(client);
  try {
    await publisher.publish({
      id: randomBytes(4).toString("hex"),
      title: randomBytes(4).toString("hex"),
      price: Math.floor(Math.random() * 100),
    });
  } catch (err) {
    console.error(err);
  }
});

process.on("SIGINT", () => client.close());
process.on("SIGTERM", () => client.close());
