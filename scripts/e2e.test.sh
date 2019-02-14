#!/usr/bin/env bash

RETRY_INTERVAL=${RETRY_INTERVAL:-0.2}

function check_dependencies() {
    dependencies=(
        'docker'
        'docker-compose'
        'curl'
    )

    for dep in "${dependencies[@]}"; do
        executable_exists $dep
    done
}

function executable_exists() {
    if ! [ -x "$(command -v $1)" ]; then
        echo "Error: $1 is not installed"
        exit 1
    fi
}

function check_api_server_not_running() {
    if curl --silent $SERVER_HOSTNAME:$SERVER_PORT -o /dev/null; then
        echo "Another process is already listening to port $SERVER_PORT"
        exit 1
    fi
}

function run_dependencies() {
    if ! docker ps --filter name=elasticsearch | grep -q elasticsearch; then

        docker-compose up -d

        # Wait until Elasticsearch is ready
        until curl --silent ${ELASTICSEARCH_HOSTNAME}:${ELASTICSEARCH_PORT} -w "" -o /dev/null; do
            sleep $RETRY_INTERVAL
        done

    fi
}

function run_api_server() {
    yarn run serve &

    # Wait until API server is ready
    until curl --silent $SERVER_HOSTNAME:$SERVER_PORT -o /dev/null; do
        sleep $RETRY_INTERVAL
    done
}

function run_e2e_tests() {
    npx cucumber-js spec/cucumber/features \
        --require-module @babel/register \
        --require spec/cucumber/steps
}

function cleanup_es_test_index() {
    curl --silent -o /dev/null -X DELETE "$ELASTICSEARCH_HOSTNAME:$ELASTICSEARCH_PORT/$ELASTICSEARCH_INDEX"
}

function terminate_all_processes() {
    kill -15 0
}


check_dependencies
check_api_server_not_running
run_dependencies
run_api_server
run_e2e_tests
cleanup_es_test_index
terminate_all_processes