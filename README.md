# UnityTwinning
A demo for mirroring a servo's motion in Unity and controlling the motor in Unity. An Express server connects to the Arduino server via the Johnny Five API, which communicates to Unity through endel's Native Websocket library.

## Watch it in action on YouTube: https://youtu.be/OCzmfuKflg4

[![Link](https://user-images.githubusercontent.com/38707101/253398527-ab065211-11e0-47f4-a436-77e1b8b59651.jpg)](https://youtu.be/OCzmfuKflg4)

## Set up
### Arduino + servo

1. Connect the Arduino to your computer using a USB connection.
2. Connect the servo to the Arduino using the following circuit:
   - Power to the Arduino's 5V pin or to a driver
   - Ground to GND
   - Signal pin to pin 9
   - Feedback pin to pin A0 (under Analog In)
3. Open the Arduino IDE and select the Arduino.
4. Upload the `StandardFirmata` sketch. (File > Examples > Firmata > Standard Firmata)

### Server
1. Set up the Arduino following the steps in the section above.
2. Open a terminal window in the `UnityTwinning` directory.
3. Run `cd Server` to navigate to the server subdirectory.
4. Create a `.env` file in the subdirectory with `IP_ADDRESS=YOUR_IP_ADDRESS`, and fill in your server's IP address (e.g. `localhost:3000`)
5. Run the following commands in the terminal window to start the server:
```
npm install
 npm run
```
6. Wait for the servo to calibrate.

### Client / Unity
1. Open the `UnityTwinning` scene in the `Assets\Scenes` folder.
2. Click on the `WebsocketMgr` in the scene and input the IP address and port in the `WebsocketMgr` component.
3. Press play to connect to the server. This step must be done AFTER the server says it is ready for input

To control the motor in the `UnityTwinning` Scene use the keyboard:
- Q: Rotate motor counterclockwise
- E: Rotate motor clockwise

## Dependencies
Tested with:
- Arduino: Uno R3
- Servo: Datan S1213 Analog Servo Motor with Feedback
- Unity version: 2022.3.1f1
- Native Websocket: 1.1.4
  
`npm list`:
- dotenv@16.3.1
- express@4.18.2
- johnny-five@2.1.0
- serialport@11.0.0
- ws@7.5.9
