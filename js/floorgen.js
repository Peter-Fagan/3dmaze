var lastRoomCoords;
var Floorplan = function(min_room_size, max_room_size, max_room_number, scene) {
    // ground = BABYLON.Mesh.CreateGround("ground", 6, 6, 2, scene);
    this.scene = scene;
    this.walls = [];
    this.grounds = [];

    this.room_min_size = min_room_size;
    this.room_max_size = max_room_size;
    this.max_rooms = max_room_number;

    this.num_rooms = 0;
    this.num_tiles = 0;

    this.makeMap();
};
Floorplan.prototype.getRandom = function(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
};
Floorplan.prototype.createFloor = function(x, z) {

    var ground = BABYLON.Mesh.CreateGround("ground", 1, 1, 1, this.scene);

    for ( var i = 0; i < this.walls.length; i++ ) {
        this.walls[i].dispose(true);
    }

    ground.position.x = x;
    ground.position.z = z;
    ground.position.y = 0;

    ground.material = new BABYLON.StandardMaterial("ground", this.scene);
    ground.material.diffuseTexture = new BABYLON.Texture("./textures/pavement.jpg", this.scene);
    // ground.material.diffuseTexture.uScale = 2.0;//Repeat 5 times on the Vertical Axes
    // ground.material.diffuseTexture.vScale = 2.0;//Repeat 5 times on the Horizontal Axes
    ground.backFaceCulling = false;
    // ground.material.wireframe = true;
    ground.checkCollisions = true;
    this.grounds.push({ x: x, z: z });

};
Floorplan.prototype.createWalls = function(x,z) {
    var wall = BABYLON.Mesh.CreateBox("Wall", 1, this.scene);

    wall.material = new BABYLON.StandardMaterial("wall", this.scene);
    wall.material.emissiveTexture = new BABYLON.Texture("./textures/masonry-wall-texture.jpg", this.scene);
    wall.material.bumpTexture = new BABYLON.Texture("./textures/masonry-wall-bump-map.jpg", this.scene);
    wall.material.specularTexture = new BABYLON.Texture("./textures/masonry-wall-normal-map.jpg", this.scene);

    wall.position.x = x;
    wall.position.z = z;
    wall.position.y = 0.5;

    wall.checkCollisions = true;
    this.walls.push( wall );
};

Floorplan.prototype.createRoom = function(x1, x2, z1, z2) {
    for (var x = x1; x<x2; x+=1) {
        for (var z = z1; z<z2; z+=1) {
            this.createFloor(x, z);
        }
    }
};
Floorplan.prototype.createHTunnel = function(prev_x, new_x, new_z) {
    var min = Math.min(prev_x, new_x);
    var max = Math.max(prev_x, new_x);
    for (var x = min; x<max+2; x+=1) {
        this.createFloor(x, new_z);
    }
};
Floorplan.prototype.createVTunnel = function(prev_z, new_z, new_x) {
    var min = Math.min(prev_z, new_z);
    var max = Math.max(prev_z, new_z);
    for (var z = min; z<max+2; z+=1) {
        this.createFloor(new_x, z);
    }
};
Floorplan.prototype.makeMap = function() {
    for (var r=0; r<this.max_rooms; r++) {
        var w = this.getRandom(this.room_min_size, this.room_max_size);
        var h = this.getRandom(this.room_min_size, this.room_max_size);

        x = this.getRandom(1, (15 - (w/4 + 1)) * 4);
        z = this.getRandom(1, (15 - (w/4 + 1)) * 4);

        this.createRoom(x, x+w, z, z+h);

        if (this.num_rooms === 0) {
            var prev_x = (x + (w/2));
            var prev_z = (z + (h/2));
            lastRoomCoords = {x: prev_x, z: prev_z};

            // camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(prev_x, 0.5, prev_z), this.scene);   // creates the camera in the center of the first room
            var camera = new BABYLON.GamepadCamera("Camera", new BABYLON.Vector3(prev_x, 0.6, prev_z), this.scene);

            // camera.gamepadMoveSensibility = 100;
            camera.ellipsoid = new BABYLON.Vector3(0.6, 0.6, 0.6);    // creates size of camera
            // camera.ellipsoidOffset = new BABYLON.Vector3(0, 2, 0);
            camera.checkCollisions = true;    // camera checks to see if it collides with anything
            camera.applyGravity = true;       //applies gravity to the camera
            camera.setTarget(BABYLON.Vector3.Zero());       // sets the camera to face world zero
            camera.attachControl(canvas, false);            // allows arrow keys to move camera

        } else {
            var new_x = (x + Math.floor(w/2));
            var new_z = (z + Math.floor(h/2));

            var prev_x = (lastRoomCoords.x);
            var prev_z = (lastRoomCoords.z);

            this.createHTunnel(prev_x, new_x, prev_z, prev_z);
            this.createVTunnel(prev_z, new_z, new_x);
            prev_x = new_x;
            prev_z = new_z;
        }

        lastRoomCoords = { x: prev_x, z: prev_z };
        this.num_rooms++;
    }

    for (var z=0; z<60; z+= 1) {
        for (var x=0; x<60; x+=1) {
            var commonGround = this.grounds.filter(function (g) {
              return g.x === x && g.z === z;
            });
            if ( commonGround.length === 0 ) {
                this.createWalls(x, z);
            }
        }
    }
};
