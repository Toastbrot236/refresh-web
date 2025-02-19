import {Component, Input} from '@angular/core';
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {IconProp} from "@fortawesome/fontawesome-svg-core";
import { NgClass } from "@angular/common";

@Component({
  selector: 'app-button-link',
  standalone: true,
  imports: [
    FaIconComponent,
    NgClass
  ],
  template: `
    <a [href]="routerLink" 
      class="flex flex-row justify-center rounded px-4 py-1.5 hover:brightness-110 active:brightness-95 transition-[filter]" 
      [ngClass]="color">

      @if (icon) {
        <fa-icon [icon]="icon" class="mr-1"></fa-icon>
      }

      {{ text }}
    </a>
  `
})
export class ButtonLinkComponent {
  // metadata
  @Input({required: true}) text: string = "Button";
  @Input() icon: IconProp | undefined;
  @Input() color: string = "bg-secondary";

  // actions
  @Input() routerLink: string | null | undefined
}
