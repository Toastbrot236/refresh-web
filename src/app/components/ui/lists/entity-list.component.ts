import { Component, ChangeDetectionStrategy, Input } from '@angular/core';
import { PaneTitleComponent } from '../text/pane-title.component';
import { RouterLink } from '@angular/router';
import { PageTitleComponent } from '../text/page-title.component';
import { ContainerHeaderComponent } from '../container-header.component';
import { DividerComponent } from '../divider.component';
import { ListWithData } from '../../../api/list-with-data';

@Component({
    selector: 'app-entity-list',
    imports: [
    PaneTitleComponent,
    RouterLink,
    PageTitleComponent,
    ContainerHeaderComponent,
    DividerComponent,
],
    template: `
      <!-- Preview header (title + filters) -->
      @if (isPreview) {
        <div class="flex flex-row flex-grow flex-wrap justify-between gap-x-2 gap-y-1">
          <app-pane-title>
            <a [routerLink]="fullPageRouterLink">
                {{ title }}
            </a>
            @if (entityList.listInfo.totalItems >= 0) {
              <span class="content-center text-sm italic text-gentle text-base">({{entityList.listInfo.totalItems}} in total)</span>
            }
          </app-pane-title>
          <ng-content select="[toTheRightOfTitlePreview]" />
        </div>
        
        <ng-content select="[belowTitlePreview]" />
        <app-divider />
      }

      <!-- Full page header (title + filters) -->
      @else {
        <app-container-header>
          <div class="flex flex-col gap-y-2 pb-4">
            <div class="flex flex-row flex-wrap gap-x-3 align-center">
              <app-page-title [title]="!preferRouterTitleIfPage ? title : undefined" />

              <ng-content select="[toTheRightOfTitleFull]" />

              @if (entityList.listInfo.totalItems >= 0) {
                <span class="content-center text-sm italic text-gentle text-base">({{entityList.listInfo.totalItems}} in total)</span>
              }
            </div>

            <ng-content select="[belowTitleFull]" />
          </div>
        </app-container-header>
      }

      <!-- Content -->
      <!-- If there is an error, then show the element(s) that specify the error -->
      @if (errorOccurred) {
        <ng-content select="[errorContent]" />
      }

      <!-- Only build the list nodes if there are actually items in the list -->
      @else if (entityList.data.length > 0) {
        <ng-content select="[listingContent]" />
      }

      <!-- If totalItems is still -1, it's still uninitialized, because the list hasn't been downloaded yet -->
      @else if (entityList.listInfo.totalItems === 0) {
        <ng-content select="[noItemsContent]" />
      }

      <!-- If totalItems is above -1 (list is initialized), but we have 0 items in page, then we received an empty list -->
      @else {
        <ng-content select="[loadingContent]" />
      }
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    styles: ``
})
export class EntityListComponent {
  @Input({required: true}) title: string = "Some kind of list";
  @Input() preferRouterTitleIfPage: boolean = false;
  @Input({required: true}) fullPageRouterLink: string = "/404";
  @Input({required: true}) isPreview: boolean = false;

  @Input({required: true}) entityList: ListWithData<any> = null!;
  @Input() errorOccurred: boolean = false;
}
