export {};

const BLACK = "#000000";
const GRAY = "#808080";
const RED = "#FF0000";
const GREEN = "#00FF00";
const BLUE = "#0000FF";
const YELLOW = "#FFFF00";
const PURPLE = "#FF00FF";
const CYAN = "#00FFFF"; 
const ORANGE = "#FF971C"; 
const TILESIZE = 50;

// const SHAPES = new Set(["O", "I", "J", "L", "S", "Z", "T"]); 
const SHAPES = new Set(["I", "Z", "S"]); 

let frameStep = 0; 
let updateMod = 20; 
let occupiedGrids = new Set(); 
let gridMap = new Map(); 
let allTetros = [];


const canvas = /** @type {HTMLCanvasElement} */ (
    document.getElementById("box1canvas")
);
const context = canvas.getContext("2d");

function adjustColor(hex, amount) {
    hex = hex.replace("#", "");

    let r = parseInt(hex.slice(0, 2), 16);
    let g = parseInt(hex.slice(2, 4), 16);
    let b = parseInt(hex.slice(4, 6), 16);

    r = Math.min(255, Math.max(0, r + amount));
    g = Math.min(255, Math.max(0, g + amount));
    b = Math.min(255, Math.max(0, b + amount));

    return `rgb(${r}, ${g}, ${b})`;
}

class SquareTile {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;

        this.size = 50;
        this.band = 6;
    }

    make() {
        const light = adjustColor(this.color, 60);
        const dark = adjustColor(this.color, -60);

        context.fillStyle = this.color;
        context.fillRect(this.x, this.y, this.size, this.size);


        context.fillStyle = dark;
        context.fillRect(this.x, this.y + this.size - this.band, this.size, this.band); 
        context.fillRect(this.x + this.size - this.band, this.y, this.band, this.size); 

        context.fillStyle = light;
        context.fillRect(this.x, this.y, this.size, this.band);
        context.fillRect(this.x, this.y, this.band, this.size);

        let id = `${this.x / TILESIZE},${this.y / TILESIZE}`;
        occupiedGrids.add(id);
        gridMap.set(id, this)

    }
}

class Tetromino {
    constructor() {
        this.isActive = true;
        this.tiles = [];
    }
    
    step() {
        if (!this.isActive) return; 
        if (frameStep % updateMod !== 0) return; 
        // console.log(occupiedGrids); 
        // needs to fall here
        let shouldStep = true; 

        let thisPiecesGrid = new Set(); 

        for (let i = 0; i < this.tiles.length; i++) {
            let oldTile = this.tiles[i]; 
            thisPiecesGrid.add(`${oldTile.x / TILESIZE},${oldTile.y / TILESIZE}`);
        }

        let otherPiecesGrid = occupiedGrids.difference(thisPiecesGrid); 

        for (let i = 0; i < this.tiles.length; i++) {
            let oldTile = this.tiles[i]; 

            const gridX = oldTile.x / TILESIZE;
            const gridY = oldTile.y / TILESIZE + 1;
            
            if (otherPiecesGrid.has(`${gridX},${gridY}`)) {
                shouldStep = false;
            }
        }

        if (!shouldStep) {
            this.isActive = false;
            return; 
        }
        
        for (let i = 0; i < this.tiles.length; i++) {
            let oldTile = this.tiles[i]; 
            let newTile = new SquareTile(oldTile.x, oldTile.y + TILESIZE, oldTile.color); 
            this.tiles[i] = newTile; 
        }

        // remove the old locations from the set
        thisPiecesGrid = new Set(); 

        for (let i = 0; i < this.tiles.length; i++) {
            let oldTile = this.tiles[i]; 
            thisPiecesGrid.add(`${oldTile.x / TILESIZE},${oldTile.y / TILESIZE}`);
        }

        occupiedGrids = otherPiecesGrid.union(thisPiecesGrid);

    }

    shift(shft) {
        let thisPiecesGrid = new Set(); 

        for (let i = 0; i < this.tiles.length; i++) {
            let oldTile = this.tiles[i]; 
            thisPiecesGrid.add(`${oldTile.x / TILESIZE},${oldTile.y / TILESIZE}`);
        }

        let otherPiecesGrid = occupiedGrids.difference(thisPiecesGrid); 
        let shouldShift = true; 
        for (let i = 0; i < this.tiles.length; i++) {
            let oldTile = this.tiles[i]; 

            const gridX = oldTile.x / TILESIZE + shft;
            const gridY = oldTile.y / TILESIZE;
            
            if (otherPiecesGrid.has(`${gridX},${gridY}`) || gridX == 11 || gridX == 0) {
                shouldShift = false;
            }
        }

        if (!shouldShift) return; 

        for (let i = 0; i < this.tiles.length; i++) {
            let oldTile = this.tiles[i]; 
            let newTile = new SquareTile(oldTile.x + TILESIZE * shft, oldTile.y, oldTile.color); 
            this.tiles[i] = newTile; 
        }
        thisPiecesGrid = new Set(); 

        for (let i = 0; i < this.tiles.length; i++) {
            let oldTile = this.tiles[i]; 
            thisPiecesGrid.add(`${oldTile.x / TILESIZE},${oldTile.y / TILESIZE}`);
        }

        occupiedGrids = otherPiecesGrid.union(thisPiecesGrid);
        
    }

    rotate(rot) {
        console.log(`Rotate is not implemented for this tetronimo: ${rot}`); 
        return; 
    }
}

class TetrominoO extends Tetromino {
    constructor(x, y, color) {
        super(); 
         
        this.tiles.push(
            new SquareTile(x * TILESIZE, y * TILESIZE, color),
            new SquareTile((x + 1) * TILESIZE, (y + 1) * TILESIZE, color),
            new SquareTile((x + 1) * TILESIZE, y * TILESIZE, color), 
            new SquareTile(x * TILESIZE, (y + 1) * TILESIZE, color)
        ); 
    }

    make() {
        for (let i = 0; i < this.tiles.length; i++) {
            this.tiles[i].make();
          }
    }
}

class TetrominoI extends Tetromino {
    constructor(x, y, color) {
        super(); 
        this.state = 1; 
        this.tiles.push(
            new SquareTile(x * TILESIZE, y * TILESIZE, color),
            new SquareTile(x * TILESIZE, (y + 1) * TILESIZE, color),
            new SquareTile(x * TILESIZE, (y + 2) * TILESIZE, color), 
            new SquareTile(x * TILESIZE, (y + 3) * TILESIZE, color)
        ); 
    }

    make() {
        for (let i = 0; i < this.tiles.length; i++) {
            this.tiles[i].make();
          }
    }

    rotate(rot) {
        if (this.state === 0) {
            this.toState1(); 

        } else {
            this.toState0(); 

        }
    }

    toState0() {
        // the pivot tile is one we can guarantee exists as clean spot
        let pivotTile = this.tiles[1];

        const pivotX = pivotTile.x / TILESIZE;
        const pivotY = pivotTile.y / TILESIZE;
        
        if (occupiedGrids.has(`${pivotX - 1},${pivotY}`)) return;
        if (occupiedGrids.has(`${pivotX + 1},${pivotY}`)) return;
        if (occupiedGrids.has(`${pivotX + 2},${pivotY}`)) return;
            
        this.state = 0; 
        occupiedGrids.delete(`${pivotX},${pivotY + 2}`);
        occupiedGrids.delete(`${pivotX},${pivotY - 1}`); 
        occupiedGrids.delete(`${pivotX},${pivotY + 1}`);

        this.tiles[0] = new SquareTile((pivotX - 1) * TILESIZE, pivotY * TILESIZE, pivotTile.color);
        this.tiles[2] = new SquareTile((pivotX + 1) * TILESIZE, pivotY * TILESIZE, pivotTile.color);
        this.tiles[3] = new SquareTile((pivotX + 2) * TILESIZE, pivotY * TILESIZE, pivotTile.color);
    }

    toState1() {
        let pivotTile = this.tiles[1];

        const pivotX = pivotTile.x / TILESIZE;
        const pivotY = pivotTile.y / TILESIZE;
        
        if (occupiedGrids.has(`${pivotX},${pivotY + 2}`)) return;
        if (occupiedGrids.has(`${pivotX},${pivotY - 1}`)) return;
        if (occupiedGrids.has(`${pivotX},${pivotY + 1}`)) return;
            
        this.state = 1; 
        occupiedGrids.delete(`${pivotX - 1},${pivotY}`);
        occupiedGrids.delete(`${pivotX + 1},${pivotY}`); 
        occupiedGrids.delete(`${pivotX + 2},${pivotY}`);

        this.tiles[0] = new SquareTile((pivotX) * TILESIZE, (pivotY - 1) * TILESIZE, pivotTile.color);
        this.tiles[2] = new SquareTile((pivotX) * TILESIZE, (pivotY + 1) * TILESIZE, pivotTile.color);
        this.tiles[3] = new SquareTile((pivotX) * TILESIZE, (pivotY + 2) * TILESIZE, pivotTile.color);
    }
}

class TetrominoL extends Tetromino {
    constructor(x, y, color) {
        super(); 

        this.tiles.push(
            new SquareTile((x + 1) * TILESIZE, y * TILESIZE, color),
            new SquareTile((x + 1) * TILESIZE, (y + 1) * TILESIZE, color),
            new SquareTile((x + 1) * TILESIZE, (y + 2) * TILESIZE, color), 
            new SquareTile(x * TILESIZE, (y + 2) * TILESIZE, color)
        ); 
    }

    make() {
        for (let i = 0; i < this.tiles.length; i++) {
            this.tiles[i].make();
          }
    }
}

class TetrominoJ extends Tetromino {
    constructor(x, y, color) {
        super(); 

        this.tiles.push(
            new SquareTile(x * TILESIZE, y * TILESIZE, color),
            new SquareTile(x * TILESIZE, (y + 1) * TILESIZE, color),
            new SquareTile(x * TILESIZE, (y + 2) * TILESIZE, color), 
            new SquareTile((x + 1) * TILESIZE, (y + 2) * TILESIZE, color)
        ); 
    }

    make() {
        for (let i = 0; i < this.tiles.length; i++) {
            this.tiles[i].make();
          }
    }
}

class TetrominoZ extends Tetromino {
    constructor(x, y, color) {
        super(); 
        this.state = 0; 
        this.tiles.push(
            new SquareTile(x * TILESIZE, y * TILESIZE, color),
            new SquareTile(x * TILESIZE, (y + 1) * TILESIZE, color),
            new SquareTile((x + 1) * TILESIZE, y * TILESIZE, color), 
            new SquareTile((x + 1) * TILESIZE, (y - 1) * TILESIZE, color)
        ); 
    }

    make() {
        for (let i = 0; i < this.tiles.length; i++) {
            this.tiles[i].make();
          }
    }

    rotate(rot) {
        if (this.state === 0) {
            this.toState1(); 

        } else {
            this.toState0(); 

        }
    }

    // Z and S are fairly interesting in that there are actually two tiles
    // that never move under rotations!  

    toState0() {
        let sTile1 = this.tiles[1];
        let sTile2 = this.tiles[3];

        const s1x = sTile1.x / TILESIZE;
        const s1y = sTile1.y / TILESIZE;
        const s2x = sTile2.x / TILESIZE;
        const s2y = sTile2.y / TILESIZE;

        if (occupiedGrids.has(`${s1x - 2},${s1y}`)) return;
        if (occupiedGrids.has(`${s2x},${s2y - 2}`)) return;

        this.state = 0; 
        occupiedGrids.delete(`${s1x},${s1y}`);
        occupiedGrids.delete(`${s2x},${s2y}`); 

        this.tiles[1] = new SquareTile((s1x - 2) * TILESIZE, (s1y) * TILESIZE, sTile1.color);
        this.tiles[3] = new SquareTile((s2x) * TILESIZE, (s2y - 2) * TILESIZE, sTile2.color);
    }

    toState1() {
        let sTile1 = this.tiles[1];
        let sTile2 = this.tiles[3];

        const s1x = sTile1.x / TILESIZE;
        const s1y = sTile1.y / TILESIZE;
        const s2x = sTile2.x / TILESIZE;
        const s2y = sTile2.y / TILESIZE;

        if (occupiedGrids.has(`${s1x + 2},${s1y}`)) return;
        if (occupiedGrids.has(`${s2x},${s2y + 2}`)) return;

        this.state = 1; 
        occupiedGrids.delete(`${s1x},${s1y}`);
        occupiedGrids.delete(`${s2x},${s2y}`); 

        this.tiles[1] = new SquareTile((s1x + 2) * TILESIZE, (s1y) * TILESIZE, sTile1.color);
        this.tiles[3] = new SquareTile((s2x) * TILESIZE, (s2y + 2) * TILESIZE, sTile2.color);
    }
}

class TetrominoS extends Tetromino {
    constructor(x, y, color) {
        super(); 

        this.tiles.push(
            new SquareTile((x + 1) * TILESIZE, y * TILESIZE, color),
            new SquareTile((x + 1) * TILESIZE, (y + 1) * TILESIZE, color),
            new SquareTile(x * TILESIZE, y * TILESIZE, color), 
            new SquareTile(x * TILESIZE, (y - 1) * TILESIZE, color)
        ); 
    }

    make() {
        for (let i = 0; i < this.tiles.length; i++) {
            this.tiles[i].make();
          }
    }

    rotate(rot) {
        if (this.state === 0) {
            this.toState1(); 

        } else {
            this.toState0(); 

        }
    }

    toState0() {
        let sTile1 = this.tiles[1];
        let sTile2 = this.tiles[3];

        const s1x = sTile1.x / TILESIZE;
        const s1y = sTile1.y / TILESIZE;
        const s2x = sTile2.x / TILESIZE;
        const s2y = sTile2.y / TILESIZE;

        if (occupiedGrids.has(`${s1x - 2},${s1y}`)) return;
        if (occupiedGrids.has(`${s2x},${s2y + 2}`)) return;

        this.state = 0; 
        occupiedGrids.delete(`${s1x},${s1y}`);
        occupiedGrids.delete(`${s2x},${s2y}`); 

        this.tiles[1] = new SquareTile((s1x - 2) * TILESIZE, (s1y) * TILESIZE, sTile1.color);
        this.tiles[3] = new SquareTile((s2x) * TILESIZE, (s2y + 2) * TILESIZE, sTile2.color);
    }

    toState1() {
        let sTile1 = this.tiles[1];
        let sTile2 = this.tiles[3];

        const s1x = sTile1.x / TILESIZE;
        const s1y = sTile1.y / TILESIZE;
        const s2x = sTile2.x / TILESIZE;
        const s2y = sTile2.y / TILESIZE;

        if (occupiedGrids.has(`${s1x + 2},${s1y}`)) return;
        if (occupiedGrids.has(`${s2x},${s2y - 2}`)) return;

        this.state = 1; 
        occupiedGrids.delete(`${s1x},${s1y}`);
        occupiedGrids.delete(`${s2x},${s2y}`); 

        this.tiles[1] = new SquareTile((s1x + 2) * TILESIZE, (s1y) * TILESIZE, sTile1.color);
        this.tiles[3] = new SquareTile((s2x) * TILESIZE, (s2y - 2) * TILESIZE, sTile2.color);
    }
}

class TetrominoT extends Tetromino {
    constructor(x, y, color) {
        super(); 

        this.tiles.push(
            new SquareTile(x * TILESIZE, y * TILESIZE, color),
            new SquareTile(x * TILESIZE, (y - 1) * TILESIZE, color),
            new SquareTile(x * TILESIZE, (y + 1) * TILESIZE, color), 
            new SquareTile((x + 1) * TILESIZE, y * TILESIZE, color)
        ); 
    }

    make() {
        for (let i = 0; i < this.tiles.length; i++) {
            this.tiles[i].make();
          }
    }
}



function makeFrame() {
    context.fillStyle = BLACK;
    context.fillRect(0, 0, canvas.width, canvas.height);

    const cols = canvas.width / TILESIZE;
    const rows = canvas.height / TILESIZE;

    // add this if you want a line on top as well! 

    // for (let x = 0; x < cols; x++) {
    //     new SquareTile(x * TILESIZE, 0, GRAY).make();
    // }

    for (let x = 0; x < cols; x++) {
        new SquareTile(x * TILESIZE, (rows - 1) * TILESIZE, GRAY).make();
    }

    for (let y = -10; y < rows - 1; y++) {
        new SquareTile(0, y * TILESIZE, GRAY).make();
        new SquareTile((cols - 1) * TILESIZE, y * TILESIZE, GRAY).make();
    }

}


let shapesUsedInCycle = new Set(); 

function addRandomTetronimo() {
    // console.log(shapesUsedInCycle); 

    if (shapesUsedInCycle.size == SHAPES.size) shapesUsedInCycle = new Set(); 
    let possibleShapes = Array.from(SHAPES.difference(shapesUsedInCycle)); 
    let rIdx = Math.floor(Math.random() * possibleShapes.length); 
    let pickedShape = possibleShapes[rIdx]; 

    let max = 9; let min = 1; 
    let dropX = Math.floor(Math.random() * (max - min + 1)) + min;
    let dropY = -5; 
    let newTetro;

    // need to add a bunch of bounds checks so that tetros dont get stuck on
    // the boundary box
    
    switch (pickedShape) {
        case "O": 
            newTetro = new TetrominoO(dropX, dropY, YELLOW); 
            break; 

        case "I":
            newTetro = new TetrominoI(dropX, dropY, CYAN); 
            break; 
        
        case "J": 
            newTetro = new TetrominoJ(dropX, dropY, BLUE); 
            break; 

        case "L":
            newTetro = new TetrominoL(dropX, dropY, ORANGE); 
            break;
            
        case "S": 
            newTetro = new TetrominoS(dropX, dropY, GREEN); 
            break; 

        case "Z":
            newTetro = new TetrominoZ(dropX, dropY, RED); 
            break;

        case "T":
            newTetro = new TetrominoT(dropX, dropY, PURPLE); 
            break;
    }
    allTetros.push(newTetro); 
    shapesUsedInCycle.add(pickedShape);
}

function makeAndUpdateTetros() {
    if (allTetros.length == 0) addRandomTetronimo(); 

    let tetroInPlay = false; 

    for (let i = 0; i < allTetros.length; i++) {
        allTetros[i].make(); 
        allTetros[i].step();
        
        tetroInPlay = tetroInPlay || allTetros[i].isActive; 
    }

    // add logic to delete lines

    if (!tetroInPlay) addRandomTetronimo(); 

}

window.addEventListener("keydown", e => {
    if (e.key === "ArrowRight") {
        for (const tetro of allTetros) {
            if (tetro.isActive) {
                tetro.shift(1);
                break;
            }
        }
    }
});

window.addEventListener("keydown", e => {
    if (e.key === "ArrowLeft") {
        for (const tetro of allTetros) {
            if (tetro.isActive) {
                tetro.shift(-1);
                break;
            }
        }
    }
});

window.addEventListener("keydown", e => {
    if (e.key === "d") {
        for (const tetro of allTetros) {
            if (tetro.isActive) {
                tetro.rotate(-1);
                break;
            }
        }
    }
});

window.addEventListener("keydown", e => {
    if (e.key === "a") {
        for (const tetro of allTetros) {
            if (tetro.isActive) {
                tetro.rotate(1);
                break;
            }
        }
    }
});

function animate() {
    frameStep += 1; 
    context.clearRect(0, 0, canvas.width, canvas.height);
    makeFrame(); 
    // testTile.make();
    // testTile.step();
    
    // testTile2.make();
    // testTile2.step();

    // new TetrominoI(5, 1, RED).make(); 
    // new TetrominoJ(6, 4, BLUE).make();
    // // new TetrominoL(1, 5, CYAN).make(); 
    // new TetrominoZ(3, 8, YELLOW).make(); 
    // new TetrominoS(7, 8, GREEN).make(); 
    // new TetrominoT(5, 11, ORANGE).make(); 

    makeAndUpdateTetros(); 
    

    requestAnimationFrame(animate);
}

animate();
