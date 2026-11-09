import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { ContainerComponent } from './container.component';
import { PaneTitleComponent } from './text/pane-title.component';
import { FaIconComponent } from '@fortawesome/angular-fontawesome';
import { DividerComponent } from './divider.component';

@Component({
    selector: 'app-preview-panel',
    imports: [ContainerComponent, PaneTitleComponent, FaIconComponent, DividerComponent],
    template: `
        <app-container class="w-full">
            <div class="flex flex-row flex-grow flex-wrap justify-between gap-x-2 gap-y-1">
                <app-pane-title>
                    @if (icon) {
                        <p>{{description}}</p>
                    }
                    @if (titleRouterLink) {
                        <p><a class="text-link hover:text-link-hover hover:underline" routerLink="/users">
                            @if (icon) {
                                <fa-icon [icon]="icon" class="mr-2" />
                            }
                            {{title}}
                        </a></p>
                    }
                    @else {
                        @if (icon) {
                            <fa-icon [icon]="icon" class="mr-2" />
                        }
                        <p>{{title}}</p>
                    }

                    @if (subText) {
                        <span class="content-center text-sm italic text-gentle text-base">{{subText}}</span>
                    }
                    
                    <ng-content select="[toTheRightOfTitle]" />
                </app-pane-title>
            </div>

            @if (description) {
                <p>{{description}}</p>
            }

            <app-divider />

            <ng-content select="[content]" />
        </app-container>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    styles: ``
})

// TODO use this to dedupe more panels, like the category, statistics, and settings ones
export class PreviewPanelComponent {
    @Input({required: true}) title: string = null!;
    @Input() subText: string | undefined;
    @Input() icon: IconProp | undefined;
    @Input() titleRouterLink: string | undefined;
    @Input() description: string | undefined;
}
