import { WebSocket } from "ws";
import { PlayerMap, LobbyMap, FieldMap, Player, Lobby } from "../types";
import { v4 as uuidv4 } from "uuid";

export class Core {
	players: PlayerMap = {};
	lobbies: LobbyMap = {};
	waitingPlayers: PlayerMap = {};
	fields: FieldMap = {};

	protected sendToOne(
		type: string,
		payload: any,
		recipient: string | Player,
	) {
		if (typeof recipient === "string") {
			recipient = this.getPlayerById(recipient) as Player;
		}
		if (recipient) {
			recipient.ws.send(
				JSON.stringify({
					type: type,
					payload: payload,
				}),
			);
		}
	}

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

	protected getPlayers() {
		return this.players;
	}

	protected getPlayerById(player_id: string) {
		const player = this.players[player_id];
		if (player !== undefined) {
			return player;
		}
		return null;
	}

	protected setPlayerName(player_id: string, name: string) {
		const player = this.getPlayerById(player_id);
		if (player) {
			player.name = name;
		}
	}

	protected createPlayer(ws: WebSocket) {
		const id = uuidv4();
		this.players[id] = { id: id, ws: ws };

		return id;
	}

	protected removePlayer(player_id: string) {
		if (player_id !== undefined) {
			delete this.players[player_id];
		}
	}

	protected createLobby(data: Omit<Lobby, "id">) {
		const id = uuidv4();

		const lobby: Lobby = {
			id: id,
			...data,
		};

		this.lobbies[id] = lobby;

		return this.lobbies[id];
	}

	protected joinLobby(player: Player, lobby: Lobby) {
		if (lobby) {
			lobby.player_B_id = player.id;
		}
	}

	protected removeLobby(lobby_id: string) {
		if (lobby_id !== undefined) {
			delete this.lobbies[lobby_id];
		}
	}

	protected getLobbies() {
		return this.lobbies;
	}

	protected getAppLobbies() {
		const lobbies = [];
		for (const lobby in this.lobbies) {
			const lobbyData = {
				id: this.lobbies[lobby].id,
				name: this.lobbies[lobby].name,
				owner: this.lobbies[lobby].player_A_name,
				size: this.lobbies[lobby].size,
			};
			lobbies.push(lobbyData);
		}
		return lobbies;
	}

	protected getLobbyById(lobby_id: string) {
		const lobby = this.lobbies[lobby_id];
		if (lobby !== undefined) {
			return lobby;
		}
		return null;
	}

	protected getLobbyByOwnerId(owner_id: string) {
		for (const lobby_id in this.lobbies) {
			const lobby = this.lobbies[lobby_id];
			if (lobby.player_A_id === owner_id) {
				return lobby;
			}
		}
		return null;
	}

	protected getAppLobby(lobby: Lobby | string) {
		if (typeof lobby === "string") {
			lobby = this.getLobbyById(lobby) as Lobby;
		}

		if (lobby !== null) {
			const lobbyData = {
				id: lobby.id,
				name: lobby.name,
				owner: lobby.player_A_name,
				opponent: lobby.player_B_id
					? this.getPlayerById(lobby.player_B_id)?.name || "Unknown"
					: null,
				size: lobby.size,
			};
			return lobbyData;
		}
		return null;
	}

	protected createField(player_A_id: string, player_B_id: string) {
		const id = uuidv4();
		this.fields[id] = {
			id: id,
			player_A_id: player_A_id,
			player_B_id: player_B_id,
		};

		return this.fields[id];
	}

	protected removeField(field_id: string) {
		if (field_id !== undefined) {
			delete this.fields[field_id];
		}
	}

	protected getFieldById(field_id: string) {
		const field = this.fields[field_id];
		if (field !== undefined) {
			return field;
		}
		return null;
	}
}
