import { Component } from '../base/Component';
import { IItemPreview } from '../../types';
import { EventEmitter } from '../base/events';
import { cloneTemplate } from '../../utils/utils';
import { CatalogCard } from './CatalogCard';
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
          const card = new CatalogCard(cloneTemplate(cardTemplate), {
              onClick: () => this.events.emit('product:selected', { productId: item.id }),
              onButtonClick: () => {
                  if (this.appData.isInCart(item.id)) {
                      this.events.emit('cart:remove', { productId: item.id });
                  } else {
                      this.events.emit('cart:add', { product: item });
                  }
              }
          });

          card.render({
              title: item.title,
              image: item.image,
              price: item.price,
              status: {
                  status: item.category,
                  label: item.category
              },
              buttonText: item.price === null ? 'Бесценно' : 
                  this.appData.isInCart(item.id) ? 'Убрать' : 'Купить'
          });
          
          this.container.appendChild(card.htmlElement);
      });
  }
}
