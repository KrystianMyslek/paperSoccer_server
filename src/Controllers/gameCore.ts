import { WebSocket } from "ws";
import { PlayerMap, LobbyMap, FieldMap, Player, Lobby } from "../types";
import { v4 as uuidv4 } from "uuid";

export class GameCore {
	players: PlayerMap = {};
	lobbies: LobbyMap = {};
	waitingPlayers: PlayerMap = {};
	fields: FieldMap = {};

	protected sendToMany(type: string, payload?: any, recipients?: PlayerMap) {
		const recipientsToSend = recipients ? recipients : this.players;

		for (const recipient in recipientsToSend) {
			const waitingPlayer = recipientsToSend[recipient];
			waitingPlayer.ws.send(
				JSON.stringify({
					type: type,
					payload: payload,
				}),
			);
		}
	}

	public getPlayers() {
		return this.players;
	}

	public getPlayerById(id: string) {
		const player = this.players[id];
		if (player !== undefined) {
			return player;
		}
		return null;
	}

	public createPlayer(ws: WebSocket) {
		const id = uuidv4();
		this.players[id] = { id: id, ws: ws };

		return id;
	}

	public addPlayer(player: Player) {
		this.players[player.id] = player;

		return player;
	}

	public removePlayer(id: string) {
		if (id !== undefined) {
			delete this.players[id];
		}
	}

	public createLobby(lobby: Lobby) {
		const id = uuidv4();

		lobby.id = id;
		this.lobbies[id] = lobby;

		return this.lobbies[id];
	}

	public joinLobby(lobby_id: string, player_id: string) {
		const lobby = this.lobbies[lobby_id];
		if (lobby) {
			lobby.player_B_id = player_id;
		}
	}

	public removeLobby(id: string) {
		if (id !== undefined) {
			delete this.lobbies[id];
		}
	}

	public getLobbies() {
		return this.lobbies;
	}

	public getLobbyById(id: string) {
		const lobby = this.lobbies[id];
		if (lobby !== undefined) {
			return lobby;
		}
		return null;
	}

	public createField(player_A_id: string, player_B_id: string) {
		const id = uuidv4();
		this.fields[id] = {
			id: id,
			player_A_id: player_A_id,
			player_B_id: player_B_id,
		};

		return this.fields[id];
	}

	public removeField(id: string) {
		if (id !== undefined) {
			delete this.fields[id];
		}
	}

	public getFieldById(id: string) {
		const field = this.fields[id];
		if (field !== undefined) {
			return field;
		}
		return null;
	}
}
