import express from "express";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { connectDatabase } from "./db.js";
import { config } from "./config.js";
import { createScholarshipMcpServer } from "./mcp/server.js";

const app = express();

// Mapa para rastrear las sesiones activas: sessionId -> { transport, server }
const sessions = new Map();

// Endpoint SSE
app.get("/sse", async (req, res) => {
  // 1. Creamos una instancia fresca de McpServer para esta conexión específica
  const server = createScholarshipMcpServer();
  const transport = new SSEServerTransport("/messages", res);

  sessions.set(transport.sessionId, { transport, server });

  req.on("close", async () => {
    sessions.delete(transport.sessionId);
    await server.close();
  });

  // 2. Conectamos la instancia dedicada a este transporte
  await server.connect(transport);
});

// Endpoint POST de mensajes
app.post("/messages", express.text({ type: "*/*" }), async (req, res) => {
  const sessionId = req.query.sessionId;
  const session = sessions.get(sessionId);

  if (!session) {
    res.status(404).send("Session not found");
    return;
  }

  const parsedBody = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  await session.transport.handlePostMessage(req, res, parsedBody);
});

async function start() {
  await connectDatabase();
  app.listen(config.port, config.host, () => {
    console.log(`MCP server running at http://${config.host}:${config.port}`);
    console.log(`SSE endpoint: http://${config.host}:${config.port}/sse`);
  });
}

start().catch(console.error);