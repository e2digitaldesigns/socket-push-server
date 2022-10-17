let https = require("http");
const express = require("express");
const app = express();
const fs = require("fs");
const _map = require("lodash/map");
const _replace = require("lodash/replace");
const _split = require("lodash/split");
const _slice = require("lodash/slice");

const serverPort = process.env.PORT || 8002;
const server = https.createServer({}, app);
const io = require("socket.io")(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "http://overlays.gtk.s3-website-us-east-1.amazonaws.com"
    ],
    methods: ["GET", "POST"]
  }
});

console.clear();

//SET APP HEADERS
app.use(function (req, res, next) {
  "use strict";
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS, PUT, PATCH, DELETE"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-Requested-With,content-type"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});

//Get HTML
app.get("/", function (req, res) {
  "use strict";
  io.emit("mgOverlayActions", { test: true });
  res.sendFile(__dirname + "/index.html");
});

app.get("/manual/:type", function (req, res) {
  const nodeSendArray = {};
  io.emit("mgOverlayActions", nodeSendArray);

  let rawParams = _replace(req.url, "?", "&");
  rawParams = _split(rawParams, "&");
  rawParams = _slice(rawParams, 1);

  _map(rawParams, m => {
    let pair = _split(m, "=");
    nodeSendArray[pair[0]] = decodeURIComponent(pair[1]);
  });

  res.send(nodeSendArray);

  const ioSub = req.params.type === "vote" ? "mgVoting" : "mgOverlayActions";
  io.emit(ioSub, nodeSendArray);
});

//Set Services
io.on("connection", function (socket) {
  socket.on("mgOverlayActions", function (data) {
    console.log(35, data);
    socket.broadcast.emit("mgOverlayActions", data);
    io.emit("mgOverlayActions", data);
  });

  socket.on("mgVoting", function (data) {
    console.log(43, data);
    io.emit("mgVoting", data);
  });
});

//Set Server & Listen
server.listen(serverPort, () =>
  console.log("Socket Push Server at ", serverPort)
);

// https://middle-ground-rest-api.herokuapp.com/manual/vote?&action=like&_id=0
// https://middle-ground-rest-api.herokuapp.com/manual/vote?&action=disLike&_id=0

// https://middle-ground-rest-api.herokuapp.com/manual/vote?&action=like&_id=1
// https://middle-ground-rest-api.herokuapp.com/manual/vote?&action=disLike&_id=1

// https://middle-ground-rest-api.herokuapp.com/manual/vote?&action=like&_id=2
// https://middle-ground-rest-api.herokuapp.com/manual/vote?&action=disLike&_id=2

// https://middle-ground-rest-api.herokuapp.com/manual/overlayAction?&action=next-topic
// https://middle-ground-rest-api.herokuapp.com/manual/overlayAction?&action=prev-topic

////////////////////////////////////////////////////////////////////////////////////////

// https://mgs-push-server.herokuapp.com/manual/overlayAction?&action=next-topic
// https://mgs-push-server.herokuapp.com/manual/overlayAction?&action=prev-topic

// https://mgs-push-server.herokuapp.com/manual/vote?&action=like&_id=2
