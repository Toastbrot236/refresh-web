import {Component, Input} from '@angular/core';
import {IconProp} from "@fortawesome/fontawesome-svg-core";
import { ReactiveFormsModule } from '@angular/forms';
import { NgClass } from "@angular/common";
import { FaIconComponent } from "@fortawesome/angular-fontawesome";

@Component({
    selector: 'app-outlined-button',
    imports: [
    ReactiveFormsModule,
    NgClass,
    FaIconComponent
],
    template: `
        @if (icon) {
            <button class="rounded active:brightness-95 transition-[filter] px-2 py-1.5" 
                [ngClass]="(enabled ? 'outline cursor-pointer' : '') 
                + (enabled && emphasize ? 'outline text-emphasized focus-visible:bg-emphasized/20 active:bg-emphasized/20 hover:bg-emphasized/10' : '')
                + (enabled && !emphasize ? 'text-foreground focus-visible:bg-foreground/20 active:bg-foreground/20 hover:bg-foreground/10' : '')" 
                [type]=type [disabled]="!enabled">
                @if (icon) {
                    <fa-icon [icon]="icon" [ngClass]="text && text.length > 0 ? 'mr-1' : ''"></fa-icon>
                }
                {{ text }}
            </button>
        }
    `,
    styles: ``
})

export class OutlinedButtonComponent {
    @Input({required: true}) text: string = "idk";
    @Input({required: true}) icon: IconProp = null!;
    @Input() emphasize: boolean = false;
    @Input() enabled: boolean = true;

    @Input() type: "submit" | "reset" | "button" = "button";

    // actions
    @Input() routerLink: any[] | string | null | undefined

}
