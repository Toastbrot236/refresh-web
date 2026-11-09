import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import {PageTitleComponent} from "../../../components/ui/text/page-title.component";
import {TextboxComponent} from "../../../components/ui/form/textbox.component";
import {faPencil} from "@fortawesome/free-solid-svg-icons";
import {ReactiveFormsModule} from "@angular/forms";
import { ButtonComponent } from '../../../components/ui/form/button.component';
import { DividerComponent } from '../../../components/ui/divider.component';
import { FieldTree, form, FormField } from '@angular/forms/signals';
import { DropdownRadioButtonComponent } from '../../../components/ui/form/dropdown-radio-button-group.component';
import { ScoreTypePipe } from '../../../pipes/score-type.pipe';
import { GameVersion } from '../../../api/types/game-version';
import { RadioButtonGroupComponent } from '../../../components/ui/form/radio-button-group.component';
import { GamePipe } from '../../../pipes/game.pipe';

export interface DebugFormInput {
  scoreType: number,
  gameVersion: GameVersion,
  textBox: string
}

@Component({
    selector: 'app-form-debug',
    imports: [
    PageTitleComponent,
    TextboxComponent,
    ReactiveFormsModule,
    ButtonComponent,
    DividerComponent,
    DropdownRadioButtonComponent,
    RadioButtonGroupComponent,
    FormField
],
    providers: [
      ScoreTypePipe,
      GamePipe,
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './form-debug.component.html'
})
export class FormDebugComponent {
  inputs = signal<DebugFormInput>({
    scoreType: 4,
    gameVersion: GameVersion.LBP1,
    textBox: 'default value !!'
  });

  form: FieldTree<DebugFormInput, string | number, "writable"> = form(this.inputs, (f) => {});

  protected readonly faPencil = faPencil;
  protected readonly gameVersion = GameVersion;

  constructor(protected scoreTypePipe: ScoreTypePipe, protected gamePipe: GamePipe) {}

  submit() {
    alert("textbox input: " + this.form.textBox().value());
  }
}
