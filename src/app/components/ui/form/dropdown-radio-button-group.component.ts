import {Component, Input, PipeTransform} from '@angular/core';
import {ReactiveFormsModule} from "@angular/forms";
import { DropdownMenuComponent } from './dropdown-menu.component';
import { ButtonComponent } from './button.component';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { DropdownButtonComponent } from './dropdown-button.component';
import { RadioButtonGroupComponent } from './radio-button-group.component';
import { FieldTree, FormField } from '@angular/forms/signals';

@Component({
    selector: 'app-dropdown-radio-button-group',
    imports: [
    ReactiveFormsModule,
    DropdownButtonComponent,
    RadioButtonGroupComponent,
    FormField
],
    template: `
        <app-dropdown-button [buttonText]="textPipe?.transform(radioFormField().value()) ?? radioFormField().value()"
            [buttonColor]="buttonColor" [enabled]="enabled" [menuWidth]="menuWidth">

            <app-radio-button-group [groupName]="groupName" [buttonValues]="buttonValues" [textPipe]="textPipe"
                [formField]="radioFormField" />
        </app-dropdown-button>
    `
})
// this component is just a short-hand for dropdown buttons whose dropdown menu contains a radio button group generated using a pipe,
// which is a common combination now.
export class DropdownRadioButtonComponent {
    // inputs for dropdown button
    @Input() buttonColor: string = "bg-secondary";
    @Input() enabled: boolean = true;
    @Input() menuWidth: number = 56;

    // inputs for radio group
    @Input({required: true}) groupName: string = "";
    @Input({required: true}) buttonValues: string[] | number[] = [];
    @Input() textPipe: PipeTransform | undefined;

    @Input({required: true}) radioFormField: FieldTree<string | number, string, "writable"> = null!;

    protected readonly faChevronDown = faChevronDown;
    protected readonly faChevronUp = faChevronUp;
}