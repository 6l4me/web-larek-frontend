export class CatalogItem {
    private static category_map: { [key: string]: string } = {
        'софт-скил': 'soft',
        'хард-скил': 'hard',
        'другое': 'other',
        'дополнительное': 'additional',
        'кнопка': 'button'
    };

    constructor(
        private element: HTMLElement,
        private options: { onClick: () => void }
    ) {
        this.element.addEventListener('click', this.options.onClick);
        if (!this.element.classList.contains('gallery__item')) {
            this.element.classList.add('gallery__item');
        }
    }

    render(data: {
        title: string;
        image: string;
        description: string;
        price: number | null;
        status: {
            status: string;
            label: string;
        }
    }): HTMLElement {
        const title = this.element.querySelector('.card__title');
        const image = this.element.querySelector('.card__image');
        const description = this.element.querySelector('.card__text');
        const category = this.element.querySelector('.card__category');
        const price = this.element.querySelector('.card__price');

        if (title) title.textContent = data.title;
        if (image) {
            image.setAttribute('src', data.image);
            image.setAttribute('alt', data.title);
        }
        if (description) description.textContent = data.description;
        if (category) {
            category.textContent = data.status.label;
            const categoryClasses = Array.from(category.classList)
                .filter(cls => cls.startsWith('card__category_'));
            category.classList.remove(...categoryClasses);
            
            const categoryStyle = CatalogItem.category_map[data.status.status.toLowerCase()] || 'other';
            category.classList.add(`card__category_${categoryStyle}`);
        }
        if (price) price.textContent = data.price ? `${data.price} синапсов` : 'Бесценно';
        
        return this.element;
    }
} 