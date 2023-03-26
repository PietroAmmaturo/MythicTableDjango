<div align="center">

![Mythic Table](/docs/images/logo-long-black-white.png)

</div>

[![codecov](https://codecov.io/gl/mythicteam/mythictable/branch/main/graph/badge.svg?token=T71WDHV4QZ)](https://codecov.io/gl/mythicteam/mythictable)

# Mythic Table

**Welcome to Mythic Table!<br/>A virtual tabletop application for playing games with your friends online.<br/>If this is your first time here, read more on our website: [https://mythictable.com/](https://mythictable.com/)**

# Quick Start

If the following doesn't make sense, please contact someone in our [Slack](https://mythictable.slack.com). We'll help you out the best we can! <br/>Many who find this page first will be software developers so we have made some assumptions.

## First time setup

1. [Install .NET Core SDK, version 3.1 or higher](https://dotnet.microsoft.com/download) (backend)
1. Install node.js version 16 using [nvm](https://github.com/nvm-sh/nvm), Visual Studio Installer, or download a manual installer from [nodejs.org](https://nodejs.org/en/download/) (frontend)
1. Start the main service
   1. `cd $HOME/src`
   1. `git clone https://gitlab.com/mythicteam/mythictable.git`
   1. `cd mythictable/server/src/MythicTable`
   1. `dotnet dev-certs https`
   1. `dotnet dev-certs https --trust`
   1. `dotnet run`
1. Start Mythic Table's Frontend
   1. `cd $HOME/src`
   1. `cd mythictable/html`
   1. Optional: if you installed node using `nvm` (see above) then you should run `nvm use` to switch to the correct node version
   1. `npm install`
   1. `npm start`
1. Enjoy!

## Second time and onward

1. Start the main service
   1. `cd $PROJECT_ROOT/server/src/MythicTable`
   1. `dotnet run`
1. Start Mythic Table's Frontend
   1. `cd $PROJECT_ROOT/html`
   1. `npm start`
1. Enjoy!

## Authentication

Abstracting authentication is an important part of the Mythic Table strategy. We use Keycloak for this.

- Learn more about the [Keycloak Project](https://gitlab.com/mythicteam/apps/mythic-key/).
- Learn more about [Keycloak](https://www.keycloak.org/)

## Start the Keycloak service

1. `cd $HOME/src`
1. `mkdir apps`
1. `cd apps`
1. `git clone git@gitlab.com:mythicteam/apps/mythic-key.git`
1. `cd mythic-key`
1. `docker-compose up`

# Building and Running the Docker Image

This process is not necessarily the recommended method, but it is important if
your goal is to set up a Mythic Table server on your own.

## Environment

There are some very important environment files that are required for the build.

One way to configure your specific environement is to use the following in your `.env` file.

These are examples. They should be adjusted for your specific needs.

```
NODE_ENV=development
MTT_AUTH_SERVICE_URL=http://localhost:5002
```

This example uses MongoDB

```
NODE_ENV=development
MTT_AUTH_SERVICE_URL=http://localhost:5002
MTT_MONGODB_CONNECTIONSTRING=mongodb://admin:abc123!@localhost
MTT_MONGODB_DATABASENAME=mythictable
```

This example uses GCP Cloud Storage for file storage

```
MTT_GCP_CREDENTIAL_FILE=???
MTT_GCP_BUCKET_IMAGES=???
MTT_USE_GCP_IMAGE_STORE=true
```

## Building

- `docker build --tag mythictable:local .`

## Running

- `docker run -d -p 5000:80 --rm --name mythictable mythictable:local`

# Working with MongoDB

The above steps will be enough to get you up and going with an in-memory
database, but in some cases, that's not good enough. This is especially
true if you find you're restarting the server a lot in the process of writing
code or troubleshooting. In cases like this, it might be better to run the
services with a local instance of MongoDB. There are a number of ways to
do this, but this is the Mythic Table recommended approach:

## Install Docker

Docker is a container system that allows applications to be run in an enviroment
independant of your operating system. Mythic Table uses Docker for a number
of things including our production environment, but we've been shying away from
it for local development environments. The reason is that we want to keep
things as simple as possible and though Docker is not complicated, it does
remain a possible point of failure. However, do not be disheartened, it is
extremely easy to set up and use. Especially with a set of commands to copy
and paste. ;)

### Windows and Mac users

[Docker Desktop](https://www.docker.com/products/docker-desktop) is a great tool
to get started with. Just go [here](https://www.docker.com/products/docker-desktop)
and follow the instructions.

### Linux users

This is much easier for Linux users.

- [Centos](https://docs.docker.com/install/linux/docker-ce/centos/)
- [Debian](https://docs.docker.com/install/linux/docker-ce/debian/)
- [Fedora](https://docs.docker.com/install/linux/docker-ce/fedora/)
- [Ubuntu](https://docs.docker.com/install/linux/docker-ce/ubuntu/)

This is an optional step, but highly recommended:

- [Enable Docker CLI for the non-root user](https://docs.docker.com/install/linux/linux-postinstall/#manage-docker-as-a-non-root-user)
  account that will be used to run VS Code.

### VS Code Users

- Get the [Docker Extension](https://github.com/microsoft/vscode-docker)
- You can also just search for it under extensions.

## Docker Registry

Docker uses a public image registry to host common images. You will likely need to make an account [here](https://hub.docker.com/)

Then you will login using:

- `docker login`

## The MongoDB Image

Linux/OS X

- `docker pull mongo`
- `docker run -d --rm -p 27017-27019:27017-27019 -v $HOME/docker/volumes/mongodb:/data/db --name mongodb mongo:latest`

Windows

- `docker pull mongo`
- `docker volume create --name=mongodata`
- `docker run -d -p 27017-27019:27017-27019 -v mongodata:/data/db --name mongodb mongo:latest`

What do these commands do?

- `docker` is the CLI tool for docker. You can `docker --help` for more information
- `pull` will pull the image from Docker Hub
- `volume create` will create a new Docker volume rather than linking to a folder on the host (required for mongo on Windows)
- `run` will run the image
- `-d` specifies daemon mode so the image is run in the background
- `--rm` is a nice feature to remove the image after it's terminated
- `-p 27017-27019:27017-27019` instructs docker how to listen and forward ports
- `-v $HOME/docker/volumes/mongodb:/data/db` creates and mounts a local directory where MongoDB stores the database
- `--name mongodb` creates a user friendly name
- `mongo:latest` the last argument is the image name and tag

You may wish to stop and start the mongodb server later (or docker itself). You can stop and start the mongodb image by doing the following:

- `docker stop mongo`
- `docker start mongo`

## Setting up MongoDB

MongoDB requires a specific user with a specific password for local development.
These steps will walk you through the process of setting that up.

- `docker exec -it mongodb mongo`

What's happenging?

- `exec` execute something in the docker container
- `-it` interactively
- `mongodb` the first mongo is your image name
- `mongo` the second is your command to run.

You should now have a mongo prompt

```
>
```

From here run the following:

```
use admin
db.createUser(
  {
    user: "admin",
    pwd: "abc123!",
    roles: [ { role: "root", db: "admin" } ]
  }
);
exit;
```

### Note

If the admin user isn't added, you might get the following error:

```
fail: MythicTable.Middleware.ErrorHandlerMiddleware[0]
      Unhandled Exception: Unable to authenticate using sasl protocol mechanism SCRAM-SHA-1.
```

## Running the server to connect to MongoDB

By default the server uses an in-memory collection for data persistance. To
get it to use mongo, add `--launch-profile integration`. This will instruct it to
use the right profile. Keep in mind that the `integration` profile is set up to use
both MongoDB and Redis. You can either set up Redis with the instructions below
or create a new launch profile.

- `dotnet run --project .\server\src\MythicTable\MythicTable.csproj --launch-profile integration`

or

- `cd server/src/MythicTable/`
- `dotnet run --launch-profile integration`

# Working with Redis

Mythic Table uses a [Redis SignalR Backplane](https://docs.microsoft.com/en-us/aspnet/core/signalr/redis-backplane?view=aspnetcore-3.1)
to help scale websocket connections seamlessly across multiple web servers.
To enable this, set up a Redis server and configure the MTT_REDIS_CONN_STRING
environement variable. Below are the instructions to do this.

## Install Redis via Docker

- `docker pull redis:latest`
- `docker run -d --rm -p 6379:6379 --name redis redis:latest`

  -v [path to custom redis.conf file]:/usr/local/etc/redis/redis.conf

## Running the server to connect to Redis

By default the server does not use a backplane. To configure it to run and use
Redis, add `--launch-profile integration`. This will instruct Mythic Table to
use the right profile. Keep in mind that the `integration` profile is set up to use
both MongoDB and Redis. You can either set up MongoDB with the instructions above
or create a new launch profile.

- `dotnet run --project .\server\src\MythicTable\MythicTable.csproj --launch-profile integration`

# Deploying Mythic Table

## EDGE

Edge is the Mythic Table development environment. It can be found here:

- https://edge.mythictable.com

It is used to test deployments, feature flags, migrator scripts and to allow QA
to verify changes before they at promoted to a release. This environment is not
recommended for the general public, but it's not protected either. Anyone can use
it. They must, however, understand that their data is not protected here and the
environment may be subject to more frequent outages.

### Deployong to edge

This is done automatically when changes are merged into `main`. It can also be
manually deployed from branches that are not `main` by starting a manual job
with the following environment variable:

- `DEPLOY_EDGE` with a value of `true`

To learn more about trigegering manual builds, please refer to the Gitlab documentation:
https://docs.gitlab.com/ee/ci/pipelines/#run-a-pipeline-manually

## First Playable

- https://fp.mythictable.com

This environment is the First Playable environment. It is protected. Only Maintainers
can deploy here. It is done by creating a release tag. For more information about this
talk to a DevOps engineer at Mythic Table.
