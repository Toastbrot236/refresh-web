import {Component, Input} from '@angular/core';
import { NgIf } from "@angular/common";

@Component({
    selector: 'app-dropdown-menu',
    imports: [
        NgIf
    ],
    template: `
        <div class="flex flex-col gap-y-1.5 w-48 px-5 py-2.5 rounded bg-header-background
            border-8 border-backdrop border-solid" *ngIf="showMenu">
            <ng-content></ng-content>
        </div>
    `
})
export class DropdownMenuComponent {
    @Input({required: true}) showMenu: boolean = false;
}
