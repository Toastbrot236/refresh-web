import { Component, ChangeDetectionStrategy } from '@angular/core';
import {PageTitleComponent} from "../../../components/ui/text/page-title.component";
import {faPencil} from "@fortawesome/free-solid-svg-icons";
import {FormControl, FormGroup, ReactiveFormsModule} from "@angular/forms";

@Component({
    selector: 'app-form-debug',
    imports: [
        PageTitleComponent,
        ReactiveFormsModule
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './form-debug.component.html'
})
export class FormDebugComponent {
  form = new FormGroup({
    textbox: new FormControl()
  })

  protected readonly faPencil = faPencil;

  submit() {
    alert(this.form.controls.textbox.getRawValue());
  }
}
