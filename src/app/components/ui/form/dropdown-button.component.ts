import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {ReactiveFormsModule} from "@angular/forms";
import { DropdownMenuComponent } from './dropdown-menu.component';
import { ButtonComponent } from './button.component';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';

@Component({
    selector: 'app-dropdown-button',
    imports: [
    ReactiveFormsModule,
    DropdownMenuComponent,
    ButtonComponent
],
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `
        <app-dropdown-menu [showMenu]="showDropdownMenu" offsets="top-9 -left-5" [width]="menuWidth">
            <app-button trigger
                width="flex flex-shrink justify-evenly flex-grow w-42 text-nowrap"
                [text]="buttonText"
                [icon]="showDropdownMenu ? faChevronUp : faChevronDown"
                [color]="buttonColor"
                [enabled]="enabled"
                (click)="onButtonClick()">
            </app-button>
            @if (enabled) {
                <ng-content select="[content]"></ng-content>
            }
        </app-dropdown-menu>
    `
})

// this component is just a short-hand for dropdown menus which are toggled as open/closed using a button,
// which is a common combination now.
export class DropdownButtonComponent {
    @Input({required: true}) buttonText: string = "Dropdown";
    @Input() buttonColor: string = "bg-secondary";
    @Input() enabled: boolean = true;
    @Input() menuWidth: number = 56;

    showDropdownMenu: boolean = false;

    onButtonClick() {
        console.log("onButtonClick 1");
        if (!this.enabled) return;
        this.showDropdownMenu = !this.showDropdownMenu;
        console.log("onButtonClick 2");
    }

    protected readonly faChevronDown = faChevronDown;
    protected readonly faChevronUp = faChevronUp;
}