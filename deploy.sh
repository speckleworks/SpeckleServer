#!/bin/sh

if [ -n "$1" ]
then
  NEXT_RELEASE_VERSION=$1
  IMAGE_TAG=$DOCKER_IMAGE:$NEXT_RELEASE_VERSION
else
  echo "A release version must be supplied"
  exit 1
fi

# Login to docker as botsalot
echo "$DOCKER_PASSWORD" | docker login -u "$DOCKER_USERNAME" --password-stdin

# Build the docker image
docker build . -t $IMAGE_TAG --build-arg GIT_TAG=${1}
# Create the same image with tag latest
docker tag $IMAGE_TAG $DOCKER_IMAGE:latest

# Push the image with the new version tag
docker push $IMAGE_TAG
# Push the image with the "latest" version tag
docker push $DOCKER_IMAGE:latest