import {Component, Input, model} from '@angular/core';
import {ReactiveFormsModule} from "@angular/forms";
import { FormValueControl } from '@angular/forms/signals';
import { RadioButtonComponent } from './radio-button.component';

@Component({
    selector: 'app-radio-button-group',
    imports: [
    ReactiveFormsModule,
    RadioButtonComponent
],
    template: `
        <div class="cursor-pointer min-w-full flex flex-row content-center justify-start rounded-md px-2 py-1 hover-within:outline-2 hover-within:outline hover-within:outline-secondary-bright max-w-fit transition-[outline]">
            <!-- 0 is enum value (key), 1 is the text to be displayed to the user -->
            @for (buttonData of buttons; track buttonData[0]) {
                <app-radio-button [name]="groupName" [value]="buttonData[0]" [label]="buttonData[1]" (click)="value.set(buttonData[0])"></app-radio-button>
            }
        </div>
    `
})
// number so we can use this with enums
export class RadioButtonGroupComponent implements FormValueControl<number> {
  // gets prepended to the enum value per button, to create a unique HTML element id per button,
  // and also used as the name value for each radio button, to create a group
  @Input({required: true}) groupName: string = "";

  // maps enum value -> text to show on the button
  @Input({required: true}) buttons: Map<number, string> = new Map<number, string>();

  readonly value = model(0);
}
