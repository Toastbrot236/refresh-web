import {
    ChangeDetectorRef,
    Component,
    inject,
    Inject,
    NgZone,
    OnDestroy,
    PLATFORM_ID
} from '@angular/core';
import {ContainerComponent} from "../../components/ui/container.component";

import {DividerComponent} from "../../components/ui/divider.component";
import {Instance} from "../../api/types/instance";
import {ClientService} from "../../api/client.service";

import {RouterLink} from "@angular/router";
import { isPlatformBrowser, SlicePipe } from "@angular/common";

import {SectionTitleComponent} from "../../components/ui/text/section-title.component";
import {FaIconComponent} from "@fortawesome/angular-fontawesome";
import {faFireAlt, faGamepad} from "@fortawesome/free-solid-svg-icons";
import {AnnouncementComponent} from "../../components/items/announcement.component";
import {Room} from "../../api/types/rooms/room";
import {RoomComponent} from "../../components/items/room.component";
import {RouterLinkComponent} from "../../components/ui/text/links/router-link.component";
import {AsideLayoutComponent} from "../../components/ui/layouts/aside-layout.component";

import {ActivityPage} from "../../api/types/activity/activity-page";
import {EventPageComponent} from "../../components/items/event-page.component";
import {repeat, Subscription} from "rxjs";
import {ContestBannerComponent} from "../../components/items/contest-banner.component";

@Component({
    selector: 'app-landing',
    imports: [
    ContainerComponent,
    DividerComponent,
    RouterLink,
    SectionTitleComponent,
    FaIconComponent,
    AnnouncementComponent,
    RoomComponent,
    SlicePipe,
    RouterLinkComponent,
    AsideLayoutComponent,
    EventPageComponent,
    ContestBannerComponent
],
    templateUrl: './landing.component.html'
})
export class LandingComponent implements OnDestroy {
    protected instance: Instance | undefined;
    protected rooms: Room[] | undefined;
    protected activity: ActivityPage | undefined;

    private activitySubscription: Subscription | undefined;
    private roomsSubscription: Subscription | undefined;

    constructor(private client: ClientService, @Inject(PLATFORM_ID) platformId: Object, changeDetector: ChangeDetectorRef) {
      client.getInstance().subscribe(data => this.instance = data);

      if(isPlatformBrowser(platformId)) {
          inject(NgZone).runOutsideAngular(() => {
              this.activitySubscription = this.fetchActivity()
                  .pipe(repeat({delay: 5000}))
                  .subscribe(data => {
                      this.activity = data;
                      changeDetector.detectChanges();
                  });

              this.roomsSubscription = this.fetchRooms()
                  .pipe(repeat({delay: 15000}))
                  .subscribe(data => {
                      this.rooms = data.data;
                      changeDetector.detectChanges();
                  });
          })
      }

      this.fetchActivity().subscribe(data => this.activity = data);
      this.fetchRooms().subscribe(data => this.rooms = data.data);
    }

    ngOnDestroy(): void {
        this.activitySubscription?.unsubscribe();
        this.roomsSubscription?.unsubscribe();
    }

    playerCount(): number {
        if(!this.rooms) return -1;
        let players: number = 0;

        for (let room of this.rooms) {
            players += room.playerIds.length;
        }

        return players;
    }

    fetchActivity() {
        return this.client.getActivityPage(0, 5);
    }

    fetchRooms() {
        return this.client.getRoomListing();
    }

    protected readonly faFireAlt = faFireAlt;
    protected readonly faGamepad = faGamepad;
}
