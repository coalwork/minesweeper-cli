import chalk from 'chalk';
import Square from './Square.js';
import Mine from './Mine.js';
import { isWithinRange } from './utils.js';

export default class Minefield extends Array {
  totalMineCount = 0;

  constructor(r, c, chance) {
    super();
    
    for (let i = 0; i < r * c; i++) {
      const rowIndex = Math.floor(i / c);
      const row = this[rowIndex];
      const square = Minefield.generateSquare(chance);
      this[rowIndex] = Array.isArray(row) ? row : [];
      this[rowIndex][i % c] = square;

      this.totalMineCount += square.isMine;
    }

    if (![r, c, chance].every(item => !isNaN(+item))) {
      throw TypeError('invalid input');
    }

    this.rows = parseInt(r);
    this.columns = parseInt(c);
    this.chance = parseFloat(chance);
  }

  reveal(r, c) {
    if (!this[r][c].reveal()) return [];
    const updated = [{ x: c, y: r }];
    if (this.countAdjacentMines(r, c) !== 0) return updated;

    for (let i = 0; i < 9; i++) {
      if (i === 4) continue;

      const y = r + Math.floor(i / 3) - 1;
      const x = c + i % 3 - 1;

      if (!isWithinRange(y, 0, this.rows - 1)
        || !isWithinRange(x, 0, this.columns - 1)) continue;

      const square = this[y][x];
      if (!square.revealed
        && this.countAdjacentMines(y, x) === 0
        && !square.isMine) {
        updated.push(...this.reveal(y, x));
        continue;
      }
      square.reveal();
      updated.push({ x, y });
    }

    return updated;
  }

  countAdjacentMines(r, c) {
    let count = 0;

    for (let i = 0; i < 9; i++) {
      const y = r + Math.floor(i / 3) - 1;
      const x = c + i % 3 - 1;

      if (i === 4) continue;
      if (!isWithinRange(y, 0, this.rows - 1)
        || !isWithinRange(x, 0, this.columns - 1)) continue;

      count += this[y][x].isMine;
    }

    return count;
  }

  static generateSquare(chance) {
    return new (Math.random() < chance ? Mine : Square);
  }

  static charlist = {
    hidden: chalk.bgBlack.gray('\u2591'),
    mine: chalk.bgRed.black('X'),
    flag: chalk.bgBlue.black('/'),
    noAdjacentMines: chalk.bgBlack(' '),
    normal: chalk.bgBlack,
    numbers: 'blue yellow green red magenta cyan redBright magentaBright'.split(' ')
  }

  squareToString(r, c) {
    const $ = this[r][c];
    const { charlist } = Minefield;
    const adjacentMineCount = this.countAdjacentMines(r, c);
    return $.flagged
      ? charlist.flag
      : $.revealed
      ? $.isMine
      ? charlist.mine
      : adjacentMineCount === 0
      ? charlist.noAdjacentMines
      : charlist.normal[charlist.numbers[adjacentMineCount - 1]](adjacentMineCount)
      : charlist.hidden;
  }

  toString() {
    const { rows, columns } = this;
    
    let fieldString = '';
    for (let i = 0; i < this.rows; i++) {

      let rowString = '';
      for (let j = 0; j < this.columns; j++) {
        rowString += this.squareToString(i, j)
      }

      fieldString += rowString + '\n';
    }
    
    return fieldString.slice(0, -1);
  }

  get totalRevealedCount() {
    let count = 0;
    for (let row of this) for (let { revealed } of row)
      count += revealed;
    return count;
  }
}
