import * as THREE from './lib/three.module.js';

class Player {

    constructor(xBound, zBound, lerpPercent, fireDelay, bulletVel) {
        this.modelLoaded = false;
        this.delta = lerpPercent;
        this.xBound = xBound;
        this.zBound = zBound;
        this.bulletVel = bulletVel;
        this.targetLocation = new THREE.Vector3(0, 0, 0);
        this.bullets = [];
        this.fireCommand = false;
        this.fireDelayElapsed = true;
        this.fireDelay = fireDelay;
        this.health = 100;
        this.score = 0;
        window.addEventListener("mousemove", (event) => {
            let z = ((window.innerHeight / 2 - event.clientY) / (window.innerHeight / 2)) * this.zBound[1];
            let x = ((window.innerWidth / 2 - event.clientX) / (window.innerWidth / 2)) * this.xBound[1];

            this.targetLocation.x = x;
            this.targetLocation.z = z;
        });

        window.addEventListener("mousedown", (event) => {
            this.fireCommand = true;
        });

        window.addEventListener("mouseup", () => {
            this.fireCommand = false;
        });
    }

    setModel(model) {
        this.model = model;
        this.modelLoaded = true;
    }

    setPosition(pos) {
        this.model.position.x = pos.x;
        this.model.position.y = pos.y;
        this.model.position.z = pos.z;
    }

    updateBounds(xBound, zBound) {
        this.xBound = xBound;
        this.zBound = zBound;
    }

    move() {
        // Move ship
        if (Math.abs(this.targetLocation.z - this.model.position.z) > this.delta)
            this.model.position.z += (this.targetLocation.z - this.model.position.z) * this.delta;
        if (Math.abs(this.targetLocation.x - this.model.position.x) > this.delta)
            this.model.position.x += (this.targetLocation.x - this.model.position.x) * this.delta;

        this.model.position.x = Math.max(this.xBound[0], Math.min(this.xBound[1], this.model.position.x));
        this.model.position.z = Math.max(this.zBound[0], Math.min(this.zBound[1], this.model.position.z));

        // Move bullets
        this.bullets.forEach(bullet => {
            bullet.position.z += this.bulletVel;
            if (bullet.position.z > this.zBound[1] + 20)
                this.scene.remove(bullet);
        });

        this.bullets = this.bullets.filter(bullet => bullet.position.z <= this.zBound[1] + 20);
    }

    linkScene(scene) {
        this.scene = scene;
    }

    fire() {
        if (this.fireCommand && this.fireDelayElapsed) {
            const bulletGeometry = new THREE.CylinderGeometry(0.2, 0.2, 5, 64);
            const bulletMaterial = new THREE.MeshBasicMaterial({ color: "#FF0000" });

            const spawnPoints = [
                { x: 6.5, y: 4.5, z: 8 },
                { x: -6.5, y: 4.5, z: 8 },
                // { x: 7, y: -1.5, z: 8 },
                // { x: -7, y: -1.5, z: 8 },
            ];

            spawnPoints.forEach(spawnPoint => {
                const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
                bullet.position.set(this.model.position.x, this.model.position.y, this.model.position.z);
                bullet.rotation.x = Math.PI / 2;
                bullet.position.x += spawnPoint.x;
                bullet.position.y += spawnPoint.y;
                bullet.position.z += spawnPoint.z;
                this.bullets.push(bullet);
                this.scene.add(bullet);
            });

            this.fireDelayElapsed = false;
            setTimeout(this.setFireDelayElapsed.bind(this), this.fireDelay);
        }
    }

    setFireDelayElapsed() {
        this.fireDelayElapsed = true;
    }


    checkCollisions(enemies, coins) {

        const collisions = [];

        const playerPoints = [
            { x: this.model.position.x, y: this.model.position.y, z: this.model.position.z },
            { x: this.model.position.x + 6.5, y: this.model.position.y, z: this.model.position.z },
            { x: this.model.position.x - 6.5, y: this.model.position.y, z: this.model.position.z },
        ]

        enemies.forEach(enemy => {
            let { minX, maxX, minY, maxY, minZ, maxZ } = enemy.boundingBox;
            minX += enemy.model.position.x;
            maxX += enemy.model.position.x;
            minY += enemy.model.position.y;
            maxY += enemy.model.position.y;
            minZ += enemy.model.position.z;
            maxZ += enemy.model.position.z;

            this.bullets.forEach(bullet => {

                if (bullet.position.x >= minX && bullet.position.x <= maxX && bullet.position.y >= minY && bullet.position.y <= maxY && bullet.position.z >= minZ && bullet.position.z <= maxZ) {
                    enemy.toDestroy = true;
                    this.scene.remove(bullet);
                    this.bullets = this.bullets.filter(bulletX => bullet != bulletX);
                    this.score += 5;
                    const pos = { x: enemy.model.position.x, y: enemy.model.position.y, z: enemy.model.position.z };
                    collisions.push(pos);
                }
            });

            let collided = false;
            playerPoints.forEach(point => {
                if (!collided && point.x >= minX && point.x <= maxX && point.y >= minY && point.y <= maxY && point.z >= minZ && point.z <= maxZ) {
                    collided = true;
                    enemy.toDestroy = true;
                    const pos = { x: enemy.model.position.x, y: enemy.model.position.y, z: enemy.model.position.z };
                    this.health -= 25;
                    this.score += 5;
                    this.health = Math.max(this.health, 0);
                    if (!collisions.includes(pos))
                        collisions.push(pos);
                }
            })
        });

        coins.forEach(coin => {
            let { minX, maxX, minY, maxY, minZ, maxZ } = coin.boundingBox;
            minX += coin.model.position.x;
            maxX += coin.model.position.x;
            minY += coin.model.position.y;
            maxY += coin.model.position.y;
            minZ += coin.model.position.z;
            maxZ += coin.model.position.z;

            if (this.model.position.x >= minX && this.model.position.x <= maxX && this.model.position.y >= minY && this.model.position.y <= maxY && this.model.position.z >= minZ && this.model.position.z <= maxZ) {
                coin.collected = true;
                this.score += 1;
            }

        })

        return collisions;
    }

    deathCheck() {
        if (this.health <= 0) {
            this.scene.remove(this.model);
            return true;
        }

        return false;

    }

};

export default Player;