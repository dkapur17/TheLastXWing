using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class CameraShake : MonoBehaviour
{
    // Update is called once per frame
    void Update()
    {
        transform.position = new Vector3(transform.position.x, transform.position.y + Random.Range(-0.05f, 0.05f), transform.position.z + Random.Range(-0.05f, 0.05f));
    }
}
