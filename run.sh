#!/usr/bin/env bash

set -e

APP_IMAGE_NAME="next-dashboard-app"
APP_CONTAINER_NAME="next-dashboard-app-container"
APP_IMAGE_LOCAL_POSTGRES_NAME="next-dashboard-app-local"
DB_IMAGE_NAME="next-dashboard-db-local"
APP_LOCAL_CONTAINER_NAME="next-dashboard-app-local-container"

# Because we mounted ./mainApp to the container in dev mode, all the 'COPY' instructions in the Dockerfile will not work.
# So we need to copy the files to the container manually.
setup_dev_env() {
  # local postgres
  if [ "$1" == 'true' ]; then
    cp .env.local-postgres ./mainApp/.env
    mkdir -p ./mainApp/secret
    cp ./secret/postgres-password ./mainApp/secret/postgres-password
  else
    cp .env.vercel-cloud ./mainApp/.env
  fi
}

# Run the app on localhost with vercel cloud
start_vercel_cloud() {
  if are_services_running; then
    echo "The services are already running. Please stop them first."
    return 1
  fi

  if [ -n $(docker image ls "${APP_IMAGE_NAME}" -q) ]; then
    echo "Image exists. Removing the image..."
    docker image rm -f "${APP_IMAGE_NAME}"
  fi

  echo "Building the Docker image..."

  is_dev=false
  if [ "$1" == "dev" ]; then
    is_dev=true
  fi

  docker build --build-arg local_postgres=false --build-arg is_dev="${is_dev}" -t "${APP_IMAGE_NAME}" -f dockerfile/Dockerfile.app .

  if [ -n "$(docker container ls --filter name="${APP_CONTAINER_NAME}" -q)" ]; then
    echo "Container is running. Stopping the container..."
    docker container stop "${APP_CONTAINER_NAME}"
  fi

  echo "Starting the container..."
  if [ "$1" == "dev" ]; then
    docker run --rm -d -p 3000:3000 -v ./mainApp:/mainApp --name "${APP_CONTAINER_NAME}" "${APP_IMAGE_NAME}"
    setup_dev_env false
  else
    docker run --rm -d -p 3000:3000 --name "${APP_CONTAINER_NAME}" "${APP_IMAGE_NAME}"
  fi

  if [ "$1" != "dev" ]; then
    touch '.vercel_cloud_started'
  fi

  return 0
}

start_vercel_cloud_dev() {
  if start_vercel_cloud "dev"; then
    touch '.vercel_cloud_dev_started'
  fi
}

stop_vercel_cloud() {
  echo "Shutting down Vercel cloud services..."
  docker container stop "${APP_CONTAINER_NAME}"
  rm -f ./mainApp/.env
  rm -rf ./mainApp/secret
}

stop_vercel_cloud_dev() {
  stop_vercel_cloud
}

remove_local_postgres() {
  echo "Shutting down services..."
  docker compose down

  echo "Removing /mainApp/.env and /mainApp/secret..."
  rm -f ./mainApp/.env
  rm -rf ./mainApp/secret
  echo "Wipe out the local database..."
  rm -rf './psql/data'

  if [ -n "$(docker image ls "${DB_IMAGE_NAME}" -q)" ]; then
    echo "Image exists. Removing the image(${DB_IMAGE_NAME})..."
    docker image rm -f "${DB_IMAGE_NAME}"
  fi

  if [ -n "$(docker image ls "${APP_IMAGE_LOCAL_POSTGRES_NAME}" -q)" ]; then
    echo "Image exists. Removing the image("${APP_IMAGE_LOCAL_POSTGRES_NAME}")..."
    docker image rm -f "${APP_IMAGE_LOCAL_POSTGRES_NAME}"
  fi
}

stop_local_postgres() {
  docker compose down
  rm -f ./mainApp/.env
  rm -rf ./mainApp/secret
}

are_services_ready() {
  while [ "$(docker inspect --format="{{.State.Health.Status}}" next-dashboard-db-local-container)" != "healthy" -o \
   "$(docker inspect --format="{{.State.Health.Status}}" next-dashboard-app-local-container)" != "healthy" ];
  do
    echo "Waiting for services to be ready. DB($(docker inspect --format="{{.State.Health.Status}}" next-dashboard-db-local-container)), App($(docker inspect --format="{{.State.Health.Status}}" next-dashboard-app-local-container))"
    sleep 10;
  done
}

start_local_postgres() {
  if are_services_running; then
    echo "The services are already running. Please stop them first."
    return 1
  fi

  IS_DEV=false docker compose up -d

  are_services_ready
  docker exec "${APP_LOCAL_CONTAINER_NAME}" sh -c "node scripts/seed-local-db.ts"
  touch '.local_postgres_started'

  return 0
}

start_local_postgres_dev() {
  if are_services_running; then
    echo "The services are already running. Please stop them first."
    return 1
  fi

  IS_DEV=true docker compose -f ./compose.yml -f ./compose-dev.yml up -d
  setup_dev_env true

  are_services_ready
  docker exec "${APP_LOCAL_CONTAINER_NAME}" sh -c "node scripts/seed-local-db.ts"
  touch '.local_postgres_dev_started'

  return 0
}

stop_local_postgres_dev() {
  stop_local_postgres
}

are_services_running() {
  if [ -f '.vercel_cloud_started' ]; then
    echo "Vercel cloud services are running."
    return 0
  elif [ -f '.vercel_cloud_dev_started' ]; then
    echo "Vercel cloud dev services are running."
    return 0
  elif [ -f '.local_postgres_started' ]; then
    echo "Local postgres services are running."
    return 0
  elif [ -f '.local_postgres_dev_started' ]; then
    echo "Local postgres dev services are running."
    return 0
  else
    return 1
  fi
}

stop() {
  if [ -f '.vercel_cloud_started' ]; then
    rm -f '.vercel_cloud_started'
    stop_vercel_cloud
  elif [ -f '.vercel_cloud_dev_started' ]; then
    rm -f '.vercel_cloud_dev_started'
    stop_vercel_cloud_dev
  elif [ -f '.local_postgres_started' ]; then
    rm -f '.local_postgres_started'
    stop_local_postgres
  elif [ -f '.local_postgres_dev_started' ]; then
    rm -f '.local_postgres_dev_started'
    stop_local_postgres_dev
  else
    echo "No services are running."
  fi
}

"$@"