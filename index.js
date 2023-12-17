import Minefield from './Minefield.js';
import Mine from './Mine.js';
import { default as ae } from 'ansi-escapes';

const { argv } = process;
const minefield = new Minefield(+argv[2], +argv[3], +argv[4]);

Mine.prototype.explode = () => {
  setTimeout(() => {
    stdout.write(ae.cursorTo(0, minefield.rows) + 'You blew up!');
    process.exit();
  });
};

const { stdin, stdout } = process;
stdin.setRawMode(true);
stdin.resume();
stdin.setEncoding('utf8');

stdout.write(ae.clearScreen);
stdout.write(minefield.toString());
stdout.write(ae.cursorTo(0, 0));
const cases = {
  h: 'Backward',
  j: 'Down',
  k: 'Up',
  l: 'Forward'
};
const positionRegex = /\[(\d+);(\d+)R/;
const cursorPosition = { x: 0, y: 0 };

stdin.on('data', key => {
  if (positionRegex.test(key)) {
    const [ _, row, column ] = JSON.stringify(key).match(positionRegex);
    cursorPosition.x = column - 1;
    cursorPosition.y = row - 1;
    return;
  }

  if (key === '\u0003') {
    stdout.write(ae.clearScreen);
    return process.exit();
  }

  if (key === 'f') {
    const { x, y } = cursorPosition;
    minefield[y][x].toggleFlag();
    stdout.write(
      ae.cursorSavePosition
      + ae.cursorTo(x, y)
      + minefield.squareToString(y, x)
      + ae.cursorRestorePosition
    );
    return;
  }

  if (key === 'x') {
    const { x, y } = cursorPosition;
    const updated = minefield.reveal(y, x);

    for (const { x, y } of updated) {
      stdout.write(
        ae.cursorSavePosition
        + ae.cursorTo(x, y)
        + minefield.squareToString(y, x)
        + ae.cursorRestorePosition
      );
    }
    const { totalRevealedCount, rows, columns, totalMineCount } = minefield;
    if (totalRevealedCount === rows * columns - totalMineCount) {
      setTimeout(() => {
        stdout.write(ae.cursorTo(0, rows) + 'You win!');
        process.exit();
      });
    }
    return;
  }

  if (typeof key !== 'string'
    || !cases.hasOwnProperty(key)) return;
  if (cursorPosition.x === minefield.columns - 1 && key === 'l') return;
  if (cursorPosition.y === minefield.rows - 1 && key === 'j') return;
  stdout.write(ae[`cursor${cases[key]}`]() + ae.cursorGetPosition);
});
