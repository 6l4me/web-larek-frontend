import { EventEmitter } from "../base/events";
import { ensureElement } from "../../utils/utils";

export interface IFormState {
    valid: boolean;
    errors: string[];
}

export class Form {
    protected _submit: HTMLButtonElement;
    protected _form: HTMLFormElement;
    protected events: EventEmitter;

    constructor(container: HTMLFormElement, events: EventEmitter) {
        this._form = container;
        this._submit = ensureElement<HTMLButtonElement>('button[type="submit"]', this._form);
        this.events = events;

        this._form.addEventListener('submit', (e: Event) => {
            e.preventDefault();
            this.handleSubmit();
        });
    }

    protected handleSubmit() {
        // Переопределяется в дочерних классах
    }

    protected setDisabled(disabled: boolean) {
        this._submit.disabled = disabled;
    }

    protected setError(error: string) {
        const errorContainer = this._form.querySelector('.form__errors');
        if (errorContainer) {
            errorContainer.textContent = error;
        }
    }

    protected clearError() {
        this.setError('');
    }

    protected validateForm(): IFormState {
        // Переопределяется в дочерних классах
        return {
            valid: true,
            errors: []
        };
    }
}