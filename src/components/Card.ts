import { EventEmitter } from "./base/events";

export interface ICardActions {
    onClick?: () => void;
    onButtonClick?: (event: MouseEvent) => void;
}

export interface ICardData {
    title: string;
    image?: string;
    description?: string;
    price: number | null;
    status?: {
        status: string;
        label: string;
    };
    buttonText?: string;
}

export class Card {
    protected static readonly categoryMap: { [key: string]: string } = {
        'софт-скил': 'soft',
        'хард-скил': 'hard',
        'другое': 'other',
        'дополнительное': 'additional',
        'кнопка': 'button'
    };

    protected button: HTMLButtonElement | null = null;

    constructor(
        protected element: HTMLElement,
        protected actions?: ICardActions
    ) {
        if (actions?.onClick) {
            this.element.addEventListener('click', actions.onClick);
        }
        this.button = this.element.querySelector('.card__button');
        if (this.button && actions?.onButtonClick) {
            this.button.addEventListener('click', (e) => {
                e.stopPropagation();
                actions.onButtonClick(e);
            });
        }
    }

    get htmlElement(): HTMLElement {
        return this.element;
    }

    protected setContent(data: ICardData): void {
        const title = this.element.querySelector('.card__title');
        const image = this.element.querySelector('.card__image');
        const description = this.element.querySelector('.card__text');
        const category = this.element.querySelector('.card__category');
        const price = this.element.querySelector('.card__price');

        if (title) title.textContent = data.title;
        if (image && data.image) {
            image.setAttribute('src', data.image);
            image.setAttribute('alt', data.title);
        }
        if (description && data.description) {
            description.textContent = data.description;
        }
        if (category && data.status) {
            category.textContent = data.status.label;
            const categoryClasses = Array.from(category.classList)
                .filter(cls => cls.startsWith('card__category_'));
            category.classList.remove(...categoryClasses);
            
            const categoryStyle = Card.categoryMap[data.status.status.toLowerCase()] || 'other';
            category.classList.add(`card__category_${categoryStyle}`);
        }
        if (price) {
            price.textContent = data.price ? `${data.price} синапсов` : 'Бесценно';
        }
        if (this.button && data.buttonText) {
            this.button.textContent = data.buttonText;
            this.button.disabled = data.price === null;
        }
    }

    setButtonText(text: string): void {
        if (this.button) {
            this.button.textContent = text;
        }
    }

    setButtonDisabled(disabled: boolean): void {
        if (this.button) {
            this.button.disabled = disabled;
        }
    }

    render(data: ICardData): HTMLElement {
        this.setContent(data);
        return this.element;
    }
}