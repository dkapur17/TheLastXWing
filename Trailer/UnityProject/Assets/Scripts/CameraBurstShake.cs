using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class CameraBurstShake : MonoBehaviour
{
    public float shakeDuration;
    public float shakeOffset;
    private bool shaking;
    // Start is called before the first frame update
    void Start()
    {
        
    }

    // Update is called once per frame
    void Update()
    {
        if(shaking && shakeDuration > 0)
        {
            shakeDuration -= Time.deltaTime;
            transform.position = new Vector3(transform.position.x + Random.Range(-shakeOffset, shakeOffset),
                transform.position.y + Random.Range(-shakeOffset, shakeOffset), transform.position.z + Random.Range(-shakeOffset, shakeOffset));
        }
    }

    public void startShaking()
    {
        shaking = true;
    }
}
