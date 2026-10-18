import {Component, Input} from '@angular/core';
import {ReactiveFormsModule} from "@angular/forms";

@Component({
    selector: 'app-radio-button',
    imports: [
    ReactiveFormsModule,
],
    template: `
        <div class="cursor-pointer min-w-full flex flex-row content-center justify-start rounded-md px-2 py-1 hover-within:outline-2 hover-within:outline hover-within:outline-secondary-bright max-w-fit transition-[outline]">
            <input type="radio" [id]="name + value" [name]="name" [value]="value" class="cursor-pointer outline-hidden bg-teritary placeholder:text-gentle placeholder:italic">
            
            @if (label.length > 0) {
                <label [for]="name + value" class="text-base hyphens-manual ml-3 cursor-pointer">{{label}}</label>
            }
        </div>
    `
})

// No FormField on purpose, because this is meant to be used together with other RadioButtonComponents in a
// RadioButtonGroupComponent (or anything similar), which implements FormValueControl<number>
export class RadioButtonComponent {
  @Input({required: true}) label: string = "";

  // name should be the group name (unique across the final page),
  // and value should be a unique value for this button, unique only in this group,
  // so name + value gets us an ID which is unique across the whole final page for this one button.
  @Input({required: true}) name: string = "";
  @Input({required: true}) value: number | string = 0;
}
