export function setupGracefulShutdown(server) {
    const shutdown = async () => {
        try {
            console.log("Shutting down...");
            await server.close();
            process.exit(0);
        } catch (err) {
            console.error("Shutdown error", err);
            process.exit(1);
        }
    };
    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
}
