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
			this.sendToMany("lobby_destroyed", { lobby_id: lobby.id }, this.store.waitingPlayers);

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

			gameState.available_moves = this.getCClearAvailableMoves(game.size.x, game.size.y);

			if (myMove) {
				const x = gameState.possition.x;
				const y = gameState.possition.y;

				const border = x == 0 || y == 0 || x == game.size.x || y == game.size.y;

				if (border) {
					if (x == 0) {
						gameState.available_moves.h_lines[x][y] = true;
						gameState.available_moves.l_cross[x][y - 1] = true;
						gameState.available_moves.r_cross[x][y] = true;
					} else if (x == game.size.x) {
						gameState.available_moves.h_lines[x - 1][y] = true;
						gameState.available_moves.l_cross[x - 1][y] = true;
						gameState.available_moves.r_cross[x - 1][y - 1] = true;
					} else if (y == 0) {
						gameState.available_moves.v_lines[x][y] = true;
						gameState.available_moves.l_cross[x - 1][y] = true;
						gameState.available_moves.r_cross[x][y] = true;
					} else if (y == game.size.y) {
						gameState.available_moves.v_lines[x][y - 1] = true;
						gameState.available_moves.l_cross[x][y - 1] = true;
						gameState.available_moves.r_cross[x - 1][y - 1] = true;
					}
				} else {
					gameState.available_moves.v_lines[x][y - 1] = true;
					gameState.available_moves.v_lines[x][y] = true;

					gameState.available_moves.h_lines[x][y] = true;
					gameState.available_moves.h_lines[x - 1][y] = true;

					gameState.available_moves.l_cross[x][y - 1] = true;
					gameState.available_moves.l_cross[x - 1][y] = true;

					gameState.available_moves.r_cross[x][y] = true;
					gameState.available_moves.r_cross[x - 1][y - 1] = true;
				}
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

			if (!playerA || !playerB) {
				return;
			}

			let move_possition = {
				x: new_possition.x,
				y: new_possition.y,
			};

			switch (type) {
				case "v_lines":
					if (gameState.possition.y === new_possition.y) {
						new_possition.y += 1;
					}
					break;
				case "h_lines":
					if (gameState.possition.x === new_possition.x) {
						new_possition.x += 1;
					}
					break;
				case "l_cross":
					if (gameState.possition.x === new_possition.x) {
						new_possition.x += 1;
					} else {
						new_possition.y += 1;
					}
					break;
				case "r_cross":
					if (gameState.possition.y === new_possition.y) {
						new_possition.x += 1;
						new_possition.y += 1;
					}
					break;
				default:
					return;
			}

			const fieldPlayerType = player_id === game.player_A_id ? fieldPlayer.A : fieldPlayer.B;

			gameState.done_moves[type][move_possition.x][move_possition.y] = fieldPlayerType;
			gameState.possition = new_possition;
			gameState.active_player_id =
				gameState.active_player_id === game.player_A_id ? game.player_B_id : game.player_A_id;

			this.setGameState(game_id, gameState);

			this.sendToFew(
				"end_move",
				{
					doneMoves: gameState.done_moves,
					active: gameState.possition,
				},
				[playerA, playerB],
			);
		}
	}

	public destroyGame(player_id: string) {
		const game = this.getGameByOwnerId(player_id);

		if (game && game.player_A_id === player_id) {
			if (game.player_B_id) {
				const playerB = this.getPlayerById(game.player_B_id);
				if (playerB) {
					this.sendToOne("game_destroyed", { game_id: game.id }, playerB);
				}
			}

			this.removeGame(game.id);
		}
	}
}
