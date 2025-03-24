import { Form, IFormState } from './common/Form';
import { EventEmitter } from './base/events';
import { ensureElement } from '../utils/utils';

export interface IOrderFormData {
    payment: string;
    address: string;
}

export class OrderForm extends Form {
    private _paymentButtons: NodeListOf<HTMLButtonElement>;
    private _addressInput: HTMLInputElement;

    constructor(container: HTMLFormElement, events: EventEmitter) {
        super(container, events);
        
        this._paymentButtons = container.querySelectorAll('.order__buttons button');
        this._addressInput = ensureElement<HTMLInputElement>('input[name="address"]', this._form);
        
        this._paymentButtons.forEach(button => {
            button.addEventListener('click', () => {
                this._paymentButtons.forEach(btn => btn.classList.remove('button_active'));
                button.classList.add('button_active');
                this.validateForm();
            });
        });

        this._addressInput.addEventListener('input', () => {
            this.validateForm();
        });
        
        this._addressInput.addEventListener('blur', () => {
            this.validateForm();
        });
    }

    protected validateForm(): IFormState {
        const activeButton = this._form.querySelector('.button_active');
        const address = this._addressInput.value.trim();
        
        const errors: string[] = [];
        if (!activeButton) {
            errors.push('Выберите способ оплаты');
        }
        if (!address) {
            errors.push('Введите адрес доставки');
        }

        const valid = errors.length === 0;
        this.setDisabled(!valid);
        
        return { valid, errors };
    }

    protected handleSubmit() {
        const state = this.validateForm();
        if (state.valid) {
            const method = this._form.querySelector('.button_active')?.getAttribute('name') || '';
            const address = this._addressInput.value.trim();
            
            this.events.emit('order:submit', {
                payment: { method },
                address: { address }
            });
        }
    }
}