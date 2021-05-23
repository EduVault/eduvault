FROM ubuntu:16.04

ENV DEBIAN_FRONTEND noninteractive
ENV NODE_VERSION=12.14.x

RUN apt-get -qq update
RUN apt-get -yqq upgrade
RUN apt-get install -yqq apt-utils
RUN apt-get install -yqq apt-transport-https
RUN apt-get install -y apt-transport-https
RUN apt-get install -yqq curl
RUN apt-get install -yqq wget
RUN apt-get install -yqq unzip
RUN apt-get install -yqq bzip2
RUN apt-get install -yqq xz-utils
RUN apt-get install -yqq ca-certificates
RUN apt-get install -yqq openjdk-8-jre-headless
RUN apt-get install -yqq jq
RUN apt-get install -yqq libxml-xpath-perl
RUN wget -q -O node-v$NODE_VERSION-linux-x64.tar.xz https://nodejs.org/dist/v$NODE_VERSION/node-v$NODE_VERSION-linux-x64.tar.xz
RUN tar -xJf node-v$NODE_VERSION-linux-x64.tar.xz -C /usr/local --strip-components=1
RUN rm node-v$NODE_VERSION-linux-x64.tar.xz
RUN ln -s /usr/local/bin/node /usr/local/bin/nodejs
RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add -
RUN echo "deb https://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list
RUN apt-get update -yq
RUN apt-get -yqq install google-chrome-stable
WORKDIR /app
COPY package.json /app/
RUN npm install chromedriver --chromedriver-force-download && npm install

# The end