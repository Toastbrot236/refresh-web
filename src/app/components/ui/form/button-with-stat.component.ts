import {Component, Input} from '@angular/core';
import {IconProp} from "@fortawesome/fontawesome-svg-core";
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from "./button.component";

@Component({
    selector: 'app-button-with-stat',
    imports: [
    ReactiveFormsModule,
    ButtonComponent
],
    template: `
        @if (icon) {
            <app-button [text]="text" [icon]="icon" [color]="'outline' + (emphasize ? ' text-yellow' : '')" [enabled]="enabled" [xPadding]="2"></app-button>
        }
    `,
    styles: ``
})

export class ButtonWithStatComponent {
    @Input({required: true}) text: string = "idk";
    @Input({required: true}) icon: IconProp = null!;
    @Input() emphasize: boolean = false;
    @Input() enabled: boolean = true;

    @Input({required: true}) form: FormGroup = null!;
    @Input({required: true}) ctrlName: string = "";
}
