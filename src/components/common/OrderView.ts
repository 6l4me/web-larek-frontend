import { Component } from "../base/Component";
import { IEvents } from "../base/events";
import { cloneTemplate } from "../../utils/utils";
import { Modal } from "./ModalView";
import { AppData } from "../AppData";
import { ShopAPI } from "../ShopApi";
import { IOrderRequest, IOrder } from "../../types";

export class OrderView extends Component {
    private events: IEvents;
    private modal: Modal;
    private appData: AppData;
    private api: ShopAPI;

    constructor(container: HTMLElement, events: IEvents, modal: Modal, appData: AppData, api: ShopAPI) {
        super(container);
        this.events = events;
        this.modal = modal;
        this.appData = appData;
        this.api = api;

        this.events.on('order:open', this.openOrderForm.bind(this));
        this.events.on('order:submit', this.openContactsForm.bind(this));
    }

    private openOrderForm(): void {
        const orderTemplate = document.getElementById('order') as HTMLTemplateElement;
        const orderElement = cloneTemplate(orderTemplate);
        
        // Добавляем обработчики для кнопок способа оплаты
        const paymentButtons = orderElement.querySelectorAll('.order__buttons button');
        paymentButtons.forEach(button => {
            button.addEventListener('click', () => {
                // Убираем активный класс у всех кнопок
                paymentButtons.forEach(btn => btn.classList.remove('button_active'));
                // Добавляем активный класс нажатой кнопке
                button.classList.add('button_active');
                // Разблокируем кнопку "Далее"
                (orderElement.querySelector('.order__button') as HTMLButtonElement).disabled = false;
            });
        });
        
        orderElement.addEventListener('submit', (e) => {
            e.preventDefault();
            const address = (orderElement.querySelector('input[name="address"]') as HTMLInputElement).value;
            const method = orderElement.querySelector('.button_active')?.getAttribute('name') || '';
            
            if (!method) {
                console.error('Не выбран способ оплаты');
                return;
            }
            
            this.events.emit('order:submit', {
                payment: { method },
                address: { address }
            });
        });
        
        this.modal.setContent(orderElement);
    }

    private openContactsForm(data: { payment: { method: string }, address: { address: string } }): void {
        const contactsTemplate = document.getElementById('contacts') as HTMLTemplateElement;
        const contactsElement = cloneTemplate(contactsTemplate);
        
        const submitButton = contactsElement.querySelector('button[type="submit"]') as HTMLButtonElement;
        const emailInput = contactsElement.querySelector('input[name="email"]') as HTMLInputElement;
        const phoneInput = contactsElement.querySelector('input[name="phone"]') as HTMLInputElement;

        const checkFields = () => {
            const isEmailFilled = emailInput.value.trim() !== '';
            const isPhoneFilled = phoneInput.value.trim() !== '';
            submitButton.disabled = !(isEmailFilled && isPhoneFilled);
        };

        // Добавляем слушатели для проверки полей при вводе
        emailInput.addEventListener('input', checkFields);
        phoneInput.addEventListener('input', checkFields);
        
        // Добавляем обработчик отправки формы
        contactsElement.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const cartItems = this.appData.getCart();
            console.log('Товары в корзине:', cartItems);
            
            if (cartItems.length === 0) {
                const errorContainer = contactsElement.querySelector('.form__errors');
                if (errorContainer) {
                    errorContainer.textContent = 'Корзина пуста';
                }
                return;
            }
            
            const total = cartItems.reduce((sum, item) => sum + item.price, 0);
            
            const orderData: IOrderRequest = {
                payment: data.payment.method,
                email: emailInput.value.trim(),
                phone: phoneInput.value.trim(),
                address: data.address.address,
                total: total,
                items: cartItems.map(item => item.id)
            };
            
            console.log('Отправляем данные заказа:', JSON.stringify(orderData, null, 2));
            
            // Отправляем заказ на сервер
            this.api.placeOrder(orderData)
                .then((response: IOrder) => {
                    // Очищаем корзину
                    this.appData.clearCart();
                    
                    // Показываем сообщение об успехе
                    this.showSuccessMessage(response);
                })
                .catch(err => {
                    console.error('Ошибка оформления заказа:', err);
                    const errorContainer = contactsElement.querySelector('.form__errors');
                    if (errorContainer) {
                        errorContainer.textContent = err.message || 'Произошла ошибка при оформлении заказа';
                    }
                });
        });
        
        this.modal.setContent(contactsElement);
    }

    private showSuccessMessage(response: IOrder): void {
        const successTemplate = document.getElementById('success') as HTMLTemplateElement;
        const successElement = cloneTemplate(successTemplate);
        
        (successElement.querySelector('.order-success__description') as HTMLElement).textContent = 
            `Списано ${response.total} синапсов`;
        
        const closeButton = successElement.querySelector('.order-success__close');
        closeButton?.addEventListener('click', () => {
            this.modal.close();
        });
        
        this.modal.setContent(successElement);
    }
} 