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
var isClientInCharge = false;
var isSweeping = false;

// https://learn.adafruit.com/analog-feedback-servos/using-feedback
// Calibration values
var minDegrees = 0;
var maxDegrees = 180;
var minFeedback;
var maxFeedback;

// implemnts Arduino's map()
// https://stackoverflow.com/questions/70643627/python-equivalent-for-arduinos-map-function
function map_range(x, in_min, in_max, out_min, out_max)
{
  return (x - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
}

board.on("ready", () => {
    const positionPin = new five.Pin(analogPin);
    const servo = new five.Servo({pin: servoPin, startAt: minDegrees, range: [minDegrees, maxDegrees]});

    // Move to the minimum position and record the feedback value
    console.log("Calibrating servo.");
    servo.to(minDegrees);
    board.wait(2000, () =>
    {
      positionPin.query((state) => {
        var minPosVoltage = state.value;
        console.log("voltage at " + minDegrees + " degrees: " + minPosVoltage);
        minFeedback = minPosVoltage;
    
      // Move to the maximum position and record the feedback value
        servo.to(maxDegrees);
        board.wait(2000, () => 
          positionPin.query((state1) => { 
            var maxPosVoltage = state1.value;
            console.log("voltage at " + maxDegrees + " degrees: " + maxPosVoltage);
            maxFeedback = maxPosVoltage;
            console.log("Ready to receive input.");
          }));
      })
    });
    
    positionPin.read(function(error, value) {
      // console.log("New servo angle: " + value);
      board.wait(100, () => {
        var interpolatedValue = map_range(value, minFeedback, maxFeedback, minDegrees, maxDegrees);
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

  const sendAngleInterval = setInterval(() => {
    if (!isClientInCharge && isSweeping) {
      ws.send(angle);
      console.log("Sending angle to client: " + angle);
    }
  }, 100);

  ws.on('message', function(data) {
    if (typeof(data) === "object") {   
      const dv = new DataView(new ArrayBuffer(16));
      var dvString = "[";
      for (let i = 0; i < 4; i++) {
        dv.setUint8(i, data[i]);
        dvString += data[i].toString() + ", ";
      }
      dvString += "]";
      console.log("Received the array: " + dvString);
      var newAngle = dv.getFloat32(0, false);  // should have transmitted in little endian order
      console.log("number received from client -> " + newAngle);
      if (clientAngle != newAngle)
      {  
        clientAngle = newAngle;
        isClientInCharge = true; //the client is trying to move to a new angle
      } else {
        isClientInCharge = false; //the client isn't moving anything        
      }
    } else {
      console.error("Client did not send a number!");
      console.error("It sent: " + data.toString() + " of type " + typeof(data));
    }
  });

  ws.on('close', function() {
    console.log("client left.");
    clearInterval(sendAngleInterval);
  });
});

server.listen(port, ip, function() {
  console.log(`Listening on http://${ip}:${port}`);
});