import './scss/styles.scss';

import { EventEmitter } from './components/base/events';
import { IItem, IItemPreview, IOrderRequest, IOrder } from './types';
import { ensureElement, cloneTemplate } from './utils/utils';

import { CatalogView } from './components/common/CatalogView';
import { BasketView } from './components/common/BasketView';

import { API_URL, CDN_URL } from './utils/constants';
import { ShopAPI } from './components/ShopApi';
import { AppData } from './components/AppData';
import { Modal } from './components/common/ModalView';
import { CatalogCard } from './components/common/CatalogCard';
import { OrderForm } from './components/OrderForm';
import { ContactsForm, IContactsFormData } from './components/ContactsForm';

const events = new EventEmitter();
const api = new ShopAPI(CDN_URL, API_URL);
const appState = new AppData(events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

const cardPreviewTemplate = document.getElementById('card-preview') as HTMLTemplateElement;
const catalogView = new CatalogView('.gallery', events, appState);
const basketView = new BasketView(document.querySelector('.basket'), events, appState, modal);

const cartCounter = ensureElement<HTMLElement>('.header__basket-counter');

// Функция обновления счетчика
const updateCartCounter = () => {
    const count = appState.getCart().length;
    cartCounter.textContent = count.toString();
    cartCounter.style.display = count === 0 ? 'none' : 'block';
};

events.on('catalog:updated', (data: { catalog: IItemPreview[] }) => {
    console.log('Рендерим каталог:', data.catalog);
    catalogView.render(data.catalog);
});

// открытие корзины по клику на иконку
const cartIcon = ensureElement<HTMLElement>('.header__basket');
cartIcon.addEventListener('click', () => {
    events.emit('cart:open');
});

events.on('cart:open', () => {
    basketView.open();
});

events.on('cart:remove', ({ productId }: { productId: string }) => {
    appState.removeFromCart(productId);
    basketView.render();
    updateCartCounter();
});

events.on('product:selected', ({ productId }: { productId: string }) => {
    api.getProductItem(productId)
        .then((product: IItem) => {
            const card = new CatalogCard(cloneTemplate(cardPreviewTemplate), {
                onClick: () => events.emit('card:select', product),
                onButtonClick: () => {
                    if (appState.isInCart(product.id)) {
                        events.emit('cart:remove', { productId: product.id });
                    } else {
                        events.emit('cart:add', { product });
                    }
                }
            });

            const renderCard = () => {
                card.render({
                    title: product.title,
                    image: product.image,
                    description: product.description || "Нет описания",
                    price: product.price,
                    status: {
                        status: product.category,
                        label: product.category
                    },
                    buttonText: product.price === null ? 'Бесценно' : 
                        appState.isInCart(product.id) ? "Убрать" : "Купить"
                });
            };

            // Подписываемся на обновление корзины
            events.on('cart:updated', renderCard);
            
            // Первичный рендер
            renderCard();
            modal.setContent(card.htmlElement);
            modal.open();
        })
        .catch(err => console.error('Ошибка загрузки товара:', err));
});

// Добавление товара в корзину
events.on('cart:add', ({ product }: { product: IItem }) => {
    appState.addToCart(product);
    updateCartCounter();
});

// Добавьте отладочную информацию
console.log('API URL:', API_URL);
api.getProductList()
    .then(data => {
        console.log('Полученные данные:', data);
        appState.setCatalog(data);
    })
    .catch(err => {
        console.log('Полный URL запроса:', API_URL + '/product');
        console.error('Ошибка загрузки каталога:', err);
    });

// Обработчик открытия формы заказа
events.on('order:open', () => {
    const orderTemplate = document.getElementById('order') as HTMLTemplateElement;
    const orderElement = cloneTemplate(orderTemplate);
    const orderForm = new OrderForm(orderElement as HTMLFormElement, events);
    modal.setContent(orderElement);
});

interface IOrderFormData {
    payment: { method: string };
    address: { address: string };
}

let orderFormData: IOrderFormData;

events.on('order:submit', (data: IOrderFormData) => {
    orderFormData = data;
    const contactsTemplate = document.getElementById('contacts') as HTMLTemplateElement;
    const contactsElement = cloneTemplate(contactsTemplate);
    const contactsForm = new ContactsForm(contactsElement as HTMLFormElement, events);
    modal.setContent(contactsElement);
});

events.on('contacts:submit', (formData: IContactsFormData) => {
    const orderData: IOrderRequest = {
        payment: orderFormData.payment.method,
        email: formData.email,
        phone: formData.phone,
        address: orderFormData.address.address,
        total: appState.getCart().reduce((sum, item) => sum + item.price, 0),
        items: appState.getCart().map(item => item.id)
    };
    
    api.placeOrder(orderData)
        .then((response: IOrder) => {
            appState.clearCart();
            updateCartCounter();
            
            const successTemplate = document.getElementById('success') as HTMLTemplateElement;
            const successElement = cloneTemplate(successTemplate);
            
            (successElement.querySelector('.order-success__description') as HTMLElement).textContent = 
                `Списано ${response.total} синапсов`;
            
            const closeButton = successElement.querySelector('.order-success__close');
            closeButton?.addEventListener('click', () => {
                modal.close();
            });
            
            modal.setContent(successElement);
        })
        .catch(err => {
            console.error('Ошибка оформления заказа:', err);
            const errorElement = document.createElement('div');
            errorElement.textContent = `Ошибка: ${err.message || 'Произошла ошибка при оформлении заказа'}`;
            modal.setContent(errorElement);
        });
});

// Инициализация счетчика при загрузке страницы
updateCartCounter();

