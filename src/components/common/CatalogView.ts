import { Component } from '../base/Component';
import { IItemPreview } from '../../types';
import { EventEmitter, IEvents } from '../base/events';
import { cloneTemplate } from '../../utils/utils';
import { CatalogItem } from './CatalogItem';
import { AppData } from '../AppData';

export class CatalogView {
  private container: HTMLElement;
  private events: EventEmitter;
  private appData: AppData;

  constructor(selector: string, events: EventEmitter, appData: AppData) {
      this.container = document.querySelector(selector);
      this.events = events;
      this.appData = appData;

      // обновление корзины
      this.events.on('cart:updated', () => {
          this.render(this.appData.catalog);
      });
  }

  render(items: IItemPreview[]) {
      const cardTemplate = document.getElementById('card-catalog') as HTMLTemplateElement;
      this.container.innerHTML = '';
      
      items.forEach(item => {
          const card = new CatalogItem(cloneTemplate(cardTemplate), {
              onClick: () => this.events.emit('product:selected', { productId: item.id })
          });

          const cardElement = card.render({
              title: item.title,
              image: item.image,
              description: "",
              price: item.price,
              status: {
                  status: item.category,
                  label: item.category
              }
          });

          // Добавляем кнопку купить/убрать
          const button = cardElement.querySelector('.card__button') as HTMLButtonElement;
          if (button) {
              if (item.price === null) {
                  // Для бесценных товаров
                  button.textContent = 'Бесценно';
                  button.disabled = true;
              } else {
                  // Для обычных товаров
                  button.textContent = this.appData.isInCart(item.id) ? 'Убрать' : 'Купить';
                  button.addEventListener('click', (e) => {
                      e.stopPropagation();
                      if (this.appData.isInCart(item.id)) {
                          this.events.emit('cart:remove', { productId: item.id });
                      } else {
                          this.events.emit('cart:add', { product: item });
                      }
                  });
              }
          }
          
          this.container.appendChild(cardElement);
      });
  }
}
