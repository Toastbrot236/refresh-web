import {Component, Input} from '@angular/core';
import {IconProp} from "@fortawesome/fontawesome-svg-core";
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonComponent } from "./button.component";

@Component({
    selector: 'app-outlined-button',
    imports: [
    ReactiveFormsModule,
    ButtonComponent
],
    template: `
        @if (icon) {
            <app-button [color]="'outline' + (emphasize 
                ? ' text-yellow focus-visible:bg-yellow/20 active:bg-yellow/20 hover:bg-yellow/10' 
                : ' focus-visible:bg-foreground/20 active:bg-foreground/20 hover:bg-foreground/10')"
                [text]="text" [icon]="icon" [enabled]="enabled" xPadding="2"></app-button>
        }
    `,
    styles: ``
})

export class OutlinedButtonComponent {
    @Input({required: true}) text: string = "idk";
    @Input({required: true}) icon: IconProp = null!;
    @Input() emphasize: boolean = false;
    @Input() enabled: boolean = true;
}
