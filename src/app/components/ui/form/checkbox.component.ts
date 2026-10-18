import {Component, Input} from '@angular/core';
import {IconProp} from "@fortawesome/fontawesome-svg-core";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {ReactiveFormsModule} from "@angular/forms";
import { FieldTree, FormField } from '@angular/forms/signals';

@Component({
    selector: 'app-checkbox',
    imports: [
    FaIconComponent,
    ReactiveFormsModule,
    FormField
],
    template: `
        <div [formField]="formField" class="min-w-full flex flex-row content-center justify-start rounded-md px-2 py-1 hover-within:outline-2 hover-within:outline hover-within:outline-secondary-bright max-w-fit transition-[outline]">
            <input type="checkbox" [id]="formField.name" class="outline-hidden bg-teritary placeholder:text-gentle placeholder:italic">
            
            @if (label.length > 0) {
                <label [for]="formField.name" class="text-base hyphens-manual ml-3">{{label}}</label>
            }
            @if (icon != null) {
                <fa-icon [icon]="icon" class="text-gentle ml-2 group-focus-within:text-secondary-bright transition-colors"></fa-icon>
            }
        </div>
    `
})
export class CheckboxComponent {
  @Input({required: true}) label: string = "";
  @Input() icon: IconProp | undefined;

  @Input({required: true}) formField: FieldTree<boolean, string> = null!;
}
