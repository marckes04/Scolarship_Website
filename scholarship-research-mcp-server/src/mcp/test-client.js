import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";

async function main() {
  console.log("Conectando con el servidor MCP en http://127.0.0.1:3000/sse...");

  // 1. Establecer conexión SSE
  const transport = new SSEClientTransport(new URL("http://127.0.0.1:3000/sse"));
  const client = new Client(
    { name: "test-client", version: "1.0.0" },
    { capabilities: {} }
  );

  await client.connect(transport);
  console.log("✓ Handshake MCP exitoso.\n");

  // 2. Listar herramientas disponibles
  const tools = await client.listTools();
  console.log("✓ Herramientas detectadas:", tools.tools.map((t) => t.name).join(", "));

  // 3. Ejecutar la herramienta search_scholarships contra MongoDB
  console.log("\nEjecutando herramienta 'search_scholarships' (query: 'Science')...\n");
  const result = await client.callTool({
    name: "search_scholarships",
    arguments: {
      query: "Science",
    },
  });

  console.log("=== RESULTADO OBTENIDO DE MONGODB ATLAS ===");
  console.log(result.content[0].text);
  console.log("===========================================\n");

  await client.close();
  console.log("✓ Prueba completada con éxito.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error durante la prueba:", err);
  process.exit(1);
});