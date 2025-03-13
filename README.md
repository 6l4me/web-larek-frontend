# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:
- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:
- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск
Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```
## Сборка

```
npm run build
```

или

```
yarn build
```


## Данные и типы данных, используемых в приложении 

Все товары на главной странице

export interface IList {
  total: number;
  items: IItem[];
}

1 товар на главной странице

export type IItemPreview = Omit<IItem, 'description'>

Товар в модалке

export interface IItem {
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number | null;
}

Товар в корзине

export interface IBasketItem {
  id: string;
  title: string;
  price: number;
}

Все товары в корзине и их стоимость

export interface IBasket {
  items: IBasketItem[];
  total: number;
}

Строка инпута для адреса

export interface IAddress {
  address: string;
}

Форма почты и телефона

export interface IOrderForm {
  email: string;
  phone: string;
}

Сумма заказа

export interface IOrder {
  id: string;
  total: number;
}

Способ оплаты

export interface IPayment {
  method: string;
}

## Архитектура приложения

Код приложения разделен на слои согласно парадигме MVP:
-Слой модели — отвечает за хранение, обработку и управление данными.
-Слой представления — взаимодействует с пользователем.
-Слой презентера — связывает модель и представление, управляет логикой приложения.

### Базовый код

#### Класс Api
Содержит в себе базовую логику отправки запросов. В конструктор передается базовый адрес сервера и опциональный объект с заголовками запросов.

constructor(baseUrl: string, options: RequestInit = {})

baseUrl: string — базовый адрес сервера.
options: RequestInit — объект с параметрами запроса (опциональный).

Методы: 
- get(uri: string): Promise<object>
Выполняет GET-запрос на переданный uri и возвращает промис с объектом-ответом сервера.

- post(uri: string, data: object, method: ApiPostMethods = 'POST'): Promise<object>
Отправляет JSON-данные на сервер с указанным uri.
    -method по умолчанию 'POST', но может быть переопределён (PUT, PATCH и т. д.).
    -Возвращает промис с объектом-ответом.

- protected handleResponse(response: Response): Promise<object>
Обрабатывает ответ сервера.
    -Если ответ ok, парсит JSON и возвращает объект.
    -Если ошибка, отклоняет промис с сообщением об ошибке.

#### Класс EventEmitter
Брокер событий позволяет отправлять события и подписываться на события, происходящие в системе. Класс используется в презентере для обработки событий и в слоях приложения для генерации событий. 

constructor() (конструктор не принимает параметры)

Основные методы, реализуемые классом описаны интерфейсом `IEvents`:
-on(event: string, callback: (...args: unknown[]) => void): void — подписка на событие.
-emit(event: string, ...args: unknown[]): void — генерация события.
-trigger(event: string): () => void — возвращает функцию для вызова события.


### Слой данных

#### Класс CatalogData
Класс отвечает за хранение и управление списком товаров.

constructor(events: IEvents)

events: IEvents — экземпляр EventEmitter для генерации событий.

Поля класса:

_items: IItem[] — массив товаров.
events: IEvents — экземпляр EventEmitter для событий.
Методы:

getAllItems(): IItem[] — возвращает список всех товаров.
getItem(itemId: string): IItem | undefined — получает товар по id.
setItems(items: IItem[]): void — загружает список товаров.

#### Класс BasketData

Управляет товарами в корзине.

constructor(events: IEvents)

events: IEvents — экземпляр EventEmitter.

Поля:

_items: IBasketItem[] — список товаров в корзине.
_total: number — общая стоимость товаров.
events: IEvents — экземпляр EventEmitter.
Методы:

addItem(item: IBasketItem): void — добавляет товар в корзину.
removeItem(itemId: string): void — удаляет товар из корзины.
getItems(): IBasketItem[] — возвращает список товаров.
calculateTotal(): void — обновляет сумму корзины.
clearBasket(): void — очищает корзину после оформления заказа.


#### Класс OrderData

Хранит данные заказа.

constructor(events: IEvents)

events: IEvents — экземпляр EventEmitter.

Поля:

_paymentMethod: string | null — способ оплаты.
_address: string | null — адрес доставки.
_email: string | null — email покупателя.
_phone: string | null — телефон покупателя.
events: IEvents — экземпляр EventEmitter.

Методы:

setPaymentMethod(method: string): void — устанавливает способ оплаты.
setAddress(address: string): void — сохраняет адрес доставки.
setContactInfo(email: string, phone: string): void — сохраняет email и телефон.
validateStepOne(): boolean — проверяет, введён ли адрес доставки.
validateStepTwo(): boolean — проверяет, заполнены ли email и телефон.


### Слой представления

#### Класс Component

Абстрактный класс Component содержит базовые методы управления DOM-элементами, которые используются во всех классах представления.

constructor(selector: string)

selector: string – CSS-селектор элемента, который будет управляться классом.

Методы:

show() - Удаляет класс hidden, делая элемент видимым.
hide() - Добавляет класс hidden, скрывая элемент.
setText(selector: string, text: string) - Устанавливает текстовое содержимое для вложенного элемента. 
    -selector: string – CSS-селектор вложенного элемента.
    -text: string – текст, который будет установлен.
toggleClass(selector: string, className: string, force?: boolean) - Переключает класс у вложенного элемента
    -selector: string – CSS-селектор вложенного элемента.
    -className: string – класс, который нужно добавить или удалить.
    -force?: boolean – если true, класс добавляется, если false – удаляется (по умолчанию переключает).
setDisabled(selector: string, disabled: boolean) - Устанавливает состояние disabled для кнопки или элемента формы.
    -selector: string – CSS-селектор кнопки или элемента формы.
    -disabled: boolean – true, если нужно отключить элемент, false, если включить.


#### Класс CatalogView

Отвечает за отображение каталога.

constructor(events: IEvents)

events: IEvents — экземпляр EventEmitter.

Методы:

renderItems(items: IItem[]): void — отображает список товаров.
openItemPreview(itemId: string): void — открывает модальное окно с товаром.

#### Класс BasketView

Управляет отображением корзины.

constructor(events: IEvents)

events: IEvents — экземпляр EventEmitter.

Методы:

renderBasket(items: IBasketItem[]): void — обновляет отображение корзины.
openBasket(): void — открывает корзину.

#### Класс OrderView

Отвечает за отображение формы оформления заказа.

constructor(events: IEvents)

container: HTMLElement — контейнер формы.
events: IEvents — экземпляр EventEmitter.

Методы:

renderStepOne(): void — отображает выбор оплаты и адреса.
renderStepTwo(): void — отображает ввод email и телефона.
showValidationError(field: string): void — показывает ошибку.
showSuccessMessage(): void — показывает сообщение об успешной оплате.

#### Класс ModalView

Отвечает за управление модальными окнами.

constructor()

Методы:

open(content: HTMLElement): void — открывает модальное окно с переданным контентом.
close(): void — закрывает модальное окно.

### Слой коммуникации

#### Класс AppApi
Принимает в конструктор экземпляр класса Api и предоставляет методы реализующие взаимодействие с бэкендом сервиса.

constructor(api: Api)

api: Api — экземпляр API-клиента.

## Взаимодействие компонентов
Код, описывающий взаимодействие представления и данных между собой находится в файле `index.ts`, выполняющем роль презентера.\
Взаимодействие осуществляется за счет событий генерируемых с помощью брокера событий и обработчиков этих событий, описанных в `index.ts`\
В `index.ts` сначала создаются экземпляры всех необходимых классов, а затем настраивается обработка событий.

*Список всех событий, которые могут генерироваться в системе:*\
*События изменения данных (генерируются классами моделями данных)*

catalog:updated – обновление каталога товаров.
basket:updated – изменение корзины (добавление/удаление товара).
order:stepChanged – переход на следующий шаг оформления заказа.


*События, возникающие при взаимодействии пользователя с интерфейсом (генерируются классами, отвечающими за представление)*
Каталог товаров

product:open – открытие карточки товара в модальном окне.

Корзина

basket:open – открытие корзины.
basket:addItem – добавление товара в корзину.
basket:removeItem – удаление товара из корзины.

Оформление заказа

order:selectPayment – выбор способа оплаты.
order:inputAddress – ввод адреса доставки.
order:validateStepOne – проверка корректности данных первого шага.
order:inputContactInfo – ввод email и телефона.
order:validateStepTwo – проверка корректности второго шага.
order:submit – отправка заказа и очистка корзины.