import { Lobby } from "../types";
import { GameCore } from "./gameCore";

export class Game extends GameCore {
	public setUsername(player_id: string, name: string) {
		const player = this.getPlayerById(player_id);
		if (player) {
			player.name = name;
		}
	}

	public enterWaitingRoom(player_id: string) {
		const player = this.getPlayerById(player_id);
		if (player) {
			this.waitingPlayers[player_id] = player;

			player.ws.send(
				JSON.stringify({
					type: "waiting_room_entered",
					payload: { player_id: player_id },
				}),
			);
		}
	}

	public leaveWaitingRoom(player_id: string) {
		const player = this.getPlayerById(player_id);
		if (player) {
			delete this.waitingPlayers[player_id];

			player.ws.send(
				JSON.stringify({
					type: "waiting_room_left",
					payload: { player_id: player_id },
				}),
			);
		}
	}

	public newLobby(
		player_id: string,
		name: string,
		owner: string,
		size: { x: number; y: number },
	) {
		const player = this.getPlayerById(player_id);
		if (player) {
			const lobby: Lobby = {
				name: name,
				size: size,
				player_A_id: player_id,
				player_A_name: owner,
			};

			const createdLobby = this.createLobby(lobby);

			player.ws.send(
				JSON.stringify({
					type: "lobby_created",
					payload: { lobby_id: createdLobby.id },
				}),
			);

			delete this.waitingPlayers[player_id];

			const payload = {
				id: createdLobby.id,
				name: createdLobby.name,
				owner: createdLobby.player_A_name,
				size: createdLobby.size,
			};

			this.sendToMany("new_lobby", payload, this.waitingPlayers);
		}
	}
}
