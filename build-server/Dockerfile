FROM ubuntu:focal

RUN apt-get update

# Install Curl
RUN apt-get install -y curl

# Install NodeJS using Curl
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash - 
RUN apt-get upgrade -y
RUN apt-get install -y nodejs

# Install Git
RUN apt-get install git -y

# Set Working Dir
WORKDIR "/home/app"

# Copy main.sh to main.sh
COPY main.sh main.sh

# Copy script.js to script.js
COPY script.js script.js

# Copy Package JSON and Package Lock JSON
COPY package*.json .

RUN npm install

# Executeable Permissions
RUN chmod +x main.sh
RUN chmod +x script.js

ENTRYPOINT [ "/home/app/main.sh" ]