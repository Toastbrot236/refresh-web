import {Component, Input} from '@angular/core';
import {IconProp} from "@fortawesome/fontawesome-svg-core";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {FormGroup, ReactiveFormsModule} from "@angular/forms";
import { FieldTree, FormField } from '@angular/forms/signals';

@Component({
    selector: 'app-textarea',
    imports: [
    FaIconComponent,
    ReactiveFormsModule,
    FormField,
],
    template: `
    @if (label.length > 0) {
      <label [for]="formField.name" class="text-sm">{{label}}</label>
    }
    <div [formField]="formField" class="min-w-full flex group rounded-md px-4 py-1.5 bg-teritary focus-within:outline-2 focus-within:outline focus-within:outline-secondary-bright max-w-fit text-nowrap transition-[outline]">
      <div class="flex flex-col align-center mr-2 gap-y-2">
        <fa-icon [icon]="icon" class="flex flex-row justify-center mt-1 text-gentle group-focus-within:text-secondary-bright transition-colors"></fa-icon>
        @if (showMaxLength == true) {
          <p>{{maxLength - formField.length}}</p>
        }
      </div>

      <textarea [formField]="formField" [id]="formField.name" [placeholder]="placeholder" [rows]="defaultRowCount"
        class="grow min-w-10 min-h-20 outline-hidden wrap-break-word bg-teritary placeholder:text-gentle placeholder:italic"></textarea>
    </div>
    `
})
export class TextAreaComponent {
  @Input() label: string = "";
  @Input() placeholder: string = this.label;
  @Input({required: true}) icon: IconProp = null!;

  @Input({required: true}) formField: FieldTree<string, string, "writable"> = null!;

  @Input() maxLength: number = 4096;
  @Input() showMaxLength: boolean = false;

  @Input() defaultRowCount: number = 4;
}
