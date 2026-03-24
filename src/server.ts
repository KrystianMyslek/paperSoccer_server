import * as dotenv from "dotenv";
dotenv.config();

import { WebSocket, WebSocketServer } from "ws";
import { Broker } from "./broker";

const wsPort = parseInt(process.env.WS_PORT || "8080");
const wssEnabled = process.env.WSS !== "false";

let wss = null;
let server = null;

if (wssEnabled) {
	const https = require("https");
	const fs = require("fs");

	server = https.createServer({
		cert: fs.readFileSync(process.env.CERT_PATH || ""),
		key: fs.readFileSync(process.env.KEY_PATH || ""),
	});

	wss = new WebSocketServer({ server });
} else {
	wss = new WebSocketServer({ port: wsPort });
}

const broker = new Broker();

wss.on("connection", (ws: WebSocket) => {
	const id = broker.setup.createPlayer(ws);

	if (id === null) {
		return console.error("Failed to create player");
	} else {
		ws.send(
			JSON.stringify({
				type: "open",
				payload: { id },
			}),
		);
	}

	ws.on("message", (data: Buffer) => {
		broker.handleMessage(data);
	});

	ws.on("close", (data) => {
		broker.setup.removePlayer(id);
	});

	ws.on("error", console.error);
});

if (server) {
	server.listen(wsPort, () => {
		console.log("Serwer WSS działa na porcie " + wsPort);
	});
}
