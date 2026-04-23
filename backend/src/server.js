import buildApp from "./app.js";
import { env } from "./config/index.js";
import { setupGracefulShutdown } from "./bootstrap/graceful-shutdown.js";

const PORT = Number(env.PORT) || 4005;
const HOST = "127.0.0.1";

async function start() {
    const app = await buildApp();

    await app.listen({ port: PORT, host: HOST });

    console.log(`Server listening on http://${HOST}:${PORT}`);

    setupGracefulShutdown(app);
}

start().catch((err) => {
    console.error("Server startup failed");
    console.error(err);
    process.exit(1);
});
