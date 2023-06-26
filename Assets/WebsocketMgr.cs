using System;
using UnityEngine;
using UnityEngine.Events;

using NativeWebSocket;

public class WebSocketMgr : Singleton<WebSocketMgr>
{
  WebSocket websocket;
  public String ip_address;
  public String port;

  [SerializeField]
  private UnityEvent<float> m_Event; 
  private float angle;

  // Start is called before the first frame update
  async void Start()
  {
    String connection = "ws://" + ip_address + ":" + port;
    websocket = new WebSocket(connection); // change this to your server's IP
    Debug.Log("Attemping connection to " + connection);
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
      m_Event.Invoke(float.Parse(message));
      Debug.Log("OnMessage! " + message);
    };

    // Keep sending messages at every 0.3s
    InvokeRepeating("SendWebSocketMessage", 0.0f, 0.3f);

    // waiting for messages
    await websocket.Connect();
  }

  public void SetArmAngle(float angle)
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
      byte[] bytes = BitConverter.GetBytes(angle);
      Debug.Log("Sent angle (" + angle + " degrees) as byte array: [" + BitConverter.ToString(bytes) + "]");
      if (BitConverter.IsLittleEndian)
        Array.Reverse(bytes); // bytes is now in network byte order    
      // Sending angle
      await websocket.Send(bytes);
    }
  }

  private async void OnApplicationQuit()
  {
    await websocket.Close();
  }

}