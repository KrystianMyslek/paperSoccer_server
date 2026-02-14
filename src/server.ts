import * as dotenv from "dotenv";
dotenv.config();

import { WebSocket, WebSocketServer } from "ws";
import { Game } from "./Controllers/game";

const wsPort = parseInt(process.env.WS_PORT || "8080");

const wss = new WebSocketServer({ port: wsPort });

const game = new Game();

function handleMessage(data: Buffer) {
	const msg = JSON.parse(data.toString());

	if (msg.action === undefined || msg.payload === undefined) {
		return console.error("Invalid message format:");
	} else {
		const { action, payload } = msg;

		try {
			(game as any)[action](...Object.values(payload));
		} catch (error) {
			console.error("Error executing method:", error);
		}
	}
}

wss.on("connection", (ws: WebSocket) => {
	const id = game.createPlayer(ws);

	if (id === null) {
		return console.error("Failed to create player");
	} else {
		const cretePlayerMessage = JSON.stringify({
			type: "open",
			payload: { id },
		});

		ws.send(cretePlayerMessage);
	}

	ws.on("message", (data: Buffer) => {
		handleMessage(data);
	});

	ws.on("close", (data) => {
		game.removePlayer(id);
	});

	ws.on("error", console.error);
});
