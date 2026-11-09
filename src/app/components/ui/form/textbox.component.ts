import {Component, Input, ChangeDetectionStrategy} from '@angular/core';
import {IconProp} from "@fortawesome/fontawesome-svg-core";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {ReactiveFormsModule} from "@angular/forms";
import { FieldTree, FormField } from '@angular/forms/signals';


@Component({
    selector: 'app-textbox',
    imports: [
    FaIconComponent,
    ReactiveFormsModule,
    FormField,
],
    changeDetection: ChangeDetectionStrategy.Eager,
    template: `
    @if (label.length > 0) {
      <label [for]="formField.name" class="text-sm">{{label}}</label>
    }

    <div class="min-w-full flex group rounded-full px-4 py-1.5 bg-teritary focus-within:outline-2 
      focus-within:outline focus-within:outline-secondary-bright max-w-fit text-nowrap transition-[outline]">

      <fa-icon [icon]="icon" class="text-gentle mr-2 group-focus-within:text-secondary-bright transition-colors"/>

      <input [formField]="formField" [type]="type" [id]="formField.name" [placeholder]="placeholder" class="grow outline-hidden 
        bg-teritary placeholder:text-gentle placeholder:italic">

      @if (showMaxLength == true) {
        <p>{{maxLength - formField.length}}</p>
      }
    </div>
    `
})
export class TextboxComponent {
  @Input() label: string = "";
  @Input() placeholder: string = this.label;
  @Input({required: true}) icon: IconProp = null!;

  @Input({required: true}) formField: FieldTree<string, string, "writable"> = null!;
  @Input() type: string = "text";

  @Input() maxLength: number = 256;
  @Input() showMaxLength: boolean = false;
}
