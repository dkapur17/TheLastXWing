using System.Collections;
using System.Collections.Generic;
using UnityEngine;

public class TieController : MonoBehaviour
{
    public ParticleSystem[] laserCanons;
    public AudioSource flightSound;
    public AudioSource shootSound;
    public float reducedSpeed;
    private bool speedReduced;
    public float timeBetweenShots;

    private Vector3 originalPos;

    private void Start()
    {
        originalPos = transform.position;
        speedReduced = false;
        StartCoroutine(PlayShootSound());
    }

    private void Update()
    {
        if (originalPos != transform.position && !speedReduced)
        {
            flightSound.Play();
            ReduceBulletSpeed();
        }
    }

    private void ReduceBulletSpeed()
    {
        speedReduced = true;
        foreach (ParticleSystem ps in laserCanons)
        {
            ParticleSystem.MainModule main = ps.main;
            main.startSpeed = reducedSpeed;

            int particleCount = ps.particleCount;
            ParticleSystem.Particle[] particles = new ParticleSystem.Particle[particleCount];
            ps.GetParticles(particles);

            for (int i = 0; i < particles.Length; i++)
                particles[i].velocity = new Vector3(particles[i].velocity.x, reducedSpeed, particles[i].velocity.z);
            ps.SetParticles(particles);
        }
    }

    private IEnumerator PlayShootSound()
    {
        yield return new WaitForSecondsRealtime(Random.Range(0.2f, 0.5f));
        shootSound.Play();
        while(true)
        {
            yield return new WaitForSecondsRealtime(Random.Range(0.5f, 1.5f));
            shootSound.Play();
        }
    }
}
