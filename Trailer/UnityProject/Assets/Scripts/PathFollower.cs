using System.Collections;
using System.Collections.Generic;
using UnityEngine;
using PathCreation;

public class PathFollower : MonoBehaviour
{ 
    public PathCreator pathCreator;
    public float speed;
    public bool explodingTie;
    public GameObject mainCamera;
    public EndOfPathInstruction end;
    float distanceTravelled;
    // Start is called before the first frame update
    void Start()
    {
        distanceTravelled = 0;
    }

    // Update is called once per frame
    void Update()
    {
        distanceTravelled += speed * Time.deltaTime;
        transform.position = pathCreator.path.GetPointAtDistance(distanceTravelled, end);
        transform.rotation = pathCreator.path.GetRotationAtDistance(distanceTravelled, end);

        if(explodingTie && distanceTravelled >= pathCreator.path.length)
        {
            transform.GetChild(0).gameObject.SetActive(false);
            transform.GetChild(1).gameObject.SetActive(true);
            mainCamera.GetComponent<CameraBurstShake>().startShaking();
        }
        
    }
}
