var lastRoomCoords;
var Floorplan = function(min_room_size, max_room_size, max_room_number, scene) {
    // ground = BABYLON.Mesh.CreateGround("ground", 6, 6, 2, scene);
    this.scene = scene;

    this.room_min_size = min_room_size;
    this.room_max_size = max_room_size;
    this.max_rooms = max_room_number;

    // this.lastRoomCenter = {x:0, y:0};
    this.num_rooms = 0;
    this.num_tiles = 0;

    this.makeMap();
};
Floorplan.prototype.getRandom = function(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
};
Floorplan.prototype.createFloor = function(x, y) {

    var ground = BABYLON.Mesh.CreateGround("ground", 1, 1, 1, this.scene);

    // var box = BABYLON.Mesh.CreateBox("box", 2, this.scene);
    // box.position.x = x;
    // box.position.z = y;

    ground.position.x = x;
    ground.position.z = y;

    ground.material = new BABYLON.StandardMaterial("ground", this.scene);
    ground.material.diffuseTexture = new BABYLON.Texture("./textures/pavement.jpg", this.scene);
    ground.backFaceCulling = false;
    // ground.material.wireframe = true;
    ground.checkCollisions = true;
};
Floorplan.prototype.createRoom = function(x1, x2, y1, y2) {
    for (var x = x1; x<x2; x+=1) {
        for (var y = y1; y<y2; y+=1) {
            this.createFloor(x, y);
        }
    }
};
Floorplan.prototype.createHTunnel = function(prev_x, new_x, new_y) {
    var min = Math.min(prev_x, new_x);
    var max = Math.max(prev_x, new_x);
    for (var x = min; x<max+1; x+=1) {
        this.createFloor(x, new_y);
    }
};
Floorplan.prototype.createVTunnel = function(prev_y, new_y, new_x) {
    var min = Math.min(prev_y, new_y);
    var max = Math.max(prev_y, new_y);
    for (var y = min; y<max+1; y+=1) {
        this.createFloor(new_x, y);
    }
};
Floorplan.prototype.makeMap = function() {

    for (var r=0; r<this.max_rooms; r++) {
        var w = this.getRandom(this.room_min_size, this.room_max_size);
        var h = this.getRandom(this.room_min_size, this.room_max_size);

        x = this.getRandom(1, (15 - (w/4 + 1)) * 4);
        y = this.getRandom(1, (15 - (w/4 + 1)) * 4);

        this.createRoom(x, x+w, y, y+h);

        if (this.num_rooms === 0) {
            var prev_x = (x + (w/2)+ 2);
            var prev_y = (y + (h/2)+ 2);
            lastRoomCoords = {x: prev_x, y: prev_y};

        } else {
            var new_x = (x + Math.floor(w/2));
            var new_y = (y + Math.floor(h/2));

            var prev_x = (lastRoomCoords.x);
            var prev_y = (lastRoomCoords.y);

            this.createHTunnel(prev_x, new_x, prev_y, prev_y);
            this.createVTunnel(prev_y, new_y, new_x);
            prev_x = new_x;
            prev_y = new_y;
        }

        lastRoomCoords = { x: prev_x, y: prev_y };
        this.num_rooms++;
    }

};
