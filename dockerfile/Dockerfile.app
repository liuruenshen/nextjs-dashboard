ARG local_postgres=false
ARG is_dev=false

# https://stackoverflow.com/questions/43654656/dockerfile-if-else-condition-with-external-arguments

FROM node:23-alpine AS base


# Install python/pip
ENV PYTHONUNBUFFERED=1
# https://stackoverflow.com/questions/59470406/how-to-solve-could-not-find-any-python-installation-to-use-with-docker-node-al
# https://stackoverflow.com/questions/62554991/how-do-i-install-python-on-alpine-linux
# https://github.com/nodejs/node-gyp?tab=readme-ov-file#installation
RUN apk add --update --no-cache curl python3 py3-pip make g++

WORKDIR /mainApp

# The entire app folder is mounted from the host machine so we don't COPY anything in dev mode.
FROM base AS branch-is-dev-true
EXPOSE 3000/tcp

FROM base AS branch-is-dev-false
COPY ./mainApp .
# Remove the host-installed node_modules in case those binary files are not compatible with the docker's OS.
RUN rm -rf ./node_modules
RUN npm install
RUN npm run build
EXPOSE 3000/tcp

# Set up the environment for connecting to the Vercel cloud
FROM branch-is-dev-${is_dev} AS branch-local-postgres-false
ENV ENV_FILE=".env.vercel-cloud" 

# Set up the environment for connecting to the local postgres database
FROM branch-is-dev-${is_dev} AS branch-local-postgres-true
ENV ENV_FILE=".env.local-postgres"
COPY ./secret/postgres-password ./secret/postgres-password

# Select the stage based on the local_postgres argument
FROM branch-local-postgres-${local_postgres} AS postgres-prepared
ARG local_postgres
ENV LOCAL_POSTGRES=${local_postgres:-false}
COPY ./${ENV_FILE} .env

FROM postgres-prepared AS branch-is-dev-false-final
CMD ["npm","run","start"]

FROM postgres-prepared AS branch-is-dev-true-final
ENTRYPOINT ["/bin/sh", "-c"]
CMD ["set -e; \
  echo 'Removing node_modules...'; \
  rm -rf ./node_modules; \
  echo 'Installing node_modules...'; \
  npm install; \
  echo 'Starting the app...'; \
  npm run dev"]

FROM branch-is-dev-${is_dev}-final AS final
HEALTHCHECK CMD curl -f 'http://localhost:3000/' > /dev/null
