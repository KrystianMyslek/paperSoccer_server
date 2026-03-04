import { Core } from "./core";

export class Game extends Core {
	public newGame(player_id: string, lobby_id: string) {
		const lobby = this.getLobbyById(lobby_id);
		if (lobby && lobby.player_A_id && lobby.player_B_id) {
			const playerA = this.getPlayerById(lobby.player_A_id);
			const playerB = this.getPlayerById(lobby.player_B_id);

			const [game, gameState] = this.createGame(lobby);

			this.removeLobby(lobby.id);
			this.sendToMany(
				"lobby_destroyed",
				{ lobby_id: lobby.id },
				this.store.waitingPlayers,
			);

			if (playerA && playerB) {
				this.sendToFew(
					"game_created",
					{
						game: game,
					},
					[playerA, playerB],
				);
			}
		}
	}
}
