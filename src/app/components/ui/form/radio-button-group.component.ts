import {Component, Input, model, PipeTransform} from '@angular/core';
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
            <!-- Use the given pipe to get the label to show to the user; if no pipe was passed, just fall back to the value, but prefix it with 'Option' for better formatting -->
            @for (buttonValue of buttonValues; track buttonValue) {
                <app-radio-button [name]="groupName" [value]="buttonValue" [label]="textPipe != null ? textPipe.transform(buttonValue) : ('Option ' + buttonValue)" (click)="value.set(buttonValue)"></app-radio-button>
            }
        </div>
    `
})
// number so we can use this with enums
export class RadioButtonGroupComponent implements FormValueControl<number | string> {
  // gets prepended to the enum value per button, to create a unique HTML element id per button,
  // and also used as the name value for each radio button, to create a group
  @Input({required: true}) groupName: string = "";

  // maps enum value -> text to show on the button
  @Input({required: true}) buttonValues: string[] | number[] = [];
  @Input() textPipe: PipeTransform | undefined;

  readonly value = model<number | string>(0);
  buttonMappings: Map<string | number, string> = new Map<string | number, string>();

}
