import { Component } from "../base/Component";
import { ensureElement } from "../../utils/utils";
import { IEvents } from "../base/events";

interface IModalData {
    content: HTMLElement;
}

export class Modal extends Component {
    protected _closeButton: HTMLButtonElement;
    protected _content: HTMLElement;
    protected isOpen: boolean = false; // Флаг для проверки состояния

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

        this._closeButton = ensureElement<HTMLButtonElement>('.modal__close', this.container);
        this._content = ensureElement<HTMLElement>('.modal__content', this.container);

        this._closeButton.addEventListener('click', () => this.close());
        this.container.addEventListener('click', () => this.close());
        this._content.addEventListener('click', (event) => event.stopPropagation());
    }

    set content(value: HTMLElement | null) {
        if (value) {
            this._content.replaceChildren(value);
        } else {
            this._content.innerHTML = '';
        }
    }

    setContent(value: HTMLElement): void {
        console.log('Добавляем контент в модалку:', value);
        this.content = value;
    }

    open() {
        console.log('Открываем модальное окно');
        if (this.isOpen) return; 
        this.isOpen = true;
        this.container.classList.add('modal_active');
        this.events.emit('modal:open');
    }

    close() {
        if (!this.isOpen) return; 
        this.isOpen = false;
        this.container.classList.remove('modal_active');
        this.events.emit('modal:close');
    }

    getContainer(): HTMLElement {
        return this.container;
    }
}
