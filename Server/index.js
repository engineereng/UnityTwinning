const crypto = require('crypto');
const express = require('express');
const { createServer } = require('http');
const WebSocket = require('ws');

const app = express();
const port = 3000;
require('dotenv').config();
const ip = process.env.IP_ADDRESS;//
const server = createServer(app);
const wss = new WebSocket.Server({ server });

let five = require("johnny-five");
let board = new five.Board();

var angle = 0;
var servoPin = 9;
var clientAngle = 0;
var isClientInCharge = true;

board.on("ready", () => {
    const positionPin = new five.Pin("A0");
    const servo = new five.Servo({pin: servoPin, startAt: angle});

    positionPin.read(function(error, value) {
      // console.log("New servo angle: " + value);
      board.wait(100, () => {
        angle = value;
      });
    })
    board.loop(5000, () => {
      if (!isClientInCharge)
      {
        console.log("Beginning sweep.");
        servo.sweep();      
        board.wait(3000, () => {
          console.log("Stopping sweep.");
          servo.stop();
          isClientInCharge = true;
        });
      }
    });

    board.loop(100, () => {
      // if (!isSweeping)
      // {
        // console.log("Moving to clientAngle: " + clientAngle);
        if (isClientInCharge)
        {
          waitingForClientInput = false;
          servo.to(clientAngle);
          board.wait(100, () => {isClientInCharge = false;}) 
        }
      // }
    })
    board.repl.inject({
      servo: servo
    })
})

wss.on('connection', function(ws) {
  console.log("client joined.");

  // send angle interval
  const textInterval = setInterval(() => {
    if (!isClientInCharge)
      ws.send(angle);
      console.log("Sending angle to client: " + angle);
  }, 100);

  ws.on('message', function(data) {
    if (typeof(data) === "string") {
      // client sent a string
      console.log("string received from client -> '" + data + "'");

    } else {
      var newAngle = data[0];
      console.log("binary received from client -> " + newAngle);
      if (clientAngle != newAngle)
      {  
        clientAngle = newAngle;
        isClientInCharge = true; //the client is trying to move to a new angle
      } else {
        isClientInCharge = false; //the client isn't moving anything        
      }
    }
  });

  ws.on('close', function() {
    console.log("client left.");
    clearInterval(textInterval);
    clearInterval(binaryInterval);
  });
});

server.listen(port, ip, function() {
  console.log(`Listening on http://${ip}:${port}`);
});