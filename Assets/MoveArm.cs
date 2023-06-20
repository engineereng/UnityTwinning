
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
        Debug.Log(direction);
    }    

    void Update()
    {
        if (direction != 0)
        {
            target.Rotate(new Vector3(0, m_rotationSpeed * direction * Time.deltaTime, 0));
        }
    }
}
