import {Component, Input} from '@angular/core';
import { NgIf } from "@angular/common";

@Component({
    selector: 'app-dropdown-menu',
    imports: [
        NgIf
    ],
    template: `
        <div class="absolute z-1 flex flex-col gap-y-1.5 w-48 px-5 py-2.5 left-10 rounded bg-header-background
            border-8 border-backdrop border-solid top-10" *ngIf="showMenu">
            <ng-content></ng-content>
        </div>
    `
})
export class DropdownMenuComponent {
    @Input({required: true}) showMenu: boolean = false;
}
