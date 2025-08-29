import { Component, Input, TemplateRef, ViewChild, ViewContainerRef } from "@angular/core";
import { ButtonComponent } from "../form/button.component";
import {faEllipsisV} from "@fortawesome/free-solid-svg-icons";
import { DropdownMenuComponent } from "../dropdown-menu.component";

@Component({
    selector: 'app-fancy-header-buttons',
    imports: [
    ButtonComponent,
    DropdownMenuComponent
],
    template: `
        <ng-template #moreButtonTemplate>
            <app-button
                text=""
                [icon]="faEllipsisV"
                color="bg-secondary"
                (click)="moreButtonClick()"> 
            </app-button>
        </ng-template>
        
        <div class="flex flex-row justify-end content-center space-x-1 min-w-56 relative">
            <div #firstButtonContainer></div>
            <div #secondButtonContainer></div>
            <div class="absolute z-1 top-10">
                <app-dropdown-menu [showMenu]="showMenu">
                    <div #navItemsContainer></div>
                </app-dropdown-menu>
            </div>
            
        </div>
    `,
    styles: ``
})

export class FancyHeaderButtonsComponent {
    @Input({required: true}) public buttonTemplateRefs: TemplateRef<any>[] = undefined!;
    @ViewChild('moreButtonTemplate') moreButtonTemplateRef!: TemplateRef<any>;

    @ViewChild('firstButtonContainer', { read: ViewContainerRef }) firstButtonContainerRef!: ViewContainerRef;
    @ViewChild('secondButtonContainer', { read: ViewContainerRef }) secondButtonContainerRef!: ViewContainerRef;
    @ViewChild('navItemsContainer', { read: ViewContainerRef }) navItemsContainerRef!: ViewContainerRef;

    showMenu: boolean = false;

    ngAfterViewInit() {
        // place buttons (or navitems) depending on how many there are in the array
        if (this.buttonTemplateRefs.length > 0) {
            this.firstButtonContainerRef.createEmbeddedView(this.buttonTemplateRefs[0], {hasText: true, isNavItem: false});

            if (this.buttonTemplateRefs.length == 2) {
                this.secondButtonContainerRef.createEmbeddedView(this.buttonTemplateRefs[1], {hasText: false, isNavItem: false});
            }

            else if (this.buttonTemplateRefs.length > 2) {
                this.secondButtonContainerRef.createEmbeddedView(this.moreButtonTemplateRef);

                let index: number = 0;
                for (let containerRef of this.buttonTemplateRefs) {
                    if (index > 0) {
                        this.navItemsContainerRef.createEmbeddedView(containerRef, {hasText: true, isNavItem: true});
                    }
                    index++;
                }
            }
        }
    }

    async moreButtonClick() {
        this.showMenu = !this.showMenu;
    }

    protected readonly faEllipsisV = faEllipsisV;
}