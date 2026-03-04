import { PlayerMap, LobbyMap, GameMap, GameStateMap } from "../types";

export class Store {
	players: PlayerMap = {};
	lobbies: LobbyMap = {};
	waitingPlayers: PlayerMap = {};
	games: GameMap = {};
	gamesState: GameStateMap = {};
}
