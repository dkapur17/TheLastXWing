import * as THREE from "./lib/three.module.js";

class Explosion {

    constructor(x, y, z, particleCount, explosionSpeed, scene, color) {

        this.geometry = new THREE.BoxGeometry();
        this.material = new THREE.MeshBasicMaterial({ color })
        this.particleCount = particleCount;
        this.particlesLeft = particleCount;
        this.scene = scene;

        this.particles = []
        this.directions = []

        for (let i = 0; i < this.particleCount; i++) {
            const particle = new THREE.Mesh(this.geometry, this.material);
            particle.position.x = x;
            particle.position.y = y;
            particle.position.z = z;

            const direction = { x: (Math.random() - 0.5) * explosionSpeed, y: (Math.random() - 0.5) * explosionSpeed, z: (Math.random() - 0.5) * explosionSpeed };

            this.scene.add(particle);

            this.particles.push(particle);
            this.directions.push(direction);

        }

    }

    updateParticlePositions() {
        for (let i = 0; i < this.particleCount; i++) {
            this.particles[i].position.x += this.directions[i].x;
            this.particles[i].position.y += this.directions[i].y;
            this.particles[i].position.z += this.directions[i].z;

            this.particles[i].scale.x *= 0.9;
            this.particles[i].scale.y *= 0.9;
            this.particles[i].scale.z *= 0.9;


            if (this.particles[i].scale.x < 0.01) {
                this.scene.remove(this.particles[i]);
                this.particlesLeft--;
            }
        }
    }

}

export default Explosion;