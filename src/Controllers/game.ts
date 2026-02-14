import { GameCore } from "./gameCore";

export class Game extends GameCore {
	public setUsername(id: string, name: string) {
		const player = this.getPlayerById(id);
		if (player) {
			player.name = name;
		}
	}

	public enterWaitingRoom(id: string) {
		const player = this.getPlayerById(id);
		if (player) {
			this.waitingPlayers[id] = player;

			player.ws.send(
				JSON.stringify({
					type: "waiting_room_entered",
					payload: { id },
				}),
			);
		}
	}
}
