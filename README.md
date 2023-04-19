# sfc-backend

This repository contains the SFC backend app and a RESTful API using TypeScript and Koa.

## Features

Uses Koa and TypeScript for improved performance and type safety
Implements a simple RESTful API with CRUD operations for app resources

## Installation

To install the project, follow these steps:

1. Clone the repository using HTTPS or SSH
2. Install dependencies

```
yarn
```

3. Spin up a KeyCloak server by running [KeyCloak](https://www.keycloak.org/getting-started/getting-started-docker) with the following command:

```bash
docker run -p 8080:8080 -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin quay.io/keycloak/keycloak:21.0.1 start-dev

```

To get a quick dive on how to setup KeyCloak take a look at [this video](https://www.youtube.com/watch?v=duawSV69LDI&t=382s&ab_channel=StianThorgersen). This project uses OpenID Connect [client_credentials](https://www.rfc-editor.org/rfc/rfc6749#section-4.4) to authenticate all users in the project.

4. Use the .env.sample to create .env variables

5. Run the project this will start the server on port 3000

```
yarn dev
```

### Running Redis

Follow [this](https://redis.io/docs/getting-started/installation/install-redis-on-mac-os/) instruction to install redis on your MacOS

Once redis is installed you can run it with:

```bash
 redis-server
```

#### Postman Docs

View Postman Docs here [![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/4208573-c278aa53-81d5-4511-839d-bb8b3b90dcad?action=collection%2Ffork&collection-url=entityId%3D4208573-c278aa53-81d5-4511-839d-bb8b3b90dcad%26entityType%3Dcollection%26workspaceId%3Dda069bda-ef41-4880-addf-f4e466564e79)
