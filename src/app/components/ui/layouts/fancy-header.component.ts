import {Component, Input} from '@angular/core';
import {ContainerHeaderComponent} from "../container-header.component";
import {DarkContainerComponent} from "../dark-container.component";
import {DateComponent} from "../info/date.component";
import {DefaultPipe} from "../../../pipes/default.pipe";
import {PageTitleComponent} from "../text/page-title.component";
import {LevelStatisticsComponent} from "../../items/level-statistics.component";
import { AsyncPipe, NgTemplateOutlet } from "@angular/common";
import { LayoutService } from '../../../services/layout.service';

@Component({
  selector: 'app-fancy-header',
  standalone: true,
  imports: [
    ContainerHeaderComponent,
    DarkContainerComponent,
    DateComponent,
    DefaultPipe,
    PageTitleComponent,
    LevelStatisticsComponent,
    NgTemplateOutlet,
    AsyncPipe
  ],
  template: `
    <ng-template #descriptionTemplate>
      <app-dark-container>
        <p>{{ description }}</p>
      </app-dark-container>
    </ng-template>
    
    <app-container-header>
      <div class="flex gap-x-2 sm:gap-x-2.5">
        <ng-content select="[avatar]"></ng-content>
        <div class="grow content-evenly">
          <div class="flex flex-row-reverse justify-between sm:flex-col gap-x-1.5 relative">
            <div class="content-center">
              <ng-content select="[buttonArea]"></ng-content>
            </div>
            <app-page-title [title]="title" class="text-wrap [word-break:break-word] " ></app-page-title>
          </div>
          <div class="flex flex-wrap gap-x-4 place-content-between">
            <div class="">
              <span class="align-bottom text-gentle self-center sm:self-auto text-wrap">
                <ng-content select="[titleSubtext]"></ng-content>
              </span>
              <ng-content select="[belowTitle]"></ng-content>
              <ng-content select="[statistics]"></ng-content>
            </div>
          </div>
        </div>
      </div>
      <div class="my-2 py-2 px-2">
        <ng-content select="[buttonAreaMobile]"></ng-content>
      </div>
      <div class="mt-2.5">
        <ng-container *ngTemplateOutlet="descriptionTemplate"></ng-container>
      </div>
    </app-container-header>
    `
})
export class FancyHeaderComponent {
  @Input({required: true}) title: string = "";
  @Input({required: true}) description: string = "";

  constructor(protected layout: LayoutService) {}
}
