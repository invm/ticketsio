import nats, { Stan } from "node-nats-streaming";

class NatsWrapper {
  private _client?: Stan;

  get client() {
    if (!this._client) {
      throw new Error("Cannot access NATS before connecting");
    }

    return this._client;
  }
  connect(clustedId: string, clientId: string, url: string) {
    this._client = nats.connect(clustedId, clientId, {
      url,
      waitOnFirstConnect: true,
    });

    return new Promise<void>((resolve, reject) => {
      this.client.on("connect", () => {
        console.log("Connected to NATS");
        resolve();
      });

      this.client.on("error", (error) => {
        reject(error);
      });
    });
  }
}

export const natsWrapper = new NatsWrapper();
