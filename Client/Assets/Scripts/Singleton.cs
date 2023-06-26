using UnityEngine;

public class Singleton<SingletonClass> : MonoBehaviour where SingletonClass : MonoBehaviour {

	public static SingletonClass Instance;

	protected virtual void Awake() {
		if (Instance is not null) {
			Destroy(gameObject);
			return;
		}

		Instance = this as SingletonClass;
	}


	private void OnApplicationQuit() {
		Instance = null;
		Destroy(gameObject);
	}

}