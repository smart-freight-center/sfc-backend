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

3. The repository makes use of [git submodules](https://git-scm.com/book/en/v2/Git-Tools-Submodules); therefore, initiate submoduels once cloned on your local mahcine.

```sh
git submodule update --init
```

4. Run the project [this will start the server on port 3000]

```
yarn start
```

## Troubleshooting

Using git submodules can be troublesome, so, here's one tip.

When you want to update submodules to latest changes remember to pull from submodules too.

```sh
git pull --recurse-submodules
```

Once you updated git, remember also to update your Node.js dependencies.

```sh
yarn upgrade @think-it-labs/edc-connector-client
```
