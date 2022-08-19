#!/usr/bin/env bash

COMMAND="$1"

export TESTS="$2"
export NETWORK=${3:-"hardhat"}

export BASE_DIR="./"

DOCKER_COMPOSE_FILE="docker-compose.yml"

function up(){

    echo ""
    echo "Starting up ..."
    echo ""
    
    # docker-compose -f "$DOCKER_COMPOSE_FILE" up -d
    docker-compose -f "$DOCKER_COMPOSE_FILE" up --remove-orphans 
}

function down(){
    echo ""
    echo "Shutting down ..."
    echo ""
    docker-compose -f "$DOCKER_COMPOSE_FILE" down
}

# function exec(){
#     local service="truffle-drizzle"
#     local command="bash"
#     local command="bash"
    
#     echo ""
#     echo "Exec into service '$service' ..."
#     echo ""
#     docker-compose -f "$DOCKER_COMPOSE_FILE" exec "$service" "$command"
# }
# function console(){
#     local service="truffle-drizzle"
#     local command="bash -c \"truffle console\""
    
#     echo ""
#     echo "Exec into service '$service' ..."
#     echo ""
#     docker-compose -f "$DOCKER_COMPOSE_FILE" exec "$service" "$command"
# }

function logs(){
    echo ""
    echo "Getting logs ..."
    echo ""
    docker-compose -f "$DOCKER_COMPOSE_FILE" logs
}

case $COMMAND in 
    "up" )
        up
        ;;
    "down" )
        down
        ;;
    "info" )
        info
        ;;
    "exec" )
        exec
        ;;
    "console" )
        console
        ;;
    * )
        echo "Invalid command"
        exit 1
        ;;
esac
