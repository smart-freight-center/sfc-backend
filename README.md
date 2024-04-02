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

### Run App Dependencies using Docker Compose

The project is dependent on [KeyCloak](https://www.keycloak.org/getting-started/getting-started-docker) , [Redis](https://redis.io/docs/getting-started/installation/install-redis-on-mac-os/) and the EDC Connector

You can spin up all those dependencies by running

```sh
docker-compose up
```

### Postman Docs for V1

View Postman Docs [here](https://documenter.getpostman.com/view/27072999/2s9YXia2Sj)

### Using docker for local development

Running the `docker-compose up` command will start:

- redis-server
- keycloak-server
- edc-manager

### Requirements

- [Node.js®](https://nodejs.org/en/) - the JavaScript runtime
- [direnv](https://direnv.net/)

Before [starting the development servers](#start-the-development-servers), create a `.envrc` file with the following content:

```sh
export SFCAPI_BASEURL='<ask your team for the sfcapi_baseurl>'
export REDIS_URL='<ask your team for the redis_url>'

export REDIS_HOST='<ask your team for the redis host>'
export REDIS_PORT='<ask your team for the redis port>'
export REDIS_DATABASE='<ask your team for the redis  database'>
export SUPPORTED_EDC_FILTER_OPERATORS='='
export CR_PAT='<ask your team for the cr_pat>'

export CONSUMER_CONNECTOR_CONFIG='<ask your team for the config>'
export PROVIDER_CONNECTOR_CONFIG='<ask your team for the config>'

export KEYCLOAK_HOST='<ask your team for the keycloak host>'
export KEYCLOAK_PORT='<ask your team for the keycloak port>'

export KEYCLOAK_ADMIN="<set the keycloak admin username>"
export KEYCLOAK_ADMIN_PASSWORD='<set the keycloak admin password>'


export AWS_REGION="<ask your team for the aws region>"
export AWS_ACCESS_ID="<ask your team for the aws access id>"
export AWS_SECRET="<ask your team for the aws secret>"


export PROVIDER_KEYCLOAK_PUBLIC_KEY='<get the public key from keycloak>'

export CONSUMER_KEYCLOAK_PUBLIC_KEY='<get the public key from keycloak>'

```

## Abstract

\*\*The MVP version aims to ensure that all participants use a consistent and interoperable framework, allowing for seamless data exchange and collaboration.

## Getting started

Before starting, make sure you have adequate access to AWS services. If you need to request access, please reach out to AWS owners. Your direct lead can help you too.

You need to retrieve the required environment variables from the project lead or from other team members. You'll have to define these environment variables in your shell or use a tool like [direnv](https://direnv.net/) that can load and unload environment variables depending on the current directory.

### Start development servers

It is necessary to spin up all services to start the development process effectively.

Open **three** terminal windows and enter the following commands:

```sh
docker-compose up # start docker containers for redis-server, keycloak and both edc provider and consumer connector
yarn dev:provider # starts the development `provider` server
yarn dev:consumer # starts the development `consumer` server
```

Also start the sfc-unit after cloning and installing it from [sfc-unit repo](https://github.com/smart-freight-center/sfc-unit)

```sh
yarn dev
```

## Architecture

see [Component Level Architecture diagram](https://www.notion.so/think-it/Component-Level-Architecture-39c73e35747d49739132b52d29a1e640?pvs=4#3cfb8790eda04ee0b8d7df55208fc89a)

### Tech stack

The entire system is built on the _Node.js®_ runtime and written in _TypeScript_.

- [Node.js®](https://nodejs.org/en/)
- [TypeScript](https://www.typescriptlang.org/)

The `core` library tries to have the least number of dependencies. The two important ones are the _services_ and the _usecases_.

The `api` service aims to be a thin integration layer between the `core` library and the external enpoint. Here the server is a slim _Koa_ instance.

- [Koa](https://koajs.com/)

The Node environment is eventually wrapped in a _Docker_ image based on _Alpine Linux_.

- [Alpine Linux](https://www.alpinelinux.org/)
- [Docker](https://www.docker.com/)

### Features Branch:

Each commit is pushed from a feature branch will activate a pipeline that incudes 2 stages **Lint** and **Test**.

### Main Branch:

Once a merge request is accepted to the main branch will provoke 3 jobs **Lint**, **Test**, **Development** and **Production**.

### Github Actions

The sfc-backend uses Github Actions and Github Secrets for the CI/CD.
Available workflows:

1. [Node.js CI: Run tests](.github/workflows/run-tests.yaml)
2. [Notion Board](.github/workflows/issues-notion-sync.yml)
3. [Create and publish a Docker image to Amazon ECR](.github/workflows/publish-image.yml)

#### Notion Board

- **Triggered by**: issue or issue_comment creation
- **Watches**: all files.
- **Steps**
  1. Update changes in Notion board

#### Create and publish a Docker image

- **Triggered by**: on any push to branch main
- **Watches**: all files.
- **Steps**
  1. Checkout repository
  2. Login to ECR
  3. Build image and push it to AWS ECR

#### Node.js CI

- **Triggered by**: any push to all branches
- **Watches**: all files.
- **Steps**
  1. Setup Node.js
  2. Install dependencies using Yarn.
  3. Run unit tests.
  4. Run integration tests.
  5. Check liniting.

<!-- ## Resources -->

<!-- - [Technical specifications](./docs/tech-specs.md) -->
