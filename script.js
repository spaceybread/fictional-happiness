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

const SHAPES = new Set(["O", "I", "J", "L", "S", "Z", "T"]); 

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

    for (let y = 0; y < rows - 1; y++) {
        new SquareTile(0, y * TILESIZE, GRAY).make();
        new SquareTile((cols - 1) * TILESIZE, y * TILESIZE, GRAY).make();
    }

}


let shapesUsedInCycle = new Set(); 

function addRandomTetronimo() {
    console.log(shapesUsedInCycle); 

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
