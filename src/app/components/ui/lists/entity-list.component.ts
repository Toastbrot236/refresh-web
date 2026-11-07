import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { PaneTitleComponent } from '../text/pane-title.component';
import { RouterLink } from '@angular/router';
import { PageTitleComponent } from '../text/page-title.component';
import { ContainerHeaderComponent } from '../container-header.component';
import { DividerComponent } from '../divider.component';

@Component({
    selector: 'app-entity-list',
    imports: [
    PaneTitleComponent,
    RouterLink,
    PageTitleComponent,
    ContainerHeaderComponent,
    DividerComponent
],
    template: `
      @if (initialized) {
        <!-- Preview header (title + filters) -->
        @if (isPreview) {
          <div class="flex flex-row flex-grow flex-wrap justify-between gap-x-2 gap-y-1">
            <app-pane-title>
              <a [routerLink]="fullPageRouterLink">
                  {{ title }}
              </a>
              @if (totalItemsCount) {
                <span class="text-sm italic text-gentle text-base">({{totalItemsCount}} in total)</span>
              }
            </app-pane-title>
            <ng-content select="[toTheRightOfTitle]" />
          </div>
          
          <ng-content select="[belowTitle]" />
          <app-divider />
        }

        <!-- Full page header (title + filters) -->
        @else {
          <app-container-header>
            <div class="flex flex-col gap-y-2 pb-4">
              <div class="flex flex-row flex-wrap gap-x-3 align-center">
                <app-page-title [title]="!preferRouterTitleIfPage ? title : undefined" />

                <ng-content select="[toTheRightOfTitle]" />

                @if (totalItemsCount) {
                  <span class="text-sm italic text-gentle text-base">({{totalItemsCount}} in total)</span>
                }
              </div>

            <ng-content select="[belowTitle]" />
            </div>
          </app-container-header>
        }

        <!-- Content -->
        @if (errorOccurred) {
          <ng-content select="[errorContent]" />
        }
        @else if (pageLength > 0) {
          <ng-content select="[listingContent]" />
        }
        @else if ((totalItemsCount ?? 0) < 0) {
          <ng-content select="[loadingContent]" />
        }
        @else {
          <ng-content select="[noItemsContent]" />
        }
      }
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    styles: ``
})
export class EntityListComponent {
  @Input({required: true}) title: string = "Some kind of list";
  @Input() preferRouterTitleIfPage: boolean = true;
  @Input({required: true}) fullPageRouterLink: string = "/404";
  @Input({required: true}) isPreview: boolean = false;

  @Input() totalItemsCount: number | undefined;
  @Input({required: true}) pageLength: number = -1;
  @Input() errorOccurred: boolean = false;

  initialized: boolean = false;

  ngOnInit() {
    this.initialized = true;
  }
}
