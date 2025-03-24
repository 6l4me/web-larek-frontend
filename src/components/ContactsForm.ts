import { Form, IFormState } from './common/Form';
import { EventEmitter } from './base/events';
import { ensureElement } from '../utils/utils';

export interface IContactsFormData {
    email: string;
    phone: string;
}

export class ContactsForm extends Form {
    private _emailInput: HTMLInputElement;
    private _phoneInput: HTMLInputElement;

    constructor(container: HTMLFormElement, events: EventEmitter) {
        super(container, events);
        
        this._emailInput = ensureElement<HTMLInputElement>('input[name="email"]', this._form);
        this._phoneInput = ensureElement<HTMLInputElement>('input[name="phone"]', this._form);
        
        this._emailInput.addEventListener('input', () => this.validateForm());
        this._phoneInput.addEventListener('input', () => this.validateForm());
    }

    protected validateForm(): IFormState {
        const email = this._emailInput.value.trim();
        const phone = this._phoneInput.value.trim();
        
        const errors: string[] = [];
        if (!email) {
            errors.push('Введите email');
        }
        if (!phone) {
            errors.push('Введите телефон');
        }

        const valid = errors.length === 0;
        this.setDisabled(!valid);
        
        return { valid, errors };
    }

    protected handleSubmit() {
        const state = this.validateForm();
        if (state.valid) {
            const formData: IContactsFormData = {
                email: this._emailInput.value.trim(),
                phone: this._phoneInput.value.trim()
            };
            
            this.events.emit('contacts:submit', formData);
        }
    }
}