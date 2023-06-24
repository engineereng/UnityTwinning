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
var analogPin = "A0";
var clientAngle = 0;
var isClientInCharge = true;
var isSweeping = false;

// https://learn.adafruit.com/analog-feedback-servos/using-feedback
// Calibration values
var minDegrees;
var maxDegrees;
var minFeedback;
var maxFeedback;
var tolerance = 2; // max feedback measurement error

// implemnts Arduino's map()
// https://stackoverflow.com/questions/70643627/python-equivalent-for-arduinos-map-function
function map_range(x, in_min, in_max, out_min, out_max)
{
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

board.on("ready", () => {
    const positionPin = new five.Pin(analogPin);
    const servo = new five.Servo({pin: servoPin, startAt: angle});

    // calibrate(servo, "A0", 0, 180);

      // Move to the minimum position and record the feedback value
    minDegrees = 0;
    servo.to(90);
    board.wait(2000, () =>
    {
      positionPin.query((state) => {
        console.log("state: " + state.value)
        minFeedback = state.value;
    
      // Move to the maximum position and record the feedback value
        servo.to(179);
        maxDegrees = 179;
        board.wait(4000, () => 
          positionPin.query((state1) => {         console.log("state1: " + state1.value);          maxFeedback = state1.value;}));
      })
    });
    
    positionPin.read(function(error, value) {
      // console.log("New servo angle: " + value);
      board.wait(100, () => {
        var interpolatedValue = map_range(value, minFeedback, maxFeedback, 0, 180);
        angle = interpolatedValue;
      });
    })
    board.loop(5000, () => {
      if (!isClientInCharge && !isSweeping)
      {
        isSweeping = true;
        console.log("Beginning sweep.");
        servo.sweep();      
        board.wait(3000, () => {
          console.log("Stopping sweep.");
          servo.stop();
          isSweeping = false;
          isClientInCharge = true;
        });
      }
    });

    board.loop(100, () => {
      if (isClientInCharge)
      {
        servo.to(clientAngle);
      }
    })
    board.repl.inject({
      servo: servo
    })
})

wss.on('connection', function(ws) {
  console.log("client joined.");

  // send angle interval
  const textInterval = setInterval(() => {
    if (!isClientInCharge && isSweeping)
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
  });
});

server.listen(port, ip, function() {
  console.log(`Listening on http://${ip}:${port}`);
});