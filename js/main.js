var camera;
var canvas = document.getElementById("renderCanvas"); // selects the canvas
var engine = new BABYLON.Engine(canvas, true);        // initialises the engine to run on the canvas
var ground;

var createScene = function() {

  var scene = new BABYLON.Scene(engine);
  scene.gravity = new BABYLON.Vector3(0, -0.98, 0);   // enables gravity
  scene.collisionsEnabled = true;                     // enables collisions for the scene
  scene.clearColor = new BABYLON.Color3(0, 1, 0);

  map = new Floorplan(5, 10, 10, scene);              // calls Floorplan to generate the dungeon Floorplan

  var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);  // lights the scene
  light.intensity = 0.5;                              // Brightness of the light

  var skybox = BABYLON.Mesh.CreateBox("skyBox", 500.0, scene);  // CReates a skybox
  var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
  skyboxMaterial.backFaceCulling = false;                // disables reverse side of the skybox
  skyboxMaterial.disableLighting = true;                 // disables scene lighting from affecting the skybox
  skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("./textures/skybox", scene); // creates skybox textures
  skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE; // makes skybox seamless
  skybox.material = skyboxMaterial;
  skybox.infiniteDistance = true;                             // sets skybox size to inifinite, so you cannot reach/go outside it

  return scene;                                                 // returns scene to render functino
};

window.addEventListener("resize", function() {                // resizes the scene to fit the current window
engine.resize();
});

var scene = createScene();                                    // calls the create scene

engine.runRenderLoop(function() {                             // renders the scene in a loop
scene.render();
});
