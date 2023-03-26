#!/bin/bash

# check mythicapp container is running
if docker inspect mythicapp > /dev/null 2>&1; then

    # Get script location (Linux only for now, OSX may work with GNU coreutils installed)
    DIR=$(dirname "$(readlink -f "$0")")/include

    cd $DIR # Make sure we are in the correct directory

    NETWORK_NAME=mythictable_test

    # create mythictable_test docker network if it doesn't exist
    docker network inspect $NETWORK_NAME >/dev/null 2>&1 || \
        docker network create --driver bridge $NETWORK_NAME

    # connect mythicapp container to test network if not already connected
    if ! docker inspect mythicapp -f '{{range $k, $v := .NetworkSettings.Networks}}{{printf "%s\n" $k}}{{end}}' | grep mythictable_test > /dev/null 2>&1; then
        docker network connect $NETWORK_NAME mythicapp
    fi

    # update .env file with correct uid/gid
    cat > .env << EOF
    USER_ID=`id -u`
    GROUP_ID=`id -g`
    NETWORK_NAME=$NETWORK_NAME
EOF

    # run out test container
    docker-compose up --build
fi