using System;
using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.Events;

using NativeWebSocket;

public class WebSocketMgr : Singleton<WebSocketMgr>
{
  WebSocket websocket;

  [SerializeField]
  private UnityEvent<int> m_Event; 
  private int angle;

  // Start is called before the first frame update
  async void Start()
  {
    websocket = new WebSocket("ws://localhost:2567"); // change this to your server's IP

    websocket.OnOpen += () =>
    {
      Debug.Log("Connection open!");
    };

    websocket.OnError += (e) =>
    {
      Debug.Log("Error! " + e);
    };

    websocket.OnClose += (e) =>
    {
      Debug.Log("Connection closed!");
    };

    websocket.OnMessage += (bytes) =>
    {
      // getting the message as a string
      var message = System.Text.Encoding.UTF8.GetString(bytes);
      m_Event.Invoke(Int32.Parse(message));
      Debug.Log("OnMessage! " + message);
    };

    // Keep sending messages at every 0.3s
    InvokeRepeating("SendWebSocketMessage", 0.0f, 0.3f);

    // waiting for messages
    await websocket.Connect();
  }

  public void SetArmAngle(int angle)
  {
    this.angle = angle;
  }

  void Update()
  {
    #if !UNITY_WEBGL || UNITY_EDITOR
      websocket.DispatchMessageQueue();
    #endif
  }

  async void SendWebSocketMessage()
  {
    if (websocket.State == WebSocketState.Open)
    {
      // Sending angle
      await websocket.Send(new byte[] {(byte) angle});
    }
  }

  private async void OnApplicationQuit()
  {
    await websocket.Close();
  }

}