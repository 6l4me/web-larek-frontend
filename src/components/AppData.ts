import { Model } from './base/Model';
import { IItemPreview, IBasketItem, IItem } from '../types';
import { EventEmitter } from './base/events';    

export class AppData extends Model<{ catalog: IItemPreview[] }> {
    // Каталог товаров
    catalog: IItemPreview[] = [];
    private cart: IBasketItem[] = [];

    constructor(events: EventEmitter) {
        super({ catalog: [] }, events);
    }

    setCatalog(items: IItemPreview[]) {
        this.catalog = items;
        this.emitChanges('catalog:updated', { catalog: this.catalog });
    }

    getCart(): IBasketItem[] {
        return this.cart;
    }

    removeFromCart(productId: string): void {
        this.cart = this.cart.filter(item => item.id !== productId);
        this.emitChanges('cart:updated', { cart: this.cart });
    }

    isInCart(productId: string): boolean {
        return this.cart.some(item => item.id === productId);
    }

    addToCart(product: IItem): void {
        if (!this.isInCart(product.id)) {
            this.cart.push(product);
            this.emitChanges('cart:updated', { cart: this.cart });
        }
    }

    clearCart(): void {
        this.cart = [];
        this.emitChanges('cart:updated', { cart: this.cart });
    }
}
