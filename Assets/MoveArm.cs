
using UnityEngine;
using UnityEngine.InputSystem;

public class MoveArm : MonoBehaviour
{
    [SerializeField] Transform target;

    [SerializeField] float m_rotationSpeed = 10.0f;

    System.Single direction;

    private void OnRotate(InputAction.CallbackContext context)
    {
        direction = context.ReadValue<System.Single>();
        // Debug.Log(direction);
    }    

    void FixedUpdate()
    {
        if (direction != 0)
        {
            target.Rotate(new Vector3(0, m_rotationSpeed * direction * Time.deltaTime, 0));
            int newRotation = (int) target.rotation.eulerAngles.y;
            Debug.Log("New rotation: " + newRotation);
            
            WebSocketMgr.Instance.SetArmAngle(newRotation);
        }
    }

    public void onReceiveBytes(int newAngle)
    {
        Debug.Log("Current angle: " + target.rotation.eulerAngles.y);
        Debug.Log("New angle: " + newAngle);
        float newRotation = newAngle - target.rotation.eulerAngles.y;
        target.Rotate(new Vector3(0, newRotation, 0));
        Debug.Log("New rotation: " + newRotation);
    }
}
