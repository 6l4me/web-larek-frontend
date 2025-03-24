import { Card, ICardData, ICardActions } from '../Card';

export class BasketCard extends Card {
    constructor(
        element: HTMLElement,
        private index: number,
        private id: string,
        actions: ICardActions
    ) {
        super(element, actions);
        const indexElement = element.querySelector('.basket__item-index');
        if (indexElement) {
            indexElement.textContent = (index + 1).toString();
        }
    }

    render(data: ICardData): HTMLElement {
        super.render(data);
        return this.element;
    }
}