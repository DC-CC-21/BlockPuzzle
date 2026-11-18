export default class Player {
  constructor(game) {
    this.isClick = true;
    this.game = game;
  }

  cancelClick = () => {
    this.isClick = false;
  };
  resetClick = () => {
    this.isClick = true;
  };
  click = (e) => {
    if (this.isClick) {
      console.log(this.game);
      this.game.selectObject(e);
    }
  };
  rotateZ = () => {
    if (this.game.currentPiece) this.game.rotateZ();
  };
}
