import Square from './Square.js';

export default class Mine extends Square {
  constructor() {
    super();
    this.isMine = true;
  }
}
