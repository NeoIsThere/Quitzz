import {
  AfterContentInit,
  AfterViewInit,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
} from '@angular/core';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})
export class GameComponent implements AfterViewInit {
  constructor() {}

  @ViewChild('canvas') canvas: ElementRef;

  ctx: CanvasRenderingContext2D;
  W = 175;
  H = 220;
  COLS = 16;
  ROWS = 20;
  BLOCK_W = this.W / this.COLS;
  BLOCK_H = this.H / this.ROWS;
  COLOR = '#0d47a1';
  RENDER_MS = 30;
  TICK_MS = 300;
  MAX_SHAPE_COL = 4;
  board: any = [];
  lose: boolean;
  interval: any;
  intervalRender: any;
  current: any; // current moving shape
  currentX: number;
  currentY: number; // position of current shape
  freezed: boolean; // is current shape settled on the board?
  shapes = [
    [1, 0, 0, 0],
    [1, 1, 0, 0],
    [1, 0, 1, 0, 1, 1, 1, 0],
    [0, 1, 0, 0, 0, 1, 0, 0, 1, 1, 1, 0],
    [0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0],
    [1, 1, 1, 0],
    [1, 1, 1, 0, 1],
    [1, 1, 1, 0, 0, 0, 1],
    [1, 1, 0, 0, 1, 1],
    [1, 1, 0, 0, 0, 1, 1],
    [0, 1, 1, 0, 1, 1],
    [0, 1, 0, 0, 1, 1, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ];

  disabled: boolean;

  ngAfterViewInit(): void {
    this.ctx = this.canvas.nativeElement.getContext(
      '2d'
    ) as CanvasRenderingContext2D;
    this.ctx.lineCap = 'round';
    this.ctx.imageSmoothingEnabled = false;
    this.ctx.scale(2, 2);
    this.ctx.strokeStyle = this.COLOR;
    this.ctx.fillStyle = this.COLOR;
  }

  drawBlock(x: number, y: number) {
    this.ctx.fillRect(
      this.BLOCK_W * x,
      this.BLOCK_H * y,
      this.BLOCK_W + 1,
      this.BLOCK_H + 1
    );
    this.ctx.strokeRect(
      this.BLOCK_W * x,
      this.BLOCK_H * y,
      this.BLOCK_W - 1,
      this.BLOCK_H - 1
    );
  }

  // draws the board and the moving shape
  render() {
    this.ctx.clearRect(0, 0, this.W, this.H);

    for (var x = 0; x < this.COLS; ++x) {
      for (var y = 0; y < this.ROWS; ++y) {
        if (this.board[y][x]) {
          this.drawBlock(x, y);
        }
      }
    }

    for (var y = 0; y < 4; ++y) {
      for (var x = 0; x < 4; ++x) {
        if (this.current[y][x]) {
          this.drawBlock(this.currentX + x, this.currentY + y);
        }
      }
    }
  }

  newShape() {
    var id = Math.floor(Math.random() * this.shapes.length);
    var shape = this.shapes[id]; // maintain id for color filling

    this.current = [];
    for (var y = 0; y < 4; ++y) {
      this.current[y] = [];
      for (var x = 0; x < 4; ++x) {
        var i = 4 * y + x;
        if (typeof shape[i] != 'undefined' && shape[i]) {
          this.current[y][x] = id + 1;
        } else {
          this.current[y][x] = 0;
        }
      }
    }

    // new shape starts to move
    this.freezed = false;
    // position where the shape will evolve
    this.currentX = Math.floor(
      Math.random() * (this.COLS - this.MAX_SHAPE_COL - 1)
    );
    this.currentY = 0;
  }

  // clears the board
  init() {
    for (var y = 0; y < this.ROWS; ++y) {
      this.board[y] = [];
      for (var x = 0; x < this.COLS; ++x) {
        this.board[y][x] = 0;
      }
    }
  }

  // keep the element moving down, creating new shapes and clearing lines
  tick() {
    if (this.valid(0, 1)) {
      ++this.currentY;
    }
    // if the element settled
    else {
      this.freeze();
      this.valid(0, 1);
      this.clearLines();
      if (this.lose) {
        this.clearAllIntervals();
        return;
      }
      this.newShape();
    }
  }

  // stop shape at its position and fix it to board
  freeze() {
    for (var y = 0; y < 4; ++y) {
      for (var x = 0; x < 4; ++x) {
        if (this.current[y][x]) {
          this.board[y + this.currentY][x + this.currentX] = this.current[y][x];
        }
      }
    }
    this.freezed = true;
  }

  // returns rotates the rotated shape 'current' perpendicularly anticlockwise
  rotate(current: any) {
    const newCurrent: any = [];
    for (var y = 0; y < 4; ++y) {
      newCurrent[y] = [];
      for (var x = 0; x < 4; ++x) {
        newCurrent[y][x] = current[3 - x][y];
      }
    }

    return newCurrent;
  }

  // check if any lines are filled and clear them
  clearLines() {
    for (var y = this.ROWS - 1; y >= 0; --y) {
      var rowFilled = true;
      for (var x = 0; x < this.COLS; ++x) {
        if (this.board[y][x] == 0) {
          rowFilled = false;
          break;
        }
      }
      if (rowFilled) {
        for (var yy = y; yy > 0; --yy) {
          for (var x = 0; x < this.COLS; ++x) {
            this.board[yy][x] = this.board[yy - 1][x];
          }
        }
        ++y;
      }
    }
  }
  onKeyPress(direction: string) {
    this.keyPress(direction);
    this.render();
  }

  keyPress(key: any) {
    switch (key) {
      case 'left':
        if (this.valid(-1)) {
          --this.currentX;
        }
        break;
      case 'right':
        if (this.valid(1)) {
          ++this.currentX;
        }
        break;
      case 'down':
        if (this.valid(0, 1)) {
          ++this.currentY;
        }
        break;
      case 'rotate':
        var rotated = this.rotate(this.current);
        if (this.valid(0, 0, rotated)) {
          this.current = rotated;
        }
        break;
      case 'drop':
        while (this.valid(0, 1)) {
          ++this.currentY;
        }
        this.tick();
        break;
    }
  }

  // checks if the resulting position of current shape will be feasible
  valid(
    offsetX: number,
    offsetY: any = undefined,
    newCurrent: any = undefined
  ) {
    offsetX = offsetX || 0;
    offsetY = offsetY || 0;
    offsetX = this.currentX + offsetX;
    offsetY = this.currentY + offsetY;
    newCurrent = newCurrent || this.current;

    for (var y = 0; y < 4; ++y) {
      for (var x = 0; x < 4; ++x) {
        if (newCurrent[y][x]) {
          if (
            typeof this.board[y + offsetY] == 'undefined' ||
            typeof this.board[y + offsetY][x + offsetX] == 'undefined' ||
            this.board[y + offsetY][x + offsetX] ||
            x + offsetX < 0 ||
            y + offsetY >= this.ROWS ||
            x + offsetX >= this.COLS
          ) {
            if (offsetY == 1 && this.freezed) {
              this.lose = true; // lose if the current shape is settled at the top most row
              this.disabled = false;
            }
            return false;
          }
        }
      }
    }
    return true;
  }

  playButtonClicked() {
    this.newGame();
    this.disabled = true;
  }

  newGame() {
    this.clearAllIntervals();
    this.intervalRender = setInterval(() => this.render(), this.RENDER_MS);
    this.init();
    this.newShape();
    this.lose = false;
    this.interval = setInterval(() => this.tick(), this.TICK_MS);
  }

  clearAllIntervals() {
    clearInterval(this.interval);
    clearInterval(this.intervalRender);
  }
}
