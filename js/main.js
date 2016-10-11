
var canvas = document.getElementById("renderCanvas");
var engine = new BABYLON.Engine(canvas, true);
var ground;

var createScene = function() {

  var scene = new BABYLON.Scene(engine);
  // scene.gravity = new BABYLON.Vector3(0, -0.8, 0);
  scene.collisionsEnabled = true;
  scene.clearColor = new BABYLON.Color3(0, 1, 0);

  // var camera = new BABYLON.ArcRotateCamera("Camera", -Math.PI/2, Math.PI / 3, 12, BABYLON.Vector3.Zero(), scene);
  var camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);
  camera.checkCollisions = true;
  // camera.applyGravity = true;
  camera.setTarget(BABYLON.Vector3.Zero());
  camera.attachControl(canvas, false);

  var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
  light.intensity = 0.5;

  map = new Floorplan(6, 10, 10, scene);

  var skybox = BABYLON.Mesh.CreateBox("skyBox", 100.0, scene);
  var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
  skyboxMaterial.backFaceCulling = false;
  skyboxMaterial.disableLighting = true;
  skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("./textures/skybox", scene);
  skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
  skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
  skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
  skybox.material = skyboxMaterial;
  skybox.infiniteDistance = true;

return scene;
};

window.addEventListener("resize", function() {
engine.resize();
});

var scene = createScene();

engine.runRenderLoop(function() {
scene.render();
});
