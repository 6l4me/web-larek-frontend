import { Card, ICardData, ICardActions } from "../Card";

export class CatalogCard extends Card {
    constructor(element: HTMLElement, actions: ICardActions) {
        super(element, actions);
        if (!element.classList.contains('gallery__item')) {
            element.classList.add('gallery__item');
        }
    }
}