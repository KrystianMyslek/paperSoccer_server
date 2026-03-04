import { Store } from "./Controllers/store";
import { Setup } from "./Controllers/setup";
import { Game } from "./Controllers/game";

export class Broker {
	public store = new Store();

	public setup = new Setup(this.store);
	public game = new Game(this.store);

	handleMessage(data: Buffer) {
		const msg = JSON.parse(data.toString());

		if (
			msg.controller === undefined ||
			msg.action === undefined ||
			msg.payload === undefined
		) {
			return console.error("Invalid message format:");
		} else {
			const { controller, action, payload } = msg;

			try {
				switch (controller) {
					case "setup":
						(this.setup as any)[action](...Object.values(payload));
						break;
					case "game":
						(this.game as any)[action](...Object.values(payload));
						break;
					default:
						console.error("Unknown controller:", controller);
				}
			} catch (error) {
				console.error("Error executing method:", error);
			}
		}
	}
}
