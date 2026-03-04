import { WebSocket } from "ws";
import {
	PlayerMap,
	Player,
	Lobby,
	Game,
	GameState,
	fieldPlayer,
} from "../types";
import { v4 as uuidv4 } from "uuid";
import { Store } from "./store";

export class Core {
	constructor(protected store: Store) {}

	protected sendToOne(
		type: string,
		payload: any,
		recipient: string | Player,
	): void {
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

	protected sendToFew(
		type: string,
		payload: any,
		recipients: Player[],
	): void {
		for (const recipient of recipients) {
			recipient.ws.send(
				JSON.stringify({
					type: type,
					payload: payload,
				}),
			);
		}
	}

	protected sendToMany(
		type: string,
		payload: any,
		recipients?: PlayerMap,
	): void {
		const recipientsToSend = recipients ? recipients : this.store.players;

		for (const recipient in recipientsToSend) {
			recipientsToSend[recipient].ws.send(
				JSON.stringify({
					type: type,
					payload: payload,
				}),
			);
		}
	}

	protected getPlayers() {
		return this.store.players;
	}

	protected getPlayerById(player_id: string) {
		const player = this.store.players[player_id];
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
		this.store.players[id] = { id: id, ws: ws };

		return id;
	}

	protected removePlayer(player_id: string) {
		if (player_id !== undefined) {
			delete this.store.players[player_id];
		}
	}

	protected createLobby(data: Omit<Lobby, "id">) {
		const id = uuidv4();

		const lobby: Lobby = {
			id: id,
			...data,
		};

		this.store.lobbies[id] = lobby;

		return this.store.lobbies[id];
	}

	protected joinLobby(player: Player, lobby: Lobby) {
		if (lobby) {
			lobby.player_B_id = player.id;
		}
	}

	protected removeLobby(lobby_id: string) {
		if (lobby_id !== undefined) {
			delete this.store.lobbies[lobby_id];
		}
	}

	protected getLobbies() {
		return this.store.lobbies;
	}

	protected getAppLobbies() {
		const lobbies = [];
		for (const lobby in this.store.lobbies) {
			const owner = this.getPlayerById(
				this.store.lobbies[lobby].player_A_id,
			) as Player;

			const lobbyData = {
				id: this.store.lobbies[lobby].id,
				name: this.store.lobbies[lobby].name,
				owner: {
					id: owner.id,
					name: owner.name,
				},
				size: this.store.lobbies[lobby].size,
			};
			lobbies.push(lobbyData);
		}
		return lobbies;
	}

	protected getLobbyById(lobby_id: string) {
		const lobby = this.store.lobbies[lobby_id];
		if (lobby !== undefined) {
			return lobby;
		}
		return null;
	}

	protected getLobbyByOwnerId(owner_id: string) {
		for (const lobby_id in this.store.lobbies) {
			const lobby = this.store.lobbies[lobby_id];
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
			const owner = this.getPlayerById(lobby.player_A_id) as Player;
			const opponent = lobby.player_B_id
				? (this.getPlayerById(lobby.player_B_id) as Player)
				: null;

			const lobbyData = {
				id: lobby.id,
				name: lobby.name,
				owner: {
					id: owner.id,
					name: owner.name,
				},
				opponent: opponent
					? {
							id: opponent.id,
							name: opponent.name,
						}
					: null,
				size: lobby.size,
			};
			return lobbyData;
		}
		return null;
	}

	protected createGame(lobby: Lobby): [Game, GameState] {
		const id = uuidv4();

		let active_player_id = null;

		if (lobby.player_A_id && lobby.player_B_id) {
			active_player_id =
				Math.random() < 0.5 ? lobby.player_A_id : lobby.player_B_id;

			this.store.games[id] = {
				id: id,
				name: lobby.name,
				size: lobby.size,
				player_A_id: lobby.player_A_id,
				player_B_id: lobby.player_B_id,
			};

			this.store.gamesState[id] = {
				active_player_id: active_player_id,
				possition: {
					x: <number>Math.floor(lobby.size.x / 2),
					y: <number>Math.floor(lobby.size.y / 2),
				},
				done_moves: {
					v_lines: <fieldPlayer[][]>(
						this.newMoveArray(
							lobby.size.x,
							lobby.size.y,
							fieldPlayer.empty,
						)
					),
					h_lines: <fieldPlayer[][]>(
						this.newMoveArray(
							lobby.size.x,
							lobby.size.y,
							fieldPlayer.empty,
						)
					),
					l_cross: <fieldPlayer[][]>(
						this.newMoveArray(
							lobby.size.x,
							lobby.size.y,
							fieldPlayer.empty,
						)
					),
					r_cross: <fieldPlayer[][]>(
						this.newMoveArray(
							lobby.size.x,
							lobby.size.y,
							fieldPlayer.empty,
						)
					),
				},
				available_moves: {
					v_lines: <boolean[][]>(
						this.newMoveArray(lobby.size.x, lobby.size.y, false)
					),
					h_lines: <boolean[][]>(
						this.newMoveArray(lobby.size.x, lobby.size.y, false)
					),
					l_cross: <boolean[][]>(
						this.newMoveArray(lobby.size.x, lobby.size.y, false)
					),
					r_cross: <boolean[][]>(
						this.newMoveArray(lobby.size.x, lobby.size.y, false)
					),
				},
			};
		}

		return [this.store.games[id], this.store.gamesState[id]];
	}

	private newMoveArray(x: number, y: number, fill: any): any[][] {
		return Array(x)
			.fill(fill)
			.map(() => Array(y).fill(fill));
	}

	protected removeGame(game_id: string) {
		if (game_id !== undefined) {
			delete this.store.games[game_id];
			delete this.store.gamesState[game_id];
		}
	}

	protected getGameById(game_id: string): [Game | null, GameState | null] {
		const game = this.store.games[game_id];
		const gameState = this.store.gamesState[game_id];
		if (game !== undefined && gameState !== undefined) {
			return [game, gameState];
		}
		return [null, null];
	}
}
