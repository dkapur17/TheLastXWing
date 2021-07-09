import * as THREE from './lib/three.module.js';

class Enemy {

    constructor(model, x, y, z, follower, approachSpeed) {
        this.model = model;
        this.model.position.x = x;
        this.model.position.y = y;
        this.model.position.z = z;
        this.model.rotation.y = Math.PI;

        this.follower = follower;
        this.approachSpeed = approachSpeed;

        this.boundingBox = {
            minX: -6, maxX: 6,
            minY: -5, maxY: 5,
            minZ: -4, maxZ: 4
        };

        this.toDestroy = false;
    }

};

class Coin {

    constructor(model, x, y, z) {

        this.model = model;
        this.model.position.x = x;
        this.model.position.y = y;
        this.model.position.z = z;
        this.model.rotation.x = Math.PI / 2;

        this.boundingBox = {
            minX: -6, maxX: 6,
            minY: -2, maxY: 2,
            minZ: -4, maxZ: 4
        };

        this.collected = false;

    }

}


class EnemyManager {

    constructor(xBounds, zBounds, enemySpeed, followerProb, coinSpeed) {
        this.enemyModelLoaded = false;
        this.coinModelLoaded = false;
        this.explosionModelLoaded = false;
        this.spawing = false;
        this.enemies = [];
        this.coins = [];
        this.xBounds = xBounds;
        this.zBounds = zBounds;
        this.enemySpeed = enemySpeed;
        this.followerProb = followerProb;
        this.coinSpeed = coinSpeed;
    }


    setEnemyModel(model) {
        this.enemyModel = model;
        this.enemyModelLoaded = true;
    }

    setCoinModel(model) {
        this.coinModel = model;
        this.coinModelLoaded = true;
    }

    linkScene(scene) {
        this.scene = scene;
    }

    updateBounds(xBounds, zBounds) {
        this.xBounds = xBounds;
        this.zBounds = zBounds;
    }

    spawnCoin(pos) {
        if (this.coinModelLoaded) {
            const newCoinModel = this.coinModel.clone();

            const coin = new Coin(newCoinModel, pos.x, pos.y, pos.z);

            this.scene.add(coin.model);
            this.coins.push(coin);
        }
    }

    spawnEnemy() {
        if (this.enemyModelLoaded && !this.spawing) {
            const newEnemyModel = this.enemyModel.clone();
            const x = (Math.random() - 0.5) * 2 * this.xBounds[1];
            const y = 0
            const z = this.zBounds[1] + 20;

            const enemy = new Enemy(newEnemyModel, x, y, z, Math.random() <= this.followerProb, Math.random() / 10);

            this.scene.add(enemy.model);
            this.enemies.push(enemy);
            this.spawing = true;
            setTimeout(this.unsetSpawining.bind(this), Math.random() * 1000);
        }

    }

    moveCoins() {
        this.coins.forEach(coin => {
            coin.model.position.z -= this.coinSpeed;
            coin.model.rotation.z += 0.05;
        });

        this.coins = this.coins.filter(coin => coin.model.position.z >= this.zBounds[0] - 20);
    }

    moveEnemies(playerPos) {

        this.enemies.forEach(enemy => {
            if (enemy.follower)
                enemy.model.position.x += (playerPos.x - enemy.model.position.x) * enemy.approachSpeed;

            enemy.model.position.z -= this.enemySpeed;
            if (enemy.model.position.z < this.zBounds[0] - 20)
                this.scene.remove(enemy.model);
        });

        this.enemies = this.enemies.filter(enemy => enemy.model.position.z >= this.zBounds[0] - 20);
    }

    removeDestroyedEnemies() {
        this.enemies.forEach(enemy => {
            if (enemy.toDestroy) {
                this.scene.remove(enemy.model);
                this.spawnCoin(enemy.model.position);
            }

        });

        this.enemies = this.enemies.filter(enemy => !enemy.toDestroy);
    }

    removeCollectedCoins() {

        this.coins.forEach(coin => {
            if (coin.collected)
                this.scene.remove(coin.model);
        });

        this.coins = this.coins.filter(coin => !coin.collected);

    }

    unsetSpawining() {
        this.spawing = false;
    }

};

export default EnemyManager;