import { WebSocket } from "ws";

export enum fieldPlayer {
	empty = 0,
	A = 1,
	B = 2,
}

export interface GameMoves {
	v_lines: fieldPlayer[][];
	h_lines: fieldPlayer[][];
	l_cross: fieldPlayer[][];
	r_cross: fieldPlayer[][];
}

export interface AvailableGameMoves {
	v_lines: boolean[][];
	h_lines: boolean[][];
	l_cross: boolean[][];
	r_cross: boolean[][];
}

export interface Player {
	id: string;
	ws: WebSocket;
	name?: string;
}

export interface Lobby {
	id: string;
	name: string;
	size: { x: number; y: number };
	player_A_id: string;
	player_B_id?: string;
}

export interface Game {
	id: string;
	name: string;
	size: { x: number; y: number };
	player_A_id: string;
	player_B_id: string;
}

export interface GameState {
	active_player_id: string;
	possition: { x: number; y: number };
	done_moves: GameMoves;
	available_moves: AvailableGameMoves;
}

export interface PlayerMap {
	[key: string]: Player;
}

export interface LobbyMap {
	[key: string]: Lobby;
}

export interface GameMap {
	[key: string]: Game;
}

export interface GameStateMap {
	[key: string]: GameState;
}
