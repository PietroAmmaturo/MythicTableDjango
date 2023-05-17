
# Mythic Table

**Welcome to Mythic Table Django!<br/>A django adaptation of the virtual tabletop application Mythic Table<br/>Read more on their website: [https://mythictable.com/](https://mythictable.com/)**

# Quick Start on local

If you are a developer wishing to extend or improve this project here is everything you need to start the project on your local machine

## First time setup on local

1. Install node.js version 16 using [nvm](https://github.com/nvm-sh/nvm), Visual Studio Installer, or download a manual installer from [nodejs.org](https://nodejs.org/en/download/) (frontend)
2. Install python3 (python:3.9.2 or later)
3. Start the main service
   1. `cd $HOME/src`
   2. `git clone https://github.com/PietroAmmaturo/MythicTableDjango.git`
   3. `cd mythictable/django_server/MythicTable`
   4. `pip3 install -r requirements.txt`
   5. `python3 manage.py runserver 5001`
4. Start Mythic Table's Frontend
   1. `cd $HOME/src`
   2. `cd mythictable/html`
   3. Optional: if you installed node using `nvm` (see above) then you should run `nvm use` to switch to the correct node version
   4. `npm install`
   5. `npm run start`
5. Enjoy!

## Second time and onward

1. Start the main service
   1. `cd $PROJECT_ROOT/server/src/MythicTable`
   2. `python3 manage.py runserver 5001`
2. Start Mythic Table's Frontend
   1. `cd $PROJECT_ROOT/html`
   3. `npm run start`
3. Enjoy!

## Configure django settings

It is important for you to configure django settings according to your needs

### Media settings

This is the directory where user files will be stored

MEDIA_URL = '/user-files/' 
MEDIA_ROOT = os.path.join(BASE_DIR, 'user-files/') 

### Database settings

MythicTableDjango uses MONGODB as DB, mantaining total retrocompatibility,
it expects you tho have a working MONGODB on your host, configure the following settings accordingly,
as an alternative you may use a MONGODB docker image

MONGODB_HOST = os.environ.get('MONGODB_HOST', 'mongodb://admin:abc123!@localhost')
MONGODB_DB_NAME = os.environ.get('MONGODB_DB_NAME', 'MythicTableDjango')

### Authentication settings

MythicTableDjango uses openid authentication using JWT/JWKS, this settings should
point to a json file containing the jwks url and the userinfo url

MTT_AUTH_URL = "https://key.mythictable.com/auth/realms/MythicTable"

### Other settings

There are plenty of other aspects of the django server that can be customized, to read more about
django settings: https://docs.djangoproject.com/en/4.2/topics/settings/

## Configure vue environment variables

### Proxy related settings

FRONTEND_PORT=5000
SERVER_URL=http://127.0.0.1:5001

# Quick Start with docker

If you wish to only try out the experience or you only want to focus on one part
of the project, you may want to use docker to run the whole app (or just a section)
in a container, this setup shows how to run all the containers using docker, you
may want to run them separately (as example just the database container).

## Install Docker

Docker is a container system that allows applications to be run in an enviroment
independant of your operating system.

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

## First time setup with docker

1. Start the containers
   1. `cd $HOME/src`
   2. `git clone https://github.com/PietroAmmaturo/MythicTableDjango.git`
   3. `docker-compose up -g`
   4. `go to: http://localhost:5000/`
2. Enjoy!

## Second time and onwards

1. Start the containers
   1. `cd $HOME/src`
   2. `git clone https://github.com/PietroAmmaturo/MythicTableDjango.git`
   3. `docker-compose start`
   4. `go to: http://localhost:5000/`
2. Enjoy!

## Running individual containers

You may only want to run one or two containers, this can be done, but remember
to edit the docker-compose.yml file accordingly.
You may find more on Docker Compose files at: https://docs.docker.com/compose/compose-file/
