import './scss/styles.scss';

import { EventEmitter } from './components/base/events';
import { IItem, IItemPreview, IOrderRequest, IOrder } from './types';
import { ensureElement, cloneTemplate } from './utils/utils';

import { CatalogView } from './components/common/CatalogView';

import { API_URL, CDN_URL } from './utils/constants';
import { ShopAPI } from './components/ShopApi';
import { AppData } from './components/AppData';
import { Modal } from './components/common/ModalView';
import { CatalogItem } from './components/common/CatalogItem';

const events = new EventEmitter();
const api = new ShopAPI(CDN_URL, API_URL);
const appState = new AppData(events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);

const cardPreviewTemplate = document.getElementById('card-preview') as HTMLTemplateElement;

const catalogView = new CatalogView('.gallery', events, appState);

events.on('catalog:updated', (data: { catalog: IItemPreview[] }) => {
    console.log('Рендерим каталог:', data.catalog);
    catalogView.render(data.catalog);
});

// открытие корзины по клику на иконку
const cartIcon = ensureElement<HTMLElement>('.header__basket');
cartIcon.addEventListener('click', () => {
    events.emit('cart:open');
});

const basketTemplate = document.getElementById('basket') as HTMLTemplateElement;

// Функция рендеринга корзины
const renderCart = () => {
    const cartItems = appState.getCart();
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
                events.emit('cart:remove', { productId: item.id });
            });
            
            basketList.appendChild(basketItem);
        });
        basketButton.disabled = false;
        
        basketButton.addEventListener('click', () => {
            events.emit('order:open');
        });
    }

    const total = cartItems.reduce((sum, item) => sum + item.price, 0);
    basketPrice.textContent = `${total} синапсов`;

    modal.setContent(basketElement);
};

events.on('cart:open', () => {
    renderCart();
    modal.open();
});

events.on('cart:remove', ({ productId }: { productId: string }) => {
    appState.removeFromCart(productId);
    renderCart(); // Обновляем содержимое модалки
});

events.on('product:selected', ({ productId }: { productId: string }) => {
    api.getProductItem(productId)
        .then((product: IItem) => {
            const card = new CatalogItem(cloneTemplate(cardPreviewTemplate), {
                onClick: () => events.emit('card:select', product)
            });

            const modalContent = card.render({
                title: product.title,
                image: product.image,
                description: product.description || "Нет описания",
                price: product.price,
                status: {
                    status: product.category,
                    label: product.category
                }
            });

            // Добавляем кнопку "Купить / Убрать"
            const toggleCartBtn = modalContent.querySelector('.card__button') as HTMLButtonElement;
            if (product.price === null) {
                // Для бесценных товаров
                toggleCartBtn.textContent = 'Бесценно';
                toggleCartBtn.disabled = true;
            } else {
                // Для обычных товаров
                toggleCartBtn.textContent = appState.isInCart(product.id) ? "Убрать" : "Купить";
                toggleCartBtn.addEventListener('click', () => {
                    if (appState.isInCart(product.id)) {
                        events.emit('cart:remove', { productId: product.id });
                    } else {
                        events.emit('cart:add', { product });
                    }
                    toggleCartBtn.textContent = appState.isInCart(product.id) ? "Убрать" : "Купить";
                });
            }

            modal.setContent(modalContent);
            modal.open();
        })
        .catch(err => console.error('Ошибка загрузки товара:', err));
});

// Добавление товара в корзину
events.on('cart:add', ({ product }: { product: IItem }) => {
    appState.addToCart(product);
});

// Загружаем товары
api.getProductList()
    .then(data => {
        console.log('Полученные данные:', data);
        appState.setCatalog(data);
    })
    .catch(err => {
        console.error('Ошибка загрузки каталога:', err);
    });

// Обработчик открытия формы заказа
events.on('order:open', () => {
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
    
    // Добавляем обработчик отправки формы
    orderElement.addEventListener('submit', (e) => {
        e.preventDefault();
        const address = (orderElement.querySelector('input[name="address"]') as HTMLInputElement).value;
        const method = orderElement.querySelector('.button_active')?.getAttribute('name') || '';
        
        if (!method) {
            console.error('Не выбран способ оплаты');
            return;
        }
        
        events.emit('order:submit', {
            payment: { method },
            address: { address }
        });
    });
    
    modal.setContent(orderElement);
});

// Обработчик отправки формы заказа
events.on('order:submit', (data: { payment: { method: string }, address: { address: string } }) => {
    const contactsTemplate = document.getElementById('contacts') as HTMLTemplateElement;
    const contactsElement = cloneTemplate(contactsTemplate);
    
    const submitButton = contactsElement.querySelector('button[type="submit"]') as HTMLButtonElement;
    const emailInput = contactsElement.querySelector('input[name="email"]') as HTMLInputElement;
    const phoneInput = contactsElement.querySelector('input[name="phone"]') as HTMLInputElement;

    // Функция проверки заполненности полей
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
        
        const cartItems = appState.getCart();
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
        api.placeOrder(orderData)
            .then((response: IOrder) => {
                // Очищаем корзину
                appState.clearCart();
                
                // Показываем сообщение об успехе, используя сумму из ответа сервера
                const successTemplate = document.getElementById('success') as HTMLTemplateElement;
                const successElement = cloneTemplate(successTemplate);
                
                // Устанавливаем сумму заказа из ответа сервера
                (successElement.querySelector('.order-success__description') as HTMLElement).textContent = 
                    `Списано ${response.total} синапсов`;
                
                // Добавляем обработчик для кнопки закрытия
                const closeButton = successElement.querySelector('.order-success__close');
                closeButton?.addEventListener('click', () => {
                    modal.close();
                });
                
                modal.setContent(successElement);
            })
            .catch(err => {
                console.error('Ошибка оформления заказа:', err);
                const errorContainer = contactsElement.querySelector('.form__errors');
                if (errorContainer) {
                    errorContainer.textContent = err.message || 'Произошла ошибка при оформлении заказа';
                }
            });
    });
    
    modal.setContent(contactsElement);
});

