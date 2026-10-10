import http from "node:http";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { connectDatabase } from "./db.js";
import { config } from "./config.js";
import { createScholarshipMcpServer } from "./mcp/server.js";

const mcpServer = createScholarshipMcpServer();
const transports = new Map();

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === "GET" && url.pathname === "/sse") {
    const transport = new SSEServerTransport("/messages", res);
    transports.set(transport.sessionId, transport);

    req.on("close", () => {
      transports.delete(transport.sessionId);
    });

    await mcpServer.connect(transport);
    return;
  }

  if (req.method === "POST" && url.pathname === "/messages") {
    const sessionId = url.searchParams.get("sessionId");
    const transport = transports.get(sessionId);

    if (!transport) {
      res.writeHead(404).end("Session not found");
      return;
    }

    await transport.handlePostMessage(req, res);
    return;
  }

  res.writeHead(404).end("Not Found");
});

async function start() {
  await connectDatabase();
  server.listen(config.port, config.host, () => {
    console.log(`MCP server running at http://${config.host}:${config.port}`);
    console.log(`SSE endpoint: http://${config.host}:${config.port}/sse`);
  });
}

start().catch(console.error);