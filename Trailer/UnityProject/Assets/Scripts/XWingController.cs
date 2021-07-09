using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class XWingController : MonoBehaviour
{
    private Vector3 originalPos;
    private AudioSource flightSound;
    private bool played;
    // Start is called before the first frame update
    void Start()
    {
        flightSound = GetComponent<AudioSource>();
        originalPos = transform.position;
        played = false;
    }

    // Update is called once per frame
    void Update()
    {
        if (originalPos != transform.position && !played)
        {
            flightSound.Play();
            played = true;
        }
    }
}
