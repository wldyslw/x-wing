const
Globals = {
    scene: null,
    camera: null,
    sceneHeight: null,
    sceneWidth: null,
    renderer: null,
    container: null,
    MousePos: {
        x:0,
        y:0
    }
},
Objects = {
    xwing: null,
    tunnelSectionArr: [],
    currentBarier: null
},
Game = {
    status: 'normal',
    speed: 16,
},
Colors = {
    red:0xf25346,
    white:0xd8d0d1,
    brown:0x59332e,
    pink:0xF5986E,
    brownDark:0x23190f,
    blue:0x68c3c0
};

function init() {
    createScene();
    handleWindowResize();
    createLights();
    xWing.create();
    tunnel();

    loop();

    document.addEventListener('mousemove', handleMouseMove, false);

    Globals.renderer.render(Globals.scene, Globals.camera);
}
 
function createScene() {
    Globals.sceneHeight = window.innerHeight;
    Globals.sceneWidth = window.innerWidth;

    Globals.scene = new THREE.Scene();

    Globals.scene.fog = new THREE.Fog(0x212429, 1000, 2000);

    Globals.camera = new THREE.PerspectiveCamera(
        60, Globals.sceneWidth / Globals.sceneHeight, 1, 10000
    );
    Globals.camera.position.x = 0;
    Globals.camera.position.z = 200;
    Globals.camera.position.y = 100;
    
    Globals.renderer = new THREE.WebGLRenderer({ 
        alpha: true,
        antialias: true
    });
 
    Globals.renderer.setSize(Globals.sceneWidth, Globals.sceneHeight);
    
    Globals.renderer.shadowMap.enabled = true;
    
    Globals.container = document.getElementById('world');
    Globals.container.appendChild(Globals.renderer.domElement);
    
    window.addEventListener('resize', handleWindowResize, false);
}

function createLights() {
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
}

function handleWindowResize() {
    Globals.sceneHeight = window.innerHeight;
    Globals.sceneWidth = window.innerWidth;
    Globals.renderer.setSize(Globals.sceneWidth, Globals.sceneHeight);
    Globals.camera.aspect = Globals.sceneWidth / Globals.sceneHeight;
    Globals.camera.updateProjectionMatrix();
}

function handleMouseMove() {
    var tx = -1 + (event.clientX / Globals.sceneWidth) * 2;    
    var ty = 1 - (event.clientY / Globals.sceneHeight) * 2;
    Globals.MousePos = {x: tx, y: ty};
}

function updateSpacePlane() {
    const targetY = normalize(Globals.MousePos.y, -.8, .8, 0, 250);
    const targetX = normalize(Globals.MousePos.x, -.8, .8, -200, 200);

    Objects.xwing.mesh.position.y += (targetY - Objects.xwing.mesh.position.y) * 0.3;
    Objects.xwing.mesh.position.x += (targetX - Objects.xwing.mesh.position.x) * 0.3;

    Globals.camera.position.y += (targetY - Globals.camera.position.y) * 0.03;
    Globals.camera.position.x += (targetX - Globals.camera.position.x) * 0.03;

    Objects.xwing.mesh.rotation.x = (targetY - Objects.xwing.mesh.position.y) * 0.03;
    Objects.xwing.mesh.rotation.y = (Objects.xwing.mesh.position.x - targetX) * 0.02;
    Objects.xwing.mesh.rotation.z = (Objects.xwing.mesh.position.x - targetX) * 0.02;
}
 
function normalize(v,vmin,vmax,tmin, tmax){
 
    var nv = Math.max(Math.min(v,vmax), vmin);
    var dv = vmax - vmin;
    var pc = (nv - vmin) / dv;
    var dt = tmax - tmin;
    return tmin + (pc * dt); 
}

function handleCollision() {
    const Player = Objects.xwing.mesh;
    /*for (let vertexIndex = 0; vertexIndex < Player.geometry.vertices.length; vertexIndex++){       
        var localVertex = Player.geometry.vertices[vertexIndex].clone();
        var globalVertex = Player.matrix.multiplyVector3(localVertex);
        var directionVector = globalVertex.subSelf( Player.position );

        var ray = new THREE.Ray( Player.position, directionVector.clone().normalize() );
        var collisionResults = ray.intersectObjects( Objects.currentBarier );
        if ( collisionResults.length > 0 && collisionResults[0].distance < directionVector.length() ) 
        {
            console.log('Collided');
        }
    }*/
    if(Objects.currentBarier) {
        var firstBB = new THREE.Box3().setFromObject(Objects.xwing.mesh);
        var secondBB = new THREE.Box3().setFromObject(Objects.currentBarier.mesh);
        var collision = firstBB.intersectsBox(secondBB);
        if(collision) console.log('Collided');
    }
}

function xWing() {
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
}

xWing.materialA = new THREE.MeshPhongMaterial({color:0x666666, shading:THREE.FlatShading,});
xWing.materialB = new THREE.MeshPhongMaterial({color:0x444444, shading:THREE.FlatShading,});

xWing.fuselage = function() {
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
}

xWing.engine = function() {
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
}

xWing.wingA = function() {
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
}

xWing.wingB = function() {
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
}

//TODO
xWing.cabin = function() {}

xWing.create = function () {
    Objects.xwing = new xWing();
    Globals.scene.add(Objects.xwing.mesh);
}

function tunnel() {
    for(let i = 0; i < 10; i++) {
        Objects.tunnelSectionArr[i] = new tunnel.section();
        Objects.tunnelSectionArr[i].mesh.position.z = -i * 256;
        Objects.tunnelSectionArr[i].mesh.position.y = -130;
        //Objects.currentBarier = new tunnel.barrier();
        /*Objects.currentBarier.mesh.position.y = 250;
        Objects.tunnelSectionArr[i].mesh.add(Objects.currentBarier.mesh);*/
        Globals.scene.add(Objects.tunnelSectionArr[i].mesh);
    }
}

tunnel.section = function() {
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
}

tunnel.barrier = function() {
    this.mesh = new THREE.Object3D();

    const randomizer = 1 + Math.round(Math.random() * 4);

    const baseMk1Geom = new THREE.BoxGeometry(800, 100, 100);
    const baseMk1 = new THREE.Mesh(baseMk1Geom, xWing.materialB);

    const blockGeom = new THREE.BoxGeometry(60, 60, 60);
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
    baseMk4.applyMatrix(new THREE.Matrix4().makeRotationZ(-Math.PI/2))
    
    if(randomizer == 1 || randomizer == 2) {
        this.mesh.add(baseMk1);
    }
    if(randomizer == 3) {
        //this.mesh.add(baseMk2);
    }
    if(randomizer == 4) {
        //this.mesh.add(baseMk3);
    }
    if(randomizer == 5 || randomizer == 3 || randomizer == 4) {
        this.mesh.add(baseMk4);
    }
}

tunnel.move = function() {
    Objects.tunnelSectionArr.forEach((e,i) => {
        e.mesh.position.z += Game.speed;
        if(e.mesh.position.z > (256 - Game.speed)) {
            Globals.scene.remove(e.mesh);
            e.mesh.position.z = -2304;
            Globals.scene.add(e.mesh);
            if(i == 9) {
                if(Objects.currentBarier)
                    Objects.tunnelSectionArr[i].mesh.remove(Objects.currentBarier.mesh);
                Objects.currentBarier = new tunnel.barrier();
                Objects.currentBarier.mesh.position.y = 250;
                Objects.tunnelSectionArr[i].mesh.add(Objects.currentBarier.mesh);
            }
        }
    });
}

function loop(){ 
    Globals.renderer.render(Globals.scene, Globals.camera);

    updateSpacePlane();
    tunnel.move();
    handleCollision();
 
    requestAnimationFrame(loop);
}

window.addEventListener('load', init, false);
