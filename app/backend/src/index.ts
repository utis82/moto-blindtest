import { createServer } from "./app";

const app = createServer();
const port = Number(process.env.PORT) || 4000;

app.listen(port, () => {
  console.log(`Moto blind test API ready on http://localhost:${port}`);
});

