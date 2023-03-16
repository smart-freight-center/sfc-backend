import { ApiServer } from "./api";

const apiAllowedOrigins = process.env.API_ALLOWED_ORIGINS || "";
const allowedOrigins = apiAllowedOrigins.split(",").filter(Boolean);
// const connectorRegistry = JSON.parse(
//   process.env.CONNECTOR_REGISTRY_CONFIG as string
// ) ?? {
//   id: "urn:connector:provider",
//   title: "provider.edc.think-it.io",
//   catalogId: "default",
//   description: "The provider connector for the EDC manager demo",
//   region: "eu-west-1",
//   addresses: {
//     default: "http://localhost:29191/api",
//     validation: "http://localhost:29292",
//     management: "http://localhost:29193/api/v1/data",
//     protocol: "http://provider-connector:9194/api/v1/ids",
//     dataplane: "http://localhost:29195",
//     public: "http://localhost:29291/public",
//     control: "http://localhost:29292/control",
//   },
// };
const server = ApiServer.create({
  cors: {
    allowedOrigins,
  },
});

const apiPort = process.env.API_PORT || 3000;

server.listen(apiPort as number);
console.log(`Listening on http://localhost:${apiPort}`);
