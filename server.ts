import { ApiServer } from "./api";

const apiPort = process.env.API_PORT || 3000;
const apiAllowedOrigins = process.env.API_ALLOWED_ORIGINS || "";
const allowedOrigins = apiAllowedOrigins.split(",").filter(Boolean);

const server = ApiServer.create({
  cors: {
    allowedOrigins,
  },
});

server.listen(apiPort as number);
console.log(`Listening on http://localhost:${apiPort}`);