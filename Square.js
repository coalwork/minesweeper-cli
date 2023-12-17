export default class Square {
  #revealed = false;
  isMine = false;
  flagged = false;

  get revealed() { return this.#revealed; }
  reveal() {
    if (this.flagged) return false;
    if (this.isMine) this.explode();
    this.#revealed = true;
    return true;
  }

  toggleFlag() {
    if (this.#revealed) return false;
    this.flagged = !this.flagged;
    return true;
  }
  
  explode() {}
}
