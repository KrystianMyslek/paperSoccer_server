import { WebSocket } from "ws";

export interface Player {
	id: string;
	ws: WebSocket;
	name?: string;
}

export interface Lobby {
	id: string;
	player_A_id: string;
	player_B_id: string | null;
}

export interface Field {
	id: string;
	player_A_id: string;
	player_B_id: string;
}

export interface PlayerMap {
	[key: string]: Player;
}

export interface LobbyMap {
	[key: string]: Lobby;
}

export interface FieldMap {
	[key: string]: Field;
}
