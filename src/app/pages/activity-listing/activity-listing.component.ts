import { Component } from '@angular/core';
import {PageTitleComponent} from "../../components/ui/text/page-title.component";
import { Scrollable } from '../../helpers/scrollable';
import {defaultListInfo, RefreshApiListInfo} from '../../api/refresh-api-list-info';
import {ActivityPage} from "../../api/types/activity/activity-page";
import {ClientService} from "../../api/client.service";
import {EventPageComponent} from "../../components/items/event-page.component";
import { DatePipe } from "@angular/common";
import {InfiniteScrollerComponent} from "../../components/ui/infinite-scroller.component";
import {DividerComponent} from "../../components/ui/divider.component";
import {ContainerTitleComponent} from "../../components/ui/text/container-title.component";


@Component({
    selector: 'app-activity-listing',
    imports: [
    PageTitleComponent,
    EventPageComponent,
    InfiniteScrollerComponent,
    DividerComponent,
    ContainerTitleComponent,
    DatePipe
],
    templateUrl: './activity-listing.component.html'
})
export class ActivityListingComponent implements Scrollable {
    pages: ActivityPage[] = [];

    constructor(private client: ClientService) {
      this.loadData();
    }

    isLoading: boolean = false;
    listInfo: RefreshApiListInfo = defaultListInfo;

    pagesCount: number = 0;
    pageSize: number = 20;

    loadData(): void {
      this.isLoading = true;
      this.client.getActivityPage(this.listInfo.nextPageIndex, this.pageSize).subscribe(page => {
        this.isLoading = false;

        this.listInfo = {
            nextPageIndex: (this.pagesCount * this.pageSize) + page.events.length + 1,
            totalItems: -1
        };

        this.pages.push(page);
        this.pagesCount++;
      });
    }
}
