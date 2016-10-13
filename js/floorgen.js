var lastRoomCoords;
var Floorplan = function(min_room_size, max_room_size, max_room_number, scene) {
    this.scene = scene;
    this.walls = [];                                // array of wall x and z locations
    this.grounds = [];                              // array of ground x and z locations

    this.room_min_size = min_room_size;
    this.room_max_size = max_room_size;
    this.max_rooms = max_room_number;

    this.num_rooms = 0;

    this.makeMap();
};
Floorplan.prototype.getRandom = function(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
};
Floorplan.prototype.createFloor = function(x, z) {

    var ground = BABYLON.Mesh.CreateGround("ground", 1, 1, 1, this.scene);  // creates a ground plane 1 unit x and z, with 1 subdivision

    ground.position.x = x;                // sets each ground tile position
    ground.position.z = z;
    ground.position.y = 0;                // sets the ground tile to y = 0

    this.grounds.push({ x: x, z: z });    // adds the ground tile position to the grounds array

    ground.material = new BABYLON.StandardMaterial("ground", this.scene);   // creates the material for the ground tile
    ground.material.diffuseTexture = new BABYLON.Texture("./textures/pavement.jpg", this.scene);    // applies the ground texture
    // ground.material.wireframe = true;    // shows the ground as a wireframe
    ground.checkCollisions = true;      // enables collisions with other objects

};
Floorplan.prototype.createWalls = function(x,z) {           // creates the walls
    var wall = BABYLON.Mesh.CreateBox("Wall", 1, this.scene);       //creates a wall box for the scene that is 1 unit square

    wall.material = new BABYLON.StandardMaterial("wall", this.scene); // creates the wall material
    wall.material.emissiveTexture = new BABYLON.Texture("./textures/masonry-wall-texture.jpg", this.scene);                 // applies the wall texture to the material
    wall.material.bumpTexture = new BABYLON.Texture("./textures/masonry-wall-bump-map.jpg", this.scene);                 // applies the bump map for the wall texture
    wall.material.specularTexture = new BABYLON.Texture("./textures/masonry-wall-normal-map.jpg", this.scene);                 // applies the normal map (displacement map?) for the wall material

    wall.position.x = x;        // sets each wall box position
    wall.position.z = z;
    wall.position.y = 0.5;      // sets the base of the cube at y = 0

    wall.checkCollisions = true;        // enables collisions with other objects
    this.walls.push( wall );            // pushes the wall position into the walls array
};

Floorplan.prototype.createRoom = function(x1, x2, z1, z2) {     //creates a room at x1, y1 with opposite corner at x2, y2
    for (var x = x1; x<x2; x+=1) {
        for (var z = z1; z<z2; z+=1) {
            this.createFloor(x, z);         // creates a ground tile at each x, z co-ordinate in the room
        }
    }
};
Floorplan.prototype.createXTunnel = function(prev_x, new_x, new_z) {    // creates floor tiles for the corridor that links 2 room centers
    var min = Math.min(prev_x, new_x);          // finds the minimum x value of the 2 room centers
    var max = Math.max(prev_x, new_x);          // finds the maximum x value of the 2 room centers
    for (var x = min; x<max+1; x+=1) {
        this.createFloor(x, new_z);             // creates ground tiles along the x values up the the z value of the new room center
    }
};
Floorplan.prototype.createZTunnel = function(prev_z, new_z, new_x) {    // creates floor tiles for the corridor that links 2 room centers
    var min = Math.min(prev_z, new_z);          // finds the minimum z value of the 2 room centers
    var max = Math.max(prev_z, new_z);          // finds the maximum z value of the 2 room centers
    for (var z = min; z<max+1; z+=1) {
        this.createFloor(new_x, z);             // cretaes ground tiles along the z values up to the x value of the new room center
    }
};
Floorplan.prototype.makeMap = function() {      // generates the room
    for (var r=0; r<this.max_rooms; r++) {      // for each room
        var w = this.getRandom(this.room_min_size, this.room_max_size);     // generate a random room width
        var h = this.getRandom(this.room_min_size, this.room_max_size);     // generate a random room height

        x = this.getRandom(1, (15 - (w/4 + 1)) * 4);    // generates a random x value
        z = this.getRandom(1, (15 - (w/4 + 1)) * 4);    // generates a random z value

        this.createRoom(x, x+w, z, z+h);                // creates a room with the genrated values

        if (this.num_rooms === 0) {
            var prev_x = (x + Math.floor(w/2));     // generates corridor x values for the first room
            var prev_z = (z + Math.floor(h/2));    // generates corridor z values for the first room
            lastRoomCoords = {x: prev_x, z: prev_z};

            // camera = new BABYLON.FreeCamera("camera1", new BABYLON.Vector3(prev_x, 0.5, prev_z), this.scene);   // creates the camera in the center of the first room
            var camera = new BABYLON.GamepadCamera("Camera", new BABYLON.Vector3(prev_x, 0.6, prev_z), this.scene);             // creates a camera in the center of the first room formed

            camera.ellipsoid = new BABYLON.Vector3(0.5, 0.3, 0.5);    // creates size of camera
            camera.checkCollisions = true;    // camera checks to see if it collides with anything
            camera.applyGravity = true;       //applies gravity to the camera
            camera.setTarget(BABYLON.Vector3.Zero());       // sets the camera to face world zero
            camera.attachControl(canvas, false);            // allows arrow keys to move camera

        } else {
            var new_x = (x + Math.floor(w/2));              // determines center of new room x
            var new_z = (z + Math.floor(h/2));              // determines center of new room z

            var prev_x = (lastRoomCoords.x);          // determines previous rooms x co-ordinates
            var prev_z = (lastRoomCoords.z);          // determines previous rooms z co-ordinates

            this.createXTunnel(prev_x, new_x, prev_z);  // sends co-ordinates to create H tunnel
            this.createZTunnel(prev_z, new_z, new_x);
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
