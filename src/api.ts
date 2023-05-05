import { setupApi } from "./app";

async function startServer() {
  const app = await setupApi();

  const port = 3000;

  app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
  });
}

(async () => {
  await startServer();
})();
