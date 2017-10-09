import Renderer from './render/renderer';

export default class Game {
  constructor(canvas) {
    this.canvas = canvas;

    new Renderer(canvas);
  }
}
