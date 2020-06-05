/**
 * Created by wjwong on 12/4/15.
 */
/// <reference path="../../../../../model/genstatesdb.ts" />
/// <reference path="../../../../../public/vendor/babylonjs/babylon.2.2.d.ts" />
/// <reference path="../../../../../server/typings/lodash/lodash.d.ts" />
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var miGen3DEngine;
(function (miGen3DEngine) {
    var c3DEngine = (function () {
        function c3DEngine(fieldsize) {
            this.hasControls = false;
            this.mass = 0.001;
            this.rest = 0;
            this.fric = 1;
            this.opt = {
                showGrid: false,
                showImages: true,
                showLogos: true,
                hasPhysics: true
            };
            this.ground = null;
            this.skybox = null;
            this.canvas = document.getElementById("renderCanvasBab");
            this.numTextures = new Array(21);
            this.cubeslist = [];
            this.cubesdata = {};
            this.numcubes = 0;
            this.cubecolors = ['red', 'blue', 'green', 'cyan', 'magenta', 'yellow'];
            this.cubenames = ['adidas', 'bmw', 'burger king', 'coca cola', 'esso', 'heineken', 'hp', 'mcdonalds', 'mercedes benz', 'nvidia', 'pepsi', 'shell', 'sri', 'starbucks', 'stella artois', 'target', 'texaco', 'toyota', 'twitter', 'ups'];
            this.colorids = {};
            this.cubesize = {
                s: 1,
                m: 2,
                l: 3
            };
            this.colorids['red'] = BABYLON.Color3.FromInts(255, 0, 0);
            this.colorids['blue'] = BABYLON.Color3.FromInts(67, 91, 202);
            this.colorids['magenta'] = BABYLON.Color3.FromInts(200, 0, 200);
            this.colorids['yellow'] = BABYLON.Color3.FromInts(255, 255, 0);
            this.colorids['cyan'] = BABYLON.Color3.FromInts(34, 181, 191);
            this.colorids['purple'] = BABYLON.Color3.FromInts(135, 103, 166);
            this.colorids['green'] = BABYLON.Color3.FromInts(0, 255, 0);
            this.colorids['orange'] = BABYLON.Color3.FromInts(233, 136, 19);
            this.fieldsize = fieldsize;
        }
        /**
         * Create Dynamic number textures for use in cubes
         */
        c3DEngine.prototype.createNumTexture = function (scene) {
            for (var i = 0; i < this.numTextures.length; i++) {
                this.numTextures[i] = new BABYLON.DynamicTexture("dynamic texture", 256, scene, true);
                this.numTextures[i].drawText(i.toString(), 32, 128, "bold 140px verdana", "black", "#aaaaaa");
            }
        };
        ;
        /**
         * Create cubes based on size s m l and color
         * data: size, color scene, pos (position)
         * @param data
         */
        c3DEngine.prototype.createCube = function (data) {
            var block = data.block;
            var boxsize = block.shape.shape_params.side_length;
            var objdesc = block.name + '_' + block.shape.type + '_' + boxsize;
            var objname = objdesc + '_' + block.id;
            var boxcolor = this.colorids['purple'];
            var boxmat = new BABYLON.StandardMaterial(objname, data.scene);
            //boxmat.diffuseTexture.hasAlpha = true;
            //boxmat.specularColor = BABYLON.Color3.Black();
            boxmat.alpha = 1.0;
            //boxmat.diffuseColor = new BABYLON.Color3(0.5, 0.5, 1.0);
            var faceCol = new Array(6);
            if (this.opt.showImages) {
                var boxt;
                if (this.opt.showLogos)
                    boxt = new BABYLON.Texture("img/textures/logos/" + block.name.replace(/ /g, '') + '.png', this.scene);
                else
                    boxt = this.numTextures[block.id];
                boxt.uScale = 1;
                boxt.vScale = 1;
                boxt.wAng = Math.PI / 2;
                boxmat.diffuseTexture = boxt;
                for (var i = 0; i < 6; i++) {
                    var cv = this.colorids[block.shape.shape_params['face_' + (i + 1)].color];
                    faceCol[i] = new BABYLON.Color4(cv.r, cv.g, cv.b, 1);
                }
            }
            else {
                if (block && block.shape && block.shape.shape_params) {
                    for (var i = 0; i < 6; i++) {
                        var cv = this.colorids[block.shape.shape_params['face_' + (i + 1)].color];
                        faceCol[i] = new BABYLON.Color4(cv.r, cv.g, cv.b, 1);
                    }
                }
                else {
                    var cv = this.colorids['orange'];
                    for (var i = 0; i < 6; i++) {
                        faceCol[i] = new BABYLON.Color4(cv.r, cv.g, cv.b, 1);
                    }
                }
            }
            //boxmat.diffuseColor = boxcolor;
            //boxmat.alpha = 0.8;
            /*var hSpriteNb =  14;  // 6 sprites per raw
             var vSpriteNb =  8;  // 4 sprite raws
             var faceUV = new Array(6);
             for (var i = 0; i < 6; i++) {
             faceUV[i] = new BABYLON.Vector4(0/hSpriteNb, 0, 1/hSpriteNb, 1 / vSpriteNb);
             }*/
            var opt = {
                width: boxsize,
                height: boxsize,
                depth: boxsize,
                faceColors: faceCol
            };
            var box = BABYLON.Mesh.CreateBox(objname, opt, data.scene);
            //var box = BABYLON.Mesh.CreateBox(objname, boxsize, data.scene);
            //box.position.y = 5;
            box.position = data.pos;
            box.visibility = 1;
            box.material = boxmat;
            box.showBoundingBox = false;
            box.checkCollisions = true;
            box.isVisible = data.isVisible;
            box.boxsize = boxsize;
            var elipbox = boxsize;
            box.ellipsoid = new BABYLON.Vector3(elipbox, elipbox, elipbox);
            //box.ellipsoidOffset = new BABYLON.Vector3(0, 0.1, 0);
            box.applyGravity = true;
            box.receiveShadows = true;
            box.rotation.y = 0; //Math.PI/4;
            /*else
             if(!box.rotationQuaternion)
             box.rotationQuaternion = new BABYLON.Quaternion.Identity(); //make a quaternion available if no physics*/
            /*if(hasPhysics)
             box.setPhysicsState({impostor:BABYLON.PhysicsEngine.BoxImpostor, move:true, mass:boxsize, friction:0.6, restitution:0.1});*/
            box.onCollide = function (a) {
                console.warn('oncollide', objname, this, a);
            };
            //box.updatePhysicsBodyPosition();
            //box.refreshBoundingInfo();
            //box.moveWithCollisions(new BABYLON.Vector3(-1, 0, 0));
            this.numcubes++;
            this.cubesdata[block.id] = { objidx: this.cubeslist.length, meta: block };
            this.cubeslist.push(box);
        };
        ;
        c3DEngine.prototype.isZeroVec = function (vect3) {
            if (vect3.x < -0.001 || vect3.x > 0.001)
                return false;
            if (vect3.y < -0.001 || vect3.y > 0.001)
                return false;
            if (vect3.z < -0.001 || vect3.z > 0.001)
                return false;
            return true;
        };
        ;
        // This begins the creation of a function that we will 'call' just after it's built
        c3DEngine.prototype.createScene = function () {
            // Now create a basic Babylon Scene object
            var scene = new BABYLON.Scene(this.engine);
            this.oimo = new BABYLON.OimoJSPlugin();
            scene.enablePhysics(new BABYLON.Vector3(0, -10, 0), this.oimo);
            // Change the scene background color to green.
            scene.clearColor = new BABYLON.Color3(0, 0, 0.5);
            scene.collisionsEnabled = true;
            scene.workerCollisions = true;
            //Left Hand Rule:
            //https://en.wikipedia.org/wiki/Right-hand_rule
            //  Create an ArcRotateCamera aimed at 0,0,0, with no alpha, beta or radius, so be careful.  It will look broken.
            //this.camera = new BABYLON.ArcRotateCamera("ArcRotateCamera", 0, 0, this.fieldsize, new BABYLON.Vector3(0, 0, 0), scene);
            // Quick, let's use the setPosition() method... with a common Vector3 position, to make our camera better aimed.
            //this.camera.setPosition(new BABYLON.Vector3(0, this.fieldsize * 0.95, -(this.fieldsize * 0.8)));
            // This creates and positions a free camera
            this.camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 1.8, -1.8), scene);
            // This targets the camera to scene origin
            this.camera.setTarget(new BABYLON.Vector3(0, 0.1, 0));
            // This attaches the camera to the canvas
            this.camera.attachControl(this.canvas, true);
            scene.activeCamera = this.camera;
            if (this.hasControls)
                scene.activeCamera.attachControl(this.canvas);
            // This creates a light, aiming 0,1,0 - to the sky.
            var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
            // Dim the light a small amount
            light.intensity = 1.0;
            // this creates dir. light for shadows
            /*var dirlight = new BABYLON.DirectionalLight("dir1", new BABYLON.Vector3(-0.4, -2, -0.4), scene);
             // Dim the light a small amount
             dirlight.intensity = 0.6;
             dirlight.position = new BABYLON.Vector3(0, 40, 0);*/
            /*var pl = new BABYLON.PointLight("pl", new BABYLON.Vector3(0, 10, 0), scene);
             pl.diffuse = new BABYLON.Color3(1, 1, 1);
             pl.specular = new BABYLON.Color3(1, 1, 1);
             pl.intensity = 0.8;*/
            /** create origin*/
            /*var matPlan = new BABYLON.StandardMaterial("matPlan1", scene);
             matPlan.backFaceCulling = false;
             matPlan.emissiveColor = new BABYLON.Color3(0.2, 1, 0.2);
             var origin = BABYLON.Mesh.CreateSphere("origin", 4, 0.3, scene);
             origin.material = matPlan;*/
            /** SKYBOX **/
            BABYLON.Engine.ShadersRepository = "shaders/";
            this.skybox = BABYLON.Mesh.CreateSphere("skyBox", 10, 2500, scene);
            var shader = new BABYLON.ShaderMaterial("gradient", scene, "gradient", {});
            shader.setFloat("offset", 0);
            shader.setFloat("exponent", 0.6);
            shader.setColor3("topColor", BABYLON.Color3.FromInts(0, 119, 255));
            shader.setColor3("bottomColor", BABYLON.Color3.FromInts(240, 240, 255));
            shader.backFaceCulling = false;
            this.skybox.material = shader;
            /** GROUND **/
            // Material
            var mat = new BABYLON.StandardMaterial("ground", scene);
            mat.diffuseColor = BABYLON.Color3.FromInts(63, 117, 50);
            /*var t = new BABYLON.Texture("img/textures/wood.jpg", scene);
             t.uScale = t.vScale = 5;
             mat.diffuseTexture = t;
             mat.specularColor = BABYLON.Color3.Black();*/
            //var gridshader = new BABYLON.ShaderMaterial("grid", scene, "grid", {}); //shader grid
            // Object
            this.ground = BABYLON.Mesh.CreateBox("ground", 200, scene);
            this.ground.ellipsoid = new BABYLON.Vector3(0.5, 0.5, 0.5);
            this.ground.position.y = -0.1;
            this.ground.scaling.y = 0.001;
            this.ground.onCollide = function (a) {
                console.warn('oncollide ground', a);
            };
            this.ground.material = mat; //gridshader;
            if (this.opt.hasPhysics)
                this.ground.setPhysicsState({ impostor: BABYLON.PhysicsEngine.BoxImpostor, move: false });
            this.ground.checkCollisions = true;
            this.ground.receiveShadows = true;
            //** table
            // Material
            var tablemat = new BABYLON.StandardMaterial("table", scene);
            var twood = new BABYLON.Texture("img/textures/plasticwhite.jpg", scene);
            twood.uScale = twood.vScale = 1;
            tablemat.diffuseTexture = twood;
            tablemat.specularColor = BABYLON.Color3.Black();
            //var gridshader = new BABYLON.ShaderMaterial("grid", scene, "grid", {}); //shader grid
            var tableboxsize = this.fieldsize;
            this.table = BABYLON.Mesh.CreateBox("table", tableboxsize, scene);
            this.table.boxsize = tableboxsize;
            this.table.ellipsoid = new BABYLON.Vector3(0.5, 0.5, 0.5);
            this.table.position.y = 0;
            this.table.scaling.y = 0.001;
            this.table.onCollide = function (a) {
                console.warn('oncollide table', a);
            };
            this.table.material = tablemat; //gridshader;
            if (this.opt.hasPhysics)
                this.table.setPhysicsState({ impostor: BABYLON.PhysicsEngine.BoxImpostor, move: false });
            this.table.checkCollisions = true;
            this.table.receiveShadows = true;
            if (this.opt.showGrid) {
                var gridmat = new BABYLON.StandardMaterial("grid", scene);
                gridmat.wireframe = true; //create wireframe
                gridmat.diffuseColor = BABYLON.Color3.Gray();
                this.grid = BABYLON.Mesh.CreateGround("grid", this.fieldsize, this.fieldsize, 6, scene, false); //used to show grid
                this.grid.position.y = 0.01;
                this.grid.scaling.y = 0.001;
                this.grid.material = gridmat;
            }
            var animate = function () {
                var self = this;
                self.isSteadyState = true;
                self.cubeslist.forEach(function (c) {
                    //count the number of 0 move ticks
                    if (c.oldpos) {
                        var delta = c.oldpos.subtract(c.position);
                        if (self.isZeroVec(delta)) {
                            if (!c.zeromoveTicks)
                                c.zeromoveTicks = 0;
                            c.zeromoveTicks++;
                            if (c.isMoving && c.zeromoveTicks > 25) {
                                if (!c.showMoved)
                                    c.material.emissiveColor = BABYLON.Color3.Black();
                                c.isMoving = false;
                                c.zeromoveTicks = 0;
                                c.tchecked = false;
                            }
                            else if (c.isMoving)
                                self.isSteadyState = false;
                        }
                        else {
                            c.material.emissiveColor = new BABYLON.Color3(0.5, 1.0, 0.9);
                            c.isMoving = true;
                            self.isSteadyState = false;
                        }
                    }
                    c.oldpos = c.position.clone();
                });
            };
            scene.registerBeforeRender(animate.bind(this));
            // Leave this function
            return scene;
        };
        ;
        c3DEngine.prototype.updateRender = function (scene) {
            return function () {
                scene.render();
            };
        };
        ;
        c3DEngine.prototype.createWorld = function () {
            var self = this;
            // Load the BABYLON 3D engine
            self.engine = new BABYLON.Engine(this.canvas);
            // Now, call the createScene function that you just finished creating
            self.scene = self.createScene();
            //create dynamic number textures
            self.createNumTexture(self.scene);
            // Register a render loop to repeatedly render the scene
            self.engine.runRenderLoop(self.updateRender(self.scene));
            // Watch for browser/canvas resize events
            window.addEventListener("resize", function () {
                self.engine.resize();
            });
        };
        ;
        c3DEngine.prototype.createObjects = function (blocks) {
            var self = this;
            if (self.cubeslist.length)
                self.cubeslist.forEach(function (c) {
                    if (self.opt.hasPhysics)
                        self.oimo.unregisterMesh(c); //stop physics
                    c.dispose();
                });
            self.cubeslist.length = 0;
            self.cubesdata = {};
            self.numcubes = 0;
            var p = -0.5;
            var i = 0;
            var z = 0;
            var zpos = [0, 0.3, 0.6, 0.9];
            for (var j = 0; j < blocks.length; j++) {
                self.createCube({
                    pos: new BABYLON.Vector3((p + i * 0.3), Number(blocks[j].shape.shape_params.side_length), zpos[z]),
                    scene: self.scene,
                    block: blocks[j],
                    isVisible: true
                });
                if (i > 3) {
                    i = 0;
                    z++;
                }
                else
                    i++;
            }
            self.cubesid = Object.keys(this.cubesdata);
        };
        ;
        c3DEngine.prototype.get3DCubeById = function (cid) {
            return this.cubeslist[this.cubesdata[cid].objidx];
        };
        ;
        c3DEngine.prototype.resetWorld = function () {
            var c;
            var p = -0.5, i = 0, z = 0;
            var zpos = [7, 8, 9, 10];
            for (var j = 0; j < this.cubeslist.length; j++) {
                c = this.cubeslist[j];
                if (this.opt.hasPhysics)
                    this.oimo.unregisterMesh(c); //stop physics
                c.position = new BABYLON.Vector3((p + i * 0.3), c.boxsize, zpos[z]);
                c.rotationQuaternion = BABYLON.Quaternion.Identity().clone();
                c.isVisible = false;
                if (i > 3) {
                    i = 0;
                    z++;
                }
                else
                    i++;
            }
            this.resetCamera();
        };
        c3DEngine.prototype.resetCamera = function () {
            //this.camera.setPosition(new BABYLON.Vector3(0, this.fieldsize * 0.95, -(this.fieldsize * 0.8)));
            // This creates and positions a free camera
            this.camera.position = new BABYLON.Vector3(0, 1.8, -1.8);
            this.camera.setTarget(new BABYLON.Vector3(0, 0.1, 0));
        };
        c3DEngine.prototype.updateScene = function (state, cb) {
            var self = this;
            self.resetWorld();
            //check if each state has physics
            if (!_.isUndefined(state.enablephysics)) {
                self.opt.hasPhysics = state.enablephysics;
                self.updatePhysics();
            }
            setTimeout(function () {
                if (state.block_state) {
                    state.block_state.forEach(function (frame) {
                        var c = self.get3DCubeById(frame.id);
                        c.position = new BABYLON.Vector3(frame.position['x'], frame.position['y'], frame.position['z']);
                        if (frame.rotation)
                            c.rotationQuaternion = new BABYLON.Quaternion(frame.rotation['x'], frame.rotation['y'], frame.rotation['z'], frame.rotation['w']);
                        c.isVisible = true;
                        if (self.opt.hasPhysics)
                            c.setPhysicsState({
                                impostor: BABYLON.PhysicsEngine.BoxImpostor,
                                move: true,
                                mass: self.mass,
                                friction: self.fric,
                                restitution: self.rest
                            });
                    });
                }
                else
                    console.warn('error', 'Missing BLOCK_STATE');
                if (cb)
                    cb();
            }, 100);
        };
        ;
        c3DEngine.prototype.updatePhysics = function () {
            var self = this;
            if (self.cubeslist.length)
                self.cubeslist.forEach(function (c) {
                    self.oimo.unregisterMesh(c); //stop physics
                    if (self.opt.hasPhysics)
                        c.setPhysicsState({
                            impostor: BABYLON.PhysicsEngine.BoxImpostor,
                            move: true,
                            mass: self.mass,
                            friction: self.fric,
                            restitution: self.rest
                        });
                });
        };
        ;
        /**
         * Overlap check for src inside tgt mesh in the x z footprint
         * @param src
         * @param tgt
         * @returns {boolean}
         */
        c3DEngine.prototype.intersectsMeshXYZ = function (src, tgt, checkY) {
            var s = (src.prop.size / 2) - 0.01; //slightly small
            var a = {
                max: { x: src.position.x + s, y: src.position.y + s, z: src.position.z + s },
                min: { x: src.position.x - s, y: src.position.y - s, z: src.position.z - s }
            };
            s = (tgt.prop.size / 2) - 0.01;
            var b = {
                max: { x: tgt.position.x + s, y: tgt.position.y + s, z: tgt.position.z + s },
                min: { x: tgt.position.x - s, y: tgt.position.y - s, z: tgt.position.z - s }
            };
            if (a.max.x < b.min.x)
                return false; // a is left of b
            if (a.min.x > b.max.x)
                return false; // a is right of b
            if (a.max.z < b.min.z)
                return false; // a is front b
            if (a.min.z > b.max.z)
                return false; // a is back b
            if (checkY)
                if (a.min.y > b.max.y)
                    return false; // a is top b
            return true; // boxes overlap
        };
        ;
        return c3DEngine;
    }());
    miGen3DEngine.c3DEngine = c3DEngine;
    var cUI3DEngine = (function (_super) {
        __extends(cUI3DEngine, _super);
        function cUI3DEngine(fieldsize) {
            _super.call(this, fieldsize);
            this.pointerActive = false;
            this.volumeMesh = null;
            this.intersectMesh = null;
            this.tableIMesh = null;
            this.currentMesh = null;
            this.lastMesh = null;
            this.showObjAxis = false;
            this.groupMesh = [];
            this.outMesh = [];
            this.startingPoint = null;
            this.OGDelta = null;
            this.lockxz = false;
            this.sceney = null;
            this.scenerot = null;
            this.rotxy = false;
            this.enableUI = true;
        }
        ;
        cUI3DEngine.prototype.getGroundPosition = function (evt) {
            var self = this;
            // Use a predicate to get position on the ground
            var pickinfo = self.scene.pick(self.scene.pointerX, self.scene.pointerY, function (mesh) {
                return mesh == self.ground;
            });
            if (pickinfo.hit) {
                if (self.startingPoint) {
                    var current = pickinfo.pickedPoint.clone();
                    if (self.OGDelta)
                        current.subtractInPlace(self.OGDelta);
                    current.y = self.startingPoint.y;
                    //move by step n - removed
                    //current.x = Number(( Math.round(current.x * 10) / 10).toFixed(2));
                    //current.z = Number(( Math.round(current.z * 10) / 10).toFixed(2));
                    return current;
                }
                else
                    return pickinfo.pickedPoint;
            }
            return null;
        };
        ;
        cUI3DEngine.prototype.XformChildToParentRelPos = function (meshchild, meshparent) {
            var invWorldMatrix = meshparent.getWorldMatrix().clone().invert();
            return BABYLON.Vector3.TransformCoordinates(meshchild.position.clone(), invWorldMatrix);
        };
        cUI3DEngine.prototype.createVolumeShadow = function (mesh, scene, opt) {
            if (!opt.size || !opt.name || _.isUndefined(opt.isVisible)) {
                console.warn('missing option info');
                return;
            }
            var volumeMesh;
            var objname = opt.name;
            var boxsize = opt.size;
            var volmat = new BABYLON.StandardMaterial(objname, scene);
            volmat.alpha = 0.3;
            volmat.diffuseColor = opt.difcolor.clone();
            volmat.emissiveColor = opt.emcolor.clone();
            volmat.backFaceCulling = true;
            volumeMesh = BABYLON.Mesh.CreateBox(objname, boxsize, scene);
            var myQuat = BABYLON.Quaternion.Identity();
            if (mesh.rotationQuaternion)
                myQuat = mesh.rotationQuaternion.clone();
            else
                console.warn('mesh quaternion is identity ', mesh.name);
            var euler = myQuat.toEulerAngles(); //get rotation
            volumeMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, -1, 0), euler.y); //create rotation based on Y so OUR volume is always Y UP!!!!
            volumeMesh.material = volmat;
            volumeMesh.isPickable = false;
            volumeMesh['backFaceCulling'] = true;
            volumeMesh.showBoundingBox = false;
            volumeMesh.checkCollisions = false;
            volumeMesh['applyGravity'] = false;
            volumeMesh.receiveShadows = false;
            volumeMesh.position = mesh.position.clone();
            //pretransform the vertices so we can get the actual bounds box
            volumeMesh.bakeTransformIntoVertices(volumeMesh.getWorldMatrix());
            var transform = BABYLON.Matrix.Scaling(1, opt.scale, 1);
            volumeMesh.bakeTransformIntoVertices(transform);
            if (opt.isCollider) {
                var vectorsWorld = volumeMesh.getBoundingInfo().boundingBox.vectorsWorld;
                var miny, maxy;
                vectorsWorld.forEach(function (v) {
                    if (v.y < miny || !miny)
                        miny = v.y;
                    if (v.y > maxy || !maxy)
                        maxy = v.y;
                });
                volumeMesh['height'] = maxy - miny;
                volumeMesh['boxsize'] = opt.size;
                volumeMesh['offset'] = volumeMesh['height'] / 2 - volumeMesh['boxsize'] / 2;
                //base vector from 0,0,0 to offset in local space
                //to translate position so bottom is on the ground
                //must determine which axis is up and whether that axis is upside down
                var offset = volumeMesh['offset'] + 0.1;
                var bvinlocalspace = new BABYLON.Vector3(0, offset, 0);
                volumeMesh.position.addInPlace(bvinlocalspace);
                volumeMesh.ellipsoid = new BABYLON.Vector3(volumeMesh['boxsize'], volumeMesh['height'] / 4, volumeMesh['boxsize']);
                volumeMesh['backFaceCulling'] = false;
                volumeMesh.checkCollisions = false;
                volumeMesh.showBoundingBox = false;
                volumeMesh.isVisible = opt.isVisible;
                volumeMesh.material.alpha = 0.3;
                //volumeMesh.material.diffuseColor = new BABYLON.Color3.Green();
                //volumeMesh.refreshBoundingInfo();
                volumeMesh.onCollide = function (a) {
                    console.warn('vol oncollide', this.name, a.name);
                };
            }
            return volumeMesh;
        };
        ;
        cUI3DEngine.prototype.clickMesh = function (lastMesh, currentMesh) {
            // If we click again the already selected mesh then there is no reason to remove axis and add them again
            if (lastMesh == currentMesh)
                return;
            // Show axis for the current mesh
            for (var i = 0; i < currentMesh.getChildren().length; i++)
                currentMesh.getChildren()[i]['isVisible'] = true;
            // Remove axis for the previous mesh
            if (lastMesh != null) {
                if (lastMesh.getChildren().length > 0)
                    for (var i = 0; i < lastMesh.getChildren().length; i++)
                        lastMesh.getChildren()[i]['isVisible'] = false;
            }
        };
        cUI3DEngine.prototype.onPointerDown = function (evt) {
            if (evt.button !== 0 || !this.enableUI)
                return;
            var self = this;
            // check if we are under a mesh
            var pickInfo = self.scene.pick(self.scene.pointerX, self.scene.pointerY, function (mesh) {
                return (mesh !== self.ground) && (mesh !== self.skybox) && (mesh !== self.volumeMesh)
                    && (mesh !== self.intersectMesh) && (mesh !== self.grid) && (mesh !== self.table)
                    && (mesh !== self.tableIMesh);
            });
            if (pickInfo.hit && !pickInfo.pickedMesh['isMoving']) {
                self.pointerActive = true;
                //we clean up things first;
                //onPointerUp();
                self.currentMesh = pickInfo.pickedMesh;
                //show axis debug info
                if (self.showObjAxis) {
                    self.clickMesh(self.lastMesh, pickInfo.pickedMesh);
                    self.lastMesh = pickInfo.pickedMesh;
                }
                //console.warn('picked ', self.currentMesh.name, self.currentMesh);
                //self.startingPoint = pickInfo.pickedMesh.position.clone();//getGroundPosition(evt);
                if (pickInfo.pickedMesh.position) {
                    setTimeout(function () {
                        self.camera.detachControl(self.canvas);
                    }, 0);
                }
                //remove the volume mesh
                if (self.volumeMesh)
                    self.volumeMesh.dispose();
                //create a new one
                self.volumeMesh = self.createVolumeShadow(self.currentMesh, self.scene, {
                    isCollider: false,
                    isVisible: true,
                    scale: 70,
                    size: self.currentMesh['boxsize'],
                    name: 'vol' + self.currentMesh['boxsize'],
                    emcolor: BABYLON.Color3.Black(),
                    difcolor: BABYLON.Color3.Gray()
                });
                if (self.intersectMesh)
                    self.intersectMesh.dispose();
                self.intersectMesh = self.createVolumeShadow(self.currentMesh, self.scene, {
                    isCollider: true,
                    isVisible: true,
                    scale: 30,
                    size: self.currentMesh['boxsize'] * 0.98,
                    name: 'col' + self.currentMesh['boxsize'],
                    emcolor: BABYLON.Color3.Red(),
                    difcolor: BABYLON.Color3.Red()
                });
                //enable collision to check for overlap with cube
                self.intersectMesh.checkCollisions = true;
                setTimeout(function () {
                    if (self.intersectMesh) {
                        self.groupMesh.length = 0;
                        self.outMesh.length = 0;
                        var InvQ = BABYLON.Quaternion.Inverse(self.intersectMesh.rotationQuaternion);
                        var isZeroPosition = false; //check if we have a screwed up invworldmatrix - if we do then one of the mesh will move to 0,0,0 instead of the bottom of the volume mesh.
                        self.cubeslist.forEach(function (c) {
                            if (self.intersectMesh.intersectsMesh(c, true)) {
                                /*console.warn('c', c);
                                console.warn('self.intersectMesh', self.intersectMesh);
                                console.warn('cpa', c.position, self.intersectMesh.position);*/
                                c.parent = self.intersectMesh;
                                c.position = self.XformChildToParentRelPos(c, self.intersectMesh);
                                //console.warn('cpb', c.position);
                                if (self.isZeroVec(c.position))
                                    isZeroPosition = true;
                                //c.material.emissiveColor = new BABYLON.Color3(1, 0, 0);
                                //translate cube to intersetmesh local space 0,0,0
                                //this formula gets fractional rotation from mesh rotation based on
                                //the bottom cube
                                if (c.rotationQuaternion)
                                    c.rotationQuaternion = InvQ.multiply(c.rotationQuaternion);
                                else
                                    console.warn('object contains no rotationQuaternion');
                                //c.rotationQuaternion = self.intersectMesh.rotationQuaternion.multiply(BABYLON.Quaternion.Inverse(c.rotationQuaternion));
                                c.checkCollisions = false;
                                c.showBoundingBox = false;
                                //console.warn('me elp', c.ellipsoid);
                                if (self.opt.hasPhysics)
                                    self.oimo.unregisterMesh(c); //stop physics
                                self.groupMesh.push(c);
                            }
                            else {
                                self.outMesh.push(c);
                                c.parent = null;
                                c.checkCollisions = true;
                                c.showBoundingBox = false;
                                c.material.emissiveColor = BABYLON.Color3.Black();
                            }
                        });
                        if (isZeroPosition) {
                            console.warn('FIXED BAD MESH OFFSET');
                            var offset = new BABYLON.Vector3(0, -self.intersectMesh['offset'], 0);
                            self.groupMesh.forEach(function (c) {
                                c.position.addInPlace(offset);
                            });
                        }
                        self.startingPoint = self.intersectMesh.position.clone(); //getGroundPosition(evt);
                        self.OGDelta = self.getGroundPosition(evt);
                        if (self.OGDelta)
                            self.OGDelta.subtractInPlace(self.startingPoint);
                    }
                }, 50);
            }
        };
        ;
        cUI3DEngine.prototype.onPointerMove = function (evt) {
            var self = this;
            if (!self.startingPoint)
                return;
            var current;
            var delta;
            //move up and down
            if (self.lockxz) {
                current = self.startingPoint.clone();
                delta = (self.sceney - self.scene.pointerY) * 0.008;
                current.y += delta;
                self.sceney = self.scene.pointerY;
            }
            else if (!self.rotxy) {
                current = self.getGroundPosition(evt);
                if (!self.OGDelta && current) {
                    //if ogdelta does not exist during on pointer down that means we have to keep checking until mouse hits the ground and get the ground to obj origin delta
                    self.OGDelta = current.clone();
                    if (self.OGDelta)
                        self.OGDelta.subtractInPlace(self.startingPoint);
                }
            }
            else {
                current = null; //skip translating mesh below
                var euler = self.intersectMesh.rotationQuaternion.toEulerAngles();
                delta = (self.scenerot.x - self.scene.pointerX);
                var rotRad = 0.087266; //5 deg. in radian
                var rotval;
                if (delta < 0)
                    rotval = euler.y - rotRad;
                else
                    rotval = euler.y + rotRad;
                if (rotval > Math.PI)
                    rotval = 0;
                if (rotval < 0)
                    rotval = Math.PI;
                rotval = (Math.round(rotval / rotRad)) * rotRad; //round to nearest 5 deg
                //snap rotval to 5 degree increments
                self.intersectMesh.rotationQuaternion = BABYLON.Quaternion.RotationAxis(new BABYLON.Vector3(0, 1, 0), rotval); //Y is UP in intersect mesh
                self.volumeMesh.rotationQuaternion = self.intersectMesh.rotationQuaternion.clone();
                self.scenerot.x = self.scene.pointerX;
            }
            if (!current)
                return;
            var diff;
            //var scale:BABYLON.Vector3 = new BABYLON.Vector3(0.7, 0.7, 0.7);
            diff = current.subtract(self.startingPoint);
            self.intersectMesh.moveWithCollisions(diff);
            //self.volumeMesh.position = self.intersectMesh.position.clone();
            setTimeout(function () {
                if (self.intersectMesh && self.intersectMesh.position)
                    self.volumeMesh.position = self.intersectMesh.position.clone();
            }, 50);
            self.startingPoint = current;
        };
        ;
        cUI3DEngine.prototype.onPointerUp = function () {
            var self = this;
            if (self.startingPoint) {
                self.pointerActive = false;
                if (self.hasControls)
                    self.camera.attachControl(self.canvas, true);
                self.startingPoint = null;
                self.OGDelta = null;
                self.sceney = null;
                //must remove collision check prior to dispose or you get invisible mesh collisions!!!
                self.intersectMesh.checkCollisions = false;
                if (self.volumeMesh)
                    self.volumeMesh.dispose();
                self.volumeMesh = null;
                if (self.groupMesh.length)
                    self.groupMesh.forEach(function (c) {
                        c.parent = null;
                        c['tchecked'] = false;
                        //after removing from parent
                        //transform local position to world position
                        c.position = BABYLON.Vector3.TransformCoordinates(c.position, self.intersectMesh.getWorldMatrix());
                        //c.position.addInPlace(self.intersectMesh.position.clone());
                        c.rotationQuaternion = self.intersectMesh.rotationQuaternion.multiply(c.rotationQuaternion);
                        c.checkCollisions = true;
                        c.showBoundingBox = false;
                        c.material.emissiveColor = BABYLON.Color3.Black();
                        //must add physics no matter if its off the ground fo collisions to tork
                        if (self.opt.hasPhysics)
                            c.setPhysicsState({
                                impostor: BABYLON.PhysicsEngine.BoxImpostor,
                                move: true,
                                mass: self.mass,
                                friction: self.fric,
                                restitution: self.rest
                            });
                    });
                self.groupMesh.length = 0;
                if (self.intersectMesh)
                    self.intersectMesh.dispose();
                self.intersectMesh = null;
                self.currentMesh = null;
            }
        };
        ;
        cUI3DEngine.prototype.enableControl = function (b) {
            if (b) {
                this.hasControls = true;
                this.scene.activeCamera.attachControl(this.canvas);
                this.camera.speed = 0.1;
                this.camera.ellipsoid = new BABYLON.Vector3(0.1, 0.1, 0.1); //bounding ellipse
                this.camera.checkCollisions = true;
                this.camera.keysUp = [38]; // 87w
                this.camera.keysDown = [40]; // 83s
                this.camera.keysLeft = [37]; //  65a
                this.camera.keysRight = [39]; // 68d
            }
            else {
                this.hasControls = false;
                this.camera.detachControl(this.canvas);
                this.camera.speed = 0;
                this.camera.keysUp = [];
                this.camera.keysDown = [];
                this.camera.keysLeft = [];
                this.camera.keysRight = [];
            }
        };
        cUI3DEngine.prototype.setUI = function (b) {
            this.enableControl(b);
            this.enableUI = b;
        };
        cUI3DEngine.prototype.getUIVal = function () {
            return this.enableUI;
        };
        cUI3DEngine.prototype.createWorld = function () {
            var self = this;
            _super.prototype.createWorld.call(this);
            //require hand.js from ms
            self.canvas.addEventListener("pointerdown", self.onPointerDown.bind(self), false);
            self.canvas.addEventListener("pointerup", self.onPointerUp.bind(self), false);
            self.canvas.addEventListener("pointermove", self.onPointerMove.bind(self), false);
            self.scene.onDispose = function () {
                self.canvas.removeEventListener("pointerdown", self.onPointerDown);
                self.canvas.removeEventListener("pointerup", self.onPointerUp);
                self.canvas.removeEventListener("pointermove", self.onPointerMove);
            };
            window.addEventListener("keydown", function (evt) {
                switch (evt.keyCode) {
                    case 18:
                        if (self.currentMesh) {
                            self.rotxy = true;
                            self.scenerot = { x: self.scene.pointerX, y: self.scene.pointerY };
                        }
                        break;
                    case 16:
                        if (self.currentMesh) {
                            self.lockxz = true;
                            self.sceney = self.scene.pointerY;
                        }
                        break;
                    default:
                        break;
                }
            });
            window.addEventListener("keyup", function (evt) {
                switch (evt.keyCode) {
                    case 18:
                        self.rotxy = false;
                        self.scenerot = null;
                        break;
                    case 16:
                        self.lockxz = false;
                        self.sceney = null;
                        break;
                    default:
                        break;
                }
            });
        };
        return cUI3DEngine;
    }(c3DEngine));
    miGen3DEngine.cUI3DEngine = cUI3DEngine;
})(miGen3DEngine || (miGen3DEngine = {}));
mGen3DEngine = miGen3DEngine;
//# sourceMappingURL=gen-3d-engine.js.map