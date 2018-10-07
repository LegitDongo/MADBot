# Basic docker image for MADBot
# Usage:
#   docker build -t madbot .              # Build the docker Image
#   docker run -d madbot                  # Launch MADBot (Daemon Mode)
#
# Please note that MADBot requires an access to the screenshot directory of Map-a-Droid
# This can be done easily using -v option to map a local DIR in both MAD and MADBot
#

FROM node:8

# Create app directory
WORKDIR /usr/src/app

# Set Environment Variable
ARG NTBA_FIX_319=1

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

CMD [ "node", "start.js" ]
