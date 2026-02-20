import { Lobby, Player } from "../types";
import { Core } from "./core";

import { WebSocket } from "ws";

export class Setup extends Core {
	public createPlayer(ws: WebSocket): string {
		return super.createPlayer(ws);
	}

	public removePlayer(player_id: string): void {
		super.removePlayer(player_id);
	}

	public enterWaitingRoom(player_id: string, username: string) {
		const player = this.getPlayerById(player_id);

		if (player) {
			this.setPlayerName(player_id, username);
			this.waitingPlayers[player_id] = player;

			player.ws.send(
				JSON.stringify({
					type: "waiting_room_entered",
					payload: {
						player_id: player_id,
					},
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

	public getLobbiesList(player_id: string): void {
		const player = this.getPlayerById(player_id);
		if (player) {
			this.sendToOne(
				"lobbies_list",
				{ lobbies: this.getAppLobbies() },
				player,
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
			const data = {
				name: name,
				size: size,
				player_A_id: player_id,
				player_A_name: owner,
			};

			const createdLobby = this.createLobby(data);

			const payload = {
				lobby: {
					id: createdLobby.id,
					name: createdLobby.name,
					owner: createdLobby.player_A_name,
					size: createdLobby.size,
				},
			};

			delete this.waitingPlayers[player_id];

			this.sendToOne("lobby_created", payload, player);
			this.sendToMany("new_lobby", payload, this.waitingPlayers);
		}
	}

	public enterLobby(player_id: string, lobby_id: string) {
		const player = this.getPlayerById(player_id);
		const lobby = this.getLobbyById(lobby_id);
		if (player && lobby) {
			this.joinLobby(player, lobby);

			delete this.waitingPlayers[player_id];

			const payload = {
				lobby: this.getAppLobby(lobby),
			};

			this.sendToOne("lobby_entered", payload, lobby.player_A_id);
			this.sendToOne("lobby_joined", payload, player);
			this.sendToMany(
				"lobby_destroyed",
				{ lobby_id },
				this.waitingPlayers,
			);
		}
	}

	public destroyLobby(player_id: string) {
		const lobby = this.getLobbyByOwnerId(player_id);

		if (lobby && lobby.player_A_id === player_id) {
			this.removeLobby(lobby.id);

			this.sendToMany(
				"lobby_destroyed",
				{ lobby_id: lobby.id },
				this.waitingPlayers,
			);
		}
	}
}
