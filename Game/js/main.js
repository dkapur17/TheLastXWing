import * as THREE from './lib/three.module.js';
import { GLTFLoader } from './lib/GLTFLoader.js';

import Player from './player.js';
import EnemyManager from './enemy.js';
import Explosion from './explosion.js';

let scene, camera, renderer, height, width, modelLoader, player, playerExplosion, enemyManager;
const origin = new THREE.Vector3(0, 0, 1);
let explosions = [];
let hud = document.querySelector('#HUD');

const init = () => {

    document.body.removeChild(document.querySelector('#splash'));

    height = window.innerHeight;
    width = window.innerWidth;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    // camera = new THREE.OrthographicCamera(-145, 145, 65, -65, 0.1, 1000);
    camera.position.set(0, 100, 0); 
    const posZ = camera.position.y * Math.tan(camera.fov * Math.PI / 360);
    const posX = posZ * camera.aspect;

    player = new Player([-posX, posX], [-posZ, posZ], 0.1, 500, 5);
    enemyManager = new EnemyManager([-posX, posX], [-posZ, posZ], 2, 0.3, 0.3);

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    document.body.appendChild(renderer.domElement);

    window.addEventListener("resize", () => {
        height = window.innerHeight;
        width = window.innerWidth;

        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        const posZ = camera.position.y * Math.tan(camera.fov * Math.PI / 360);
        const posX = posZ * camera.aspect;

        player.updateBounds([-posX, posX], [-posZ, posZ]);
        enemyManager.updateBounds([-posX, posX], [-posZ, posZ]);

    });

    loadSkybox();
    loadModels();
    loadLighting();

    playerExplosion = null;

    player.linkScene(scene);
    enemyManager.linkScene(scene);

    camera.lookAt(origin);
    gameLoop();

};

const update = () => {
    if (player.modelLoaded && (player.health > 0 || playerExplosion.particlesLeft)) {
        if (player.health > 0) {
            player.move();
            player.fire();

        }
        if (enemyManager.enemyModelLoaded) {
            enemyManager.spawnEnemy();
            enemyManager.moveEnemies(player.model.position);
        }

        let collisionSpots = []
        if (player.health)
            collisionSpots = player.checkCollisions(enemyManager.enemies, enemyManager.coins);

        collisionSpots.forEach(collisionSpot => {
            const explosion = new Explosion(collisionSpot.x, collisionSpot.y, collisionSpot.z, 200, 3, scene, "#B74514");
            explosions.push(explosion);
        });

        explosions.forEach(explosion => explosion.updateParticlePositions());

        explosions = explosions.filter(explosion => explosion.particlesLeft > 0);

        enemyManager.removeDestroyedEnemies();

        enemyManager.moveCoins();

        enemyManager.removeCollectedCoins();

        if (player.deathCheck() && !playerExplosion)
            playerExplosion = new Explosion(player.model.position.x, player.model.position.y, player.model.position.z, 1000, 5, scene, "#39FF14");
        else if (playerExplosion)
            playerExplosion.updateParticlePositions();
    }
};

const render = () => {

    if (player.health) {
        hud.children[0].innerHTML = `Score: ${player.score}`;
        hud.children[1].innerHTML = `Health: ${player.health}%`;
    }
    else if (hud) {
        hud.parentNode.removeChild(hud);
        hud = null;
        const gameOverOverlay = document.createElement('div');
        gameOverOverlay.style.position = "absolute";
        gameOverOverlay.style.top = "0%";
        gameOverOverlay.style.color = "#ffffff";
        gameOverOverlay.style.backgroundColor = "rgba(0,0,0,0.3)";
        gameOverOverlay.style.width = "100%";
        gameOverOverlay.style.height = "100%";
        gameOverOverlay.style.display = "table";
        gameOverOverlay.style.userSelect = "none";
        document.body.appendChild(gameOverOverlay);

        gameOverOverlay.addEventListener("mousedown", () => {
            window.location.reload();
        });

        const overlayContent = document.createElement('div');
        overlayContent.style.display = "table-cell";
        overlayContent.style.verticalAlign = "middle";
        overlayContent.style.textAlign = "center";
        gameOverOverlay.appendChild(overlayContent);

        const finalScoreText = document.createElement('p');
        finalScoreText.innerText = `Final Score: ${player.score}`;
        finalScoreText.style.fontSize = '3rem';
        overlayContent.appendChild(finalScoreText);

        const replayText = document.createElement('p');
        replayText.innerText = `Click to Replay`;
        replayText.style.fontSize = '1rem';
        overlayContent.appendChild(replayText);


    }

};

const gameLoop = () => {
    renderer.render(scene, camera);
    requestAnimationFrame(gameLoop);

    update();
    render();
};

const loadSkybox = () => {
    const skyboxFaces = ['right.png', 'left.png', 'top.png', 'bottom.png', 'front.png', 'back.png'];
    const skyboxLoader = new THREE.CubeTextureLoader();
    skyboxLoader.setPath('../assets/skybox/');
    const skybox = skyboxLoader.load(skyboxFaces);
    scene.background = skybox;
};

const loadModels = () => {

    modelLoader = new GLTFLoader();
    modelLoader.load('./assets/models/XWing.glb', (gltf) => {
        gltf.scene.traverse(c => {
            c.castShadow = true;
        });
        player.setModel(gltf.scene);
        scene.add(player.model);
        player.setPosition(new THREE.Vector3(0, 0, 0));
    });

    modelLoader.load('./assets/models/tie.glb', (gltf) => {
        gltf.scene.traverse(c => {
            c.castShadow = true;
        });
        enemyManager.setEnemyModel(gltf.scene);
    });

    modelLoader.load('./assets/models/crest.glb', (gltf) => {
        gltf.scene.traverse(c => {
            c.castShadow = true;
        });
        enemyManager.setCoinModel(gltf.scene);
    });

};

const loadLighting = () => {
    const light = new THREE.AmbientLight(0x888888); // soft white light
    scene.add(light);
};

document.querySelector('#splash').addEventListener('click', () => {
    init();
});