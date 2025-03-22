export abstract class Component {
  protected container: HTMLElement;

  constructor(container: HTMLElement) {
      this.container = container;
  }

  protected qs<T extends HTMLElement>(selector: string): T | null {
      return this.container.querySelector<T>(selector);
  }
}
