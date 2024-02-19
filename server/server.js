"use strict";

const express = require("express");

// Constants
const PORT = 3000;

// App
const app = express();

// initialisation du serveur
const server = require("http").Server(app);
// initialisation de socket.io
const io = require("socket.io")(server);
// initialisation de simple-signal-server
const signalServer = require("simple-signal-server")(io);

const channels = {};

signalServer.on("discover", (request) => {
  const channelId = request.discoveryData;
  const clientID = request.socket.id; // clients are uniquely identified by socket.id
  if (!channels[channelId]) {
    channels[channelId] = new Set();
  }
  channels[channelId].add(clientID); // keep track of all connected peers
  request.discover(Array.from(channels[channelId])); // respond with id and list of other peers
});

signalServer.on("disconnect", (socket) => {
  const clientID = socket.id;
  Object.keys(channels).forEach((channelId) => {
    channels[channelId].delete(clientID);
  });
});

signalServer.on("request", (request) => {
  request.forward(); // forward all requests to connect
});

server.listen(PORT);
