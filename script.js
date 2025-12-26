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

let frameStep = 0; 
let updateMod = 20; 
let occupiedGrids = new Set(); 

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

        occupiedGrids.add(`${this.x / TILESIZE},${this.y / TILESIZE}`);
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
        console.log(occupiedGrids); 
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
            new SquareTile((x + 1) * TILESIZE, y * TILESIZE, color),
            new SquareTile((x + 2) * TILESIZE, y * TILESIZE, color), 
            new SquareTile((x + 3) * TILESIZE, y * TILESIZE, color)
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
            new SquareTile(x * TILESIZE, y * TILESIZE, color),
            new SquareTile((x + 1) * TILESIZE, y * TILESIZE, color),
            new SquareTile((x + 2) * TILESIZE, y * TILESIZE, color), 
            new SquareTile((x + 2) * TILESIZE, (y - 1) * TILESIZE, color)
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
            new SquareTile((x + 1) * TILESIZE, y * TILESIZE, color),
            new SquareTile((x + 2) * TILESIZE, y * TILESIZE, color), 
            new SquareTile((x + 2) * TILESIZE, (y + 1) * TILESIZE, color)
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
            new SquareTile((x + 1) * TILESIZE, y * TILESIZE, color),
            new SquareTile(x * TILESIZE, (y - 1) * TILESIZE, color), 
            new SquareTile((x - 1) * TILESIZE, (y - 1) * TILESIZE, color)
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
            new SquareTile(x * TILESIZE, y * TILESIZE, color),
            new SquareTile((x - 1) * TILESIZE, y * TILESIZE, color),
            new SquareTile(x * TILESIZE, (y - 1) * TILESIZE, color), 
            new SquareTile((x + 1) * TILESIZE, (y - 1) * TILESIZE, color)
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
            new SquareTile((x - 1) * TILESIZE, y * TILESIZE, color),
            new SquareTile((x +  1) * TILESIZE, y * TILESIZE, color), 
            new SquareTile(x * TILESIZE, (y - 1) * TILESIZE, color)
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

let testTile = new TetrominoO(2, 1, PURPLE); 
 

function animate() {
    frameStep += 1; 
    context.clearRect(0, 0, canvas.width, canvas.height);
    makeFrame(); 
    testTile.make();
    testTile.step(); 

    new TetrominoI(5, 1, RED).make(); 
    new TetrominoJ(6, 4, BLUE).make();
    new TetrominoL(1, 5, CYAN).make(); 
    new TetrominoZ(3, 8, YELLOW).make(); 
    new TetrominoS(7, 8, GREEN).make(); 
    new TetrominoT(5, 11, ORANGE).make(); 
    

    requestAnimationFrame(animate);
}

animate();
