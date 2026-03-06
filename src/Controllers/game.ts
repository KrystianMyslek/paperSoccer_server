import { fieldPlayer } from "../types";
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

	public getAvailableMoves(player_id: string, game_id: string) {
		const [game, gameState] = this.getGameById(game_id);
		if (game && gameState) {
			const myMove = gameState.active_player_id === player_id;

			if (myMove) {
				gameState.available_moves = this.getCClearAvailableMoves(
					game.size.x,
					game.size.y,
				);

				const x = gameState.possition.x;
				const y = gameState.possition.y;

				gameState.available_moves.v_lines[x][y - 1] = true;
				gameState.available_moves.v_lines[x][y] = true;

				gameState.available_moves.h_lines[x][y] = true;
				gameState.available_moves.h_lines[x - 1][y] = true;

				gameState.available_moves.l_cross[x][y - 1] = true;
				gameState.available_moves.l_cross[x - 1][y] = true;

				gameState.available_moves.r_cross[x][y] = true;
				gameState.available_moves.r_cross[x - 1][y - 1] = true;
			}

			this.sendToOne(
				"available_moves",
				{
					myMove,
					availableMoves: gameState.available_moves,
				},
				player_id,
			);
		}
	}

	public makeMove(
		player_id: string,
		game_id: string,
		type: string,
		new_possition: { x: number; y: number },
	) {
		const [game, gameState] = this.getGameById(game_id);
		if (game && gameState) {
			const playerA = this.getPlayerById(game.player_A_id);
			const playerB = this.getPlayerById(game.player_B_id);

			const fieldPlayerType =
				player_id === game.player_A_id ? fieldPlayer.A : fieldPlayer.B;

			gameState.possition = new_possition;
			gameState.active_player_id =
				gameState.active_player_id === game.player_A_id
					? game.player_B_id
					: game.player_A_id;

			this.setGameState(game_id, gameState);

			if (game.player_A_id === player_id) {
			}
		}
	}

	public destroyGame(player_id: string) {
		const game = this.getGameByOwnerId(player_id);

		if (game && game.player_A_id === player_id) {
			if (game.player_B_id) {
				const playerB = this.getPlayerById(game.player_B_id);
				if (playerB) {
					this.sendToOne(
						"game_destroyed",
						{ game_id: game.id },
						playerB,
					);
				}
			}

			this.removeGame(game.id);
		}
	}
}
