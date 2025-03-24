import { Component } from '../base/Component';
import { IBasketItem } from '../../types';
import { EventEmitter } from '../base/events';
import { cloneTemplate } from '../../utils/utils';
import { AppData } from '../AppData';
import { Modal } from './ModalView';
import { BasketCard } from './BasketCard';

export class BasketView extends Component {
    private events: EventEmitter;
    private appData: AppData;
    private modal: Modal;

    constructor(container: HTMLElement, events: EventEmitter, appData: AppData, modal: Modal) {
        super(container);
        this.events = events;
        this.appData = appData;
        this.modal = modal;
    }

    render(): void {
        const cartItems = this.appData.getCart();
        const basketTemplate = document.getElementById('basket') as HTMLTemplateElement;
        const basketElement = cloneTemplate(basketTemplate);
        const basketList = basketElement.querySelector('.basket__list');
        const basketPrice = basketElement.querySelector('.basket__price');
        const basketButton = basketElement.querySelector('.basket__button') as HTMLButtonElement;

        basketList.innerHTML = '';

        if (cartItems.length === 0) {
            basketList.innerHTML = '<p>Корзина пуста</p>';
            basketButton.disabled = true;
        } else {
            const cardBasketTemplate = document.getElementById('card-basket') as HTMLTemplateElement;
            
            cartItems.forEach((item, index) => {
                const card = new BasketCard(
                    cloneTemplate(cardBasketTemplate),
                    index,
                    item.id,
                    {
                        onButtonClick: () => this.events.emit('cart:remove', { productId: item.id })
                    }
                );
                
                card.render({
                    title: item.title,
                    price: item.price
                });
                
                basketList.appendChild(card.htmlElement);
            });

            basketButton.disabled = false;
            basketButton.addEventListener('click', () => {
                this.events.emit('order:open');
            });
        }

        const total = cartItems.reduce((sum, item) => sum + item.price, 0);
        basketPrice.textContent = `${total} синапсов`;

        this.modal.setContent(basketElement);
    }

    open(): void {
        this.render();
        this.modal.open();
    }
} 