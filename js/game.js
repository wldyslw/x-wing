const Globals = {
    scene: null,
    camera: null,
    sceneHeight: null,
    sceneWidth: null,
    renderer: null,
    container: null,
    MousePos: {
        x:0,
        y:0
    },
    createScene: function() {
        Globals.sceneHeight = window.innerHeight;
        Globals.sceneWidth = window.innerWidth;

        Globals.scene = new THREE.Scene();

        Globals.scene.fog = new THREE.Fog(0x212429, 1000, 2000);

        Globals.camera = new THREE.PerspectiveCamera(
            60, Globals.sceneWidth / Globals.sceneHeight, 1, 10000
        );
        Globals.camera.position.x = 0;
        Globals.camera.position.z = 300;
        Globals.camera.position.y = 100;
        
        Globals.renderer = new THREE.WebGLRenderer({ 
            alpha: true,
            antialias: true
        });
     
        Globals.renderer.setSize(Globals.sceneWidth, Globals.sceneHeight);
        
        Globals.renderer.shadowMap.enabled = true;
        
        Globals.container = document.getElementById('world');
        Globals.container.appendChild(Globals.renderer.domElement);
        
        window.addEventListener('resize', Globals.handleWindowResize, false);
    },

    loop: function(){ 
        Globals.renderer.render(Globals.scene, Globals.camera);

        if(Game.status === 'normal') {
            tunnel.move();
            Game.updateScore();
            Game.handleCollision();
        }
        Game.updateSpacePlane();
     
        requestAnimationFrame(Globals.loop);
    },

    createLights: function() {
        const hemisphereLight = new THREE.HemisphereLight(0xada7e2, 0x000000, .9);
        const shadowLight = new THREE.DirectionalLight(0xffffff, .9);
        const ambientLight = new THREE.AmbientLight(0xada7e2, .5);
     
        shadowLight.position.set(0, 400, 200);
        shadowLight.castShadow = true;

        shadowLight.shadow.camera.left = -400;
        shadowLight.shadow.camera.right = 400;
        shadowLight.shadow.camera.top = 400;
        shadowLight.shadow.camera.bottom = -400;
        shadowLight.shadow.camera.near = 1;
        shadowLight.shadow.camera.far = 1000;

        shadowLight.shadow.mapSize.width = 2048;
        shadowLight.shadow.mapSize.height = 2048;
        
        Globals.scene.add(hemisphereLight); 
        Globals.scene.add(ambientLight);
        Globals.scene.add(shadowLight);
    },

    handleWindowResize: function() {
        Globals.sceneHeight = window.innerHeight;
        Globals.sceneWidth = window.innerWidth;
        Globals.renderer.setSize(Globals.sceneWidth, Globals.sceneHeight);
        Globals.camera.aspect = Globals.sceneWidth / Globals.sceneHeight;
        Globals.camera.updateProjectionMatrix();
    },

    handleMouseMove: function() {
        var tx = -1 + (event.clientX / Globals.sceneWidth) * 2;    
        var ty = 1 - (event.clientY / Globals.sceneHeight) * 2;
        Globals.MousePos = {x: tx, y: ty};
    },

    //
};
const Objects = {
    xwing: null,
    tunnelSectionArr: [],
    currentBarier: null
};
const Game = {
    status: 'normal',
    score: 0,
    speed: 32,
    scoreContainer: document.getElementById('score'),
    startTime: Date.now(),
    deltaT: 0,
    collisionCounter: 0,

    updateSpacePlane: function() {
        const targetY = normalize(Globals.MousePos.y, -.8, .8, 0, 250);
        const targetX = normalize(Globals.MousePos.x, -.8, .8, -220, 220);

        Objects.xwing.mesh.position.y += (targetY - Objects.xwing.mesh.position.y) * 0.3;
        Objects.xwing.mesh.position.x += (targetX - Objects.xwing.mesh.position.x) * 0.3;

        Globals.camera.position.y += (targetY - Globals.camera.position.y) * 0.03;
        Globals.camera.position.x += (targetX - Globals.camera.position.x) * 0.03;

        Objects.xwing.mesh.rotation.x = (targetY - Objects.xwing.mesh.position.y) * 0.03;
        Objects.xwing.mesh.rotation.y = (Objects.xwing.mesh.position.x - targetX) * 0.02;
        Objects.xwing.mesh.rotation.z = (Objects.xwing.mesh.position.x - targetX) * 0.02;
    },

    handleCollision: function() {
        if(Objects.currentBarier && Objects.xwing) {
            const spacePlane = new THREE.Box3().setFromObject(Objects.xwing.mesh);
            const obstacleArr = Array.from(Objects.currentBarier.mesh.children);
            let collision = false;
            obstacleArr.forEach((e,i) => {
                if(!collision) collision = spacePlane.intersectsBox(new THREE.Box3().setFromObject(e));
            });
            if(collision) Game.collide();
        }
    },

    collide: function() {
        Game.collisionCounter++;
        if(Game.collisionCounter > 1) { //TODO: make a fuction to find optimal collision count
            Game.status = 'gameover';
            Game.scoreContainer.innerHTML = 'Game Over';
            Game.scoreContainer.classList.add('gameover');
            document.getElementById('retry').classList.add('btn-retry-active');
            Globals.scene.remove(Objects.xwing.mesh);
        }
    },

    updateScore: function() {
        Game.deltaT = Date.now() - Game.startTime;
        Game.score = Math.floor(Game.speed * Game.deltaT / 1000);
        Game.scoreContainer.innerHTML = 'Score: ' + Game.score;
    }
};
const Colors = {
    red:0xf25346,
    white:0xd8d0d1,
    brown:0x59332e,
    pink:0xF5986E,
    brownDark:0x23190f,
    blue:0x68c3c0
};

const xWing = {
    combinate: function() {
        this.mesh = new THREE.Mesh();

        const fuselage = new xWing.fuselage();
        this.mesh.add(fuselage.mesh);

        const wingTL = new xWing.wingA();
        wingTL.mesh.position.x -= 43;
        wingTL.mesh.position.y += 8
        wingTL.mesh.rotation.z = -0.2;
        this.mesh.add(wingTL.mesh);

        const wingTR = new xWing.wingB();
        wingTR.mesh.position.x += 43;
        wingTR.mesh.position.y += 8
        wingTR.mesh.rotation.z = 0.2;
        this.mesh.add(wingTR.mesh);

        const wingBL = new xWing.wingA();
        wingBL.mesh.rotation.z = Math.PI - 0.2;
        wingBL.mesh.position.x += 43;
        wingBL.mesh.position.y -= 8
        this.mesh.add(wingBL.mesh);

        const wingBR = new xWing.wingB();
        wingBR.mesh.rotation.z = Math.PI + 0.2;
        wingBR.mesh.position.x -= 43;
        wingBR.mesh.position.y -= 8
        this.mesh.add(wingBR.mesh);
    },

    materialA: new THREE.MeshPhongMaterial({color:0x666666, shading:THREE.FlatShading,}),
    materialB: new THREE.MeshPhongMaterial({color:0x444444, shading:THREE.FlatShading,}),

    fuselage: function() {
        this.mesh = new THREE.Mesh();

        const bodyBack  = new THREE.Mesh(new THREE.BoxGeometry(15, 20, 30), xWing.materialA);
        bodyBack.castShadow = true;
        bodyBack.receiveShadow = true;
        this.mesh.add(bodyBack);

        const bodyMidGeom = new THREE.BoxGeometry(15, 20, 10);
        bodyMidGeom.vertices[6].y += 5;
        bodyMidGeom.vertices[3].y += 5;
        const bodyMid = new THREE.Mesh(bodyMidGeom, xWing.materialA);
        bodyMid.position.z = -20;
        bodyMid.castShadow = true;
        bodyMid.receiveShadow = true;
        this.mesh.add(bodyMid);

        const bodyNoseGeom = new THREE.BoxGeometry(15, 15, 80);
        bodyNoseGeom.vertices[6].y += 6;
        bodyNoseGeom.vertices[6].x += 5;
        bodyNoseGeom.vertices[3].y += 6;
        bodyNoseGeom.vertices[3].x -= 5;
        bodyNoseGeom.vertices[1].y -= 6;
        bodyNoseGeom.vertices[1].x -= 5;
        bodyNoseGeom.vertices[4].y -= 6;
        bodyNoseGeom.vertices[4].x += 5;
        const bodyNose = new THREE.Mesh(bodyNoseGeom, xWing.materialA);
        bodyNose.position.z = -65;
        bodyNose.position.y += 2.5;
        bodyNose.castShadow = true;
        bodyNose.receiveShadow = true;
        this.mesh.add(bodyNose)
    },

    engine: function() {
        this.mesh = new THREE.Mesh();
        const engFrontG = new THREE.BoxGeometry(10,10,20);
        const engBackG = new THREE.BoxGeometry(7,7,20);

        const engFront = new THREE.Mesh(engFrontG, xWing.materialA);
        engFront.castShadow = true;
        engFront.receiveShadow = true;
        this.mesh.add(engFront);

        const engBack = new THREE.Mesh(engBackG, xWing.materialB);
        engBack.castShadow = true;
        engBack.receiveShadow = true;
        engBack.position.z += 20;
        this.mesh.add(engBack);
    },

    wingA: function() {
        this.mesh = new THREE.Mesh();

        const wingG = new THREE.BoxGeometry(70,4,28);
        wingG.vertices[5].z -= 15;
        wingG.vertices[7].z -= 15;
        const wing = new THREE.Mesh(wingG, xWing.materialA);

        wing.castShadow = true;
        wing.receiveShadow = true;

        this.mesh.add(wing);

        const eng = new xWing.engine();
        eng.mesh.position.x += 30;
        eng.mesh.position.y += 7;
        eng.mesh.position.z -= 6;

        eng.castShadow = true;
        eng.receiveShadow = true;

        this.mesh.add(eng.mesh);

        const antenna = new THREE.Mesh(new THREE.BoxGeometry(2,2,50), xWing.materialA);
        antenna.position.x -= 34;
        antenna.position.y += 3;
        antenna.position.z -= 26;

        antenna.castShadow = true;
        antenna.receiveShadow = true;

        this.mesh.add(antenna);
    },

    wingB: function() {
        this.mesh = new THREE.Mesh();

        const wingG = new THREE.BoxGeometry(70,4,28);
        wingG.vertices[0].z -= 15;
        wingG.vertices[2].z -= 15;
        const wing = new THREE.Mesh(wingG, xWing.materialA);

        wing.castShadow = true;
        wing.receiveShadow = true;

        this.mesh.add(wing);

        const eng = new xWing.engine();
        eng.mesh.position.x -= 30;
        eng.mesh.position.y += 7;
        eng.mesh.position.z -= 6;

        eng.castShadow = true;
        eng.receiveShadow = true;

        this.mesh.add(eng.mesh);

        const antenna = new THREE.Mesh(new THREE.BoxGeometry(2,2,50), xWing.materialA);
        antenna.position.x += 34;
        antenna.position.y += 3;
        antenna.position.z -= 26;

        antenna.castShadow = true;
        antenna.receiveShadow = true;

        this.mesh.add(antenna);
    },

    create: function () {
        Objects.xwing = new xWing.combinate();
        Globals.scene.add(Objects.xwing.mesh);
    }
};

const tunnel = {
    create: function() {
        for(let i = 0; i < 10; i++) {
            Objects.tunnelSectionArr[i] = new tunnel.section();
            Objects.tunnelSectionArr[i].mesh.position.z = -i * 256;
            Objects.tunnelSectionArr[i].mesh.position.y = -130;
            Globals.scene.add(Objects.tunnelSectionArr[i].mesh);
        }
    },

    section: function() {
        this.mesh = new THREE.Object3D();

        const base = new THREE.Mesh(new THREE.BoxGeometry(800,50,256), xWing.materialB);
        const wallL = new THREE.Mesh(new THREE.BoxGeometry(300,400,256), xWing.materialB);
        const wallR = new THREE.Mesh(new THREE.BoxGeometry(300,400,256), xWing.materialB);

        wallL.position.x = -500;
        wallL.position.y = 220;
        wallR.position.x = 500;
        wallR.position.y = 220;

        base.castShadow = true;
        base.receiveShadow = true;
        wallL.castShadow = true;
        wallL.receiveShadow = true;
        wallR.castShadow = true;
        wallR.receiveShadow = true;

        const blockBottomGeom = new THREE.BoxGeometry(100,50,100);
        blockBottomGeom.vertices[0].x -= 15;
        blockBottomGeom.vertices[0].z -= 15;
        blockBottomGeom.vertices[1].x -= 15;
        blockBottomGeom.vertices[1].z += 15;
        blockBottomGeom.vertices[4].x += 15;
        blockBottomGeom.vertices[4].z += 15;
        blockBottomGeom.vertices[5].x += 15;
        blockBottomGeom.vertices[5].z -= 15;

        const blockBottomArr = [];
        
        const blockLeftGeom = blockBottomGeom.clone();
        blockLeftGeom.applyMatrix(new THREE.Matrix4().makeRotationZ(-Math.PI / 2));
        const blockLeftArr = [];

        const blockRightGeom = blockBottomGeom.clone();
        blockRightGeom.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI / 2));
        const blockRightArr = [];

        for(let i = 0; i < 15; i++) {
            blockBottomArr.push(new THREE.Mesh(blockBottomGeom, xWing.materialB));
            blockBottomArr[i].position.x = (Math.random() > 0.5 ? -1 : 1) * Math.random() * 400;
            blockBottomArr[i].position.z = Math.random() * 220;
            blockBottomArr[i].position.y = 0;

            blockBottomArr[i].scale.set(1 + Math.random(),1 + Math.random()*1.5,1 + Math.random())

            blockBottomArr[i].castShadow = true;
            blockBottomArr[i].receiveShadow = true;

            this.mesh.add(blockBottomArr[i]);

            blockLeftArr.push(new THREE.Mesh(blockLeftGeom, xWing.materialB));
            blockLeftArr[i].position.x = -360;
            blockLeftArr[i].position.z = Math.random() * 220;
            blockLeftArr[i].position.y = 120 + Math.random() * 200;

            blockLeftArr[i].scale.set(1 + Math.random(),1 + Math.random()*2,1 + Math.random())

            blockLeftArr[i].castShadow = true;
            blockLeftArr[i].receiveShadow = true;

            this.mesh.add(blockLeftArr[i]);

            blockRightArr.push(new THREE.Mesh(blockRightGeom, xWing.materialB));
            blockRightArr[i].position.x = 360;
            blockRightArr[i].position.z = Math.random() * 220;
            blockRightArr[i].position.y = 120 + Math.random() * 200;

            blockRightArr[i].scale.set(1 + Math.random(),1 + Math.random()*2,1 + Math.random());

            blockRightArr[i].castShadow = true;
            blockRightArr[i].receiveShadow = true;

            this.mesh.add(blockRightArr[i]);
        }

        this.mesh.add(base,wallL,wallR);
    },

    barrier: function() { //TODO: reimplement barrier generator
        const randomizer = 1 + Math.round(Math.random() * 4);

        const baseMk1Geom = new THREE.BoxGeometry(800, 100, 100);
        const baseMk1 = new THREE.Mesh(baseMk1Geom, xWing.materialB);

        baseMk1.castShadow = true;
        baseMk1.receiveShadow = true;

        const blockGeom = new THREE.BoxGeometry(70, 70, 70);
        const blockArr = []
        for(let i = 0; i <= 16; i++) {
            blockArr.push(new THREE.Mesh(blockGeom, xWing.materialB));
            blockArr[i].position.x = -400 + i * 50;
            blockArr[i].position.y = (Math.random() > 0.5 ? -1 : 1) * Math.random() * 10;
            blockArr[i].scale.set(1 + Math.random()*2,1 + Math.random()*2,1 + Math.random()*2);
            baseMk1.add(blockArr[i]);
        }

        const baseMk2 = baseMk1.clone();
        baseMk2.applyMatrix(new THREE.Matrix4().makeRotationZ(Math.PI/4));
        const baseMk3 = baseMk1.clone();
        baseMk3.applyMatrix(new THREE.Matrix4().makeRotationZ(-Math.PI/4))
        const baseMk4 = baseMk1.clone();
        baseMk4.applyMatrix(new THREE.Matrix4().makeScale(.6,1.2,1));
        baseMk4.applyMatrix(new THREE.Matrix4().makeRotationZ(-Math.PI/2));
        
        if(randomizer == 1 || randomizer == 2) {
            baseMk1.position.y = (Math.random() > .5 ? -1 : 1) * Math.random() * 200;
            this.mesh = baseMk1;
        }
        if(randomizer == 3) {
            //
        }
        if(randomizer == 4) {
            //
        }
        if(randomizer == 5 || randomizer == 3 || randomizer == 4) {
            baseMk4.position.x = (Math.random() > .5 ? -1 : 1) * Math.random() * 300;
            this.mesh = baseMk4;
        }
    },

    move: function() {
        Objects.tunnelSectionArr.forEach((e,i) => {
            e.mesh.position.z += Game.speed;
            if(e.mesh.position.z > (256 - Game.speed)) {
                Globals.scene.remove(e.mesh);
                e.mesh.position.z = -2304;
                Globals.scene.add(e.mesh);
                if(i == 9) {
                    if(Objects.currentBarier) {
                        Game.collisionCounter = 0;
                        Objects.tunnelSectionArr[i].mesh.remove(Objects.currentBarier.mesh);
                    }
                    Objects.currentBarier = new tunnel.barrier();
                    Objects.currentBarier.mesh.position.y = 250;
                    Objects.tunnelSectionArr[i].mesh.add(Objects.currentBarier.mesh);
                }
            }
        });
    }
};
 
function normalize(v,vmin,vmax,tmin, tmax) { 
    var nv = Math.max(Math.min(v,vmax), vmin);
    var dv = vmax - vmin;
    var pc = (nv - vmin) / dv;
    var dt = tmax - tmin;
    return tmin + (pc * dt); 
}

function init() {
    Globals.createScene();
    Globals.handleWindowResize();
    Globals.createLights();
    xWing.create();
    tunnel.create();

    Globals.loop();

    document.addEventListener('mousemove', Globals.handleMouseMove, false);

    Globals.renderer.render(Globals.scene, Globals.camera);
}

window.addEventListener('load', init, false);
