#!/usr/bin/env bash

COMMAND="$1"
# APP_NAME="$3"

export NETWORK=${2:-"hardhat"}

DOCKER_COMPOSE_FILE="docker-compose.yml"

echo ""
echo "Deleting previously deployed contracts ..."
echo ""

# export BASE_DIR="./truffle-drizzle"
export BASE_DIR="./"

# DIR="$BASE_DIR/client/src/contracts"

# ls -l "$DIR"
# rm -rf "$DIR"

# # ls -l ../contracts

# echo ""
# echo "Delete old files (contracts, migrations, tests) ..."
# echo ""

# # https://www.tecmint.com/delete-all-files-in-directory-except-one-few-file-extensions/
# find "$BASE_DIR/migrations/" -type f -not -name '1_initial_migration.js' -delete
# find "$BASE_DIR/contracts/"  -type f -not -name 'Migrations.sol' -delete

# find "$BASE_DIR/test/"       -type f -not -name 'truffleTestHelper.js' 'test.sol' -delete
# # find "$BASE_DIR/test/"       -type f -not -path './helpers'  -delete



function up(){

    # echo ""
    # echo "Copying files ..."

    # if [ -z "$APP_NAME" ]; then
    #     echo ""
    #     echo "App name cannot be empty. Existing."
    #     exit 1
    # fi

    # if [ ! -d "../contracts/$APP_NAME" ]; then
    #     echo ""
    #     echo "Directory '../contracts/$APP_NAME' DOES NOT exist."
    #     exit 1 
    # fi

    # cp -r ../contracts/$APP_NAME/contracts/. "$BASE_DIR/contracts/"
    # cp -r ../contracts/$APP_NAME/migrations/. "$BASE_DIR/migrations/"
    # cp -r ../contracts/$APP_NAME/tests/. "$BASE_DIR/test/"

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

function exec(){
    local service="truffle-drizzle"
    local command="bash"
    local command="bash"
    
    echo ""
    echo "Exec into service '$service' ..."
    echo ""
    docker-compose -f "$DOCKER_COMPOSE_FILE" exec "$service" "$command"
}
function console(){
    local service="truffle-drizzle"
    local command="bash -c \"truffle console\""
    
    echo ""
    echo "Exec into service '$service' ..."
    echo ""
    docker-compose -f "$DOCKER_COMPOSE_FILE" exec "$service" "$command"
}


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
