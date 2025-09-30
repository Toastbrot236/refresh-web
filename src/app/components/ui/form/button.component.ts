import {Component, Input} from '@angular/core';
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {IconProp} from "@fortawesome/fontawesome-svg-core";
import { NgClass } from "@angular/common";

@Component({
    selector: 'app-button',
    imports: [
        FaIconComponent,
        NgClass
    ],
    template: `
    <button class="rounded cursor-pointer hover:brightness-110 active:brightness-95 transition-[filter] disabled:grayscale" 
      [ngClass]="color + ' px-' + xPadding + ' py-' + yPadding" [type]=type [disabled]="!enabled">
      @if (icon) {
        <fa-icon [icon]="icon" [ngClass]="text && text.length > 0 ? 'mr-1' : ''"></fa-icon>
      }
      {{ text }}
    </button>
    `
})
export class ButtonComponent {
  // metadata
  @Input({required: true}) text: string = "Button";
  @Input() icon: IconProp | undefined;
  @Input() color: string = "bg-secondary";

  @Input() type: "submit" | "reset" | "button" = "button";

  @Input() enabled: boolean = true;

  @Input() xPadding: string = "4";
  @Input() yPadding: string = "1.5";

  // actions
  @Input() routerLink: any[] | string | null | undefined
}
