import { Component } from '../base/Component';
import { IBasketItem } from '../../types';
import { IEvents } from '../base/events';
import { cloneTemplate } from '../../utils/utils';
import { AppData } from '../AppData';
import { Modal } from './ModalView';

export class BasketView extends Component {
    private events: IEvents;
    private appData: AppData;
    private modal: Modal;

    constructor(container: HTMLElement, events: IEvents, appData: AppData, modal: Modal) {
        super(container);
        this.events = events;
        this.appData = appData;
        this.modal = modal;

        // Подписываемся на события
        this.events.on('cart:open', this.open.bind(this));
        this.events.on('cart:remove', this.removeItem.bind(this));
    }

    render(): void {
        const cartItems = this.appData.getCart();
        const basketTemplate = document.getElementById('basket') as HTMLTemplateElement;
        const basketElement = cloneTemplate(basketTemplate);
        const basketList = basketElement.querySelector('.basket__list');
        const basketPrice = basketElement.querySelector('.basket__price');
        const basketButton = basketElement.querySelector('.basket__button') as HTMLButtonElement;

        // Очищаем список
        basketList.innerHTML = '';

        if (cartItems.length === 0) {
            basketList.innerHTML = '<p>Корзина пуста</p>';
            basketButton.disabled = true;
        } else {
            const cardBasketTemplate = document.getElementById('card-basket') as HTMLTemplateElement;
            
            cartItems.forEach((item, index) => {
                const basketItem = cloneTemplate(cardBasketTemplate);
                
                // Устанавливаем индекс
                (basketItem.querySelector('.basket__item-index') as HTMLElement).textContent = (index + 1).toString();
                
                // Заполняем данные товара
                (basketItem.querySelector('.card__title') as HTMLElement).textContent = item.title;
                (basketItem.querySelector('.card__price') as HTMLElement).textContent = `${item.price} синапсов`;
                
                // Настраиваем кнопку удаления
                const deleteButton = basketItem.querySelector('.basket__item-delete') as HTMLButtonElement;
                deleteButton.dataset.id = item.id;
                deleteButton.addEventListener('click', () => {
                    this.events.emit('cart:remove', { productId: item.id });
                });
                
                basketList.appendChild(basketItem);
            });
            basketButton.disabled = false;
            
            // Добавляем обработчик для кнопки "Оформить"
            basketButton.addEventListener('click', () => {
                this.events.emit('order:open');
            });
        }

        // Обновляем общую сумму
        const total = cartItems.reduce((sum, item) => sum + item.price, 0);
        basketPrice.textContent = `${total} синапсов`;

        this.modal.setContent(basketElement);
    }

    open(): void {
        this.render();
        this.modal.open();
    }

    removeItem({ productId }: { productId: string }): void {
        this.appData.removeFromCart(productId);
        this.render();
    }
} 