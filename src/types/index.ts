export interface IItem { // тип карточки в модалке
  id: string;
  description: string;
  image: string;
  title: string;
  category: string;
  price: number | null;
}

export type IItemPreview = Omit<IItem, 'description'> // тип для карточки на главной странице

export interface IList {
  total: number;
  items: IItem[];
}

export interface IBasketItem { // тип для item в корзине
  id: string;
  title: string;
  price: number;
}

export interface IBasket { // тип для всех items в корзине
  items: IBasketItem[];
  total: number;
}

export interface IAddress { // тип для строки адреса
  address: string;
}

export interface IOrderForm { // тип для Формы
  email: string;
  phone: string;
}

export interface IOrder { // общая сумма заказа
  id: string;
  total: number;
}

export interface IPayment { // способ оплаты
  method: string;
}