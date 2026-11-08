import { Component, effect, signal } from '@angular/core';
import {User} from "../../api/types/users/user";
import {ClientService} from "../../api/client.service";
import { ActivatedRoute, RouterLink } from "@angular/router";
import {DefaultPipe} from "../../pipes/default.pipe";
import { AsyncPipe } from "@angular/common";
import {UserAvatarComponent} from "../../components/ui/photos/user-avatar.component";
import {DateComponent} from "../../components/ui/info/date.component";
import {FancyHeaderComponent} from "../../components/ui/layouts/fancy-header.component";
import {LayoutService} from "../../services/layout.service";
import {UserStatusComponent} from "../../components/ui/info/user-status.component";
import {UserStatisticsComponent} from "../../components/items/user-statistics.component";
import { UserRelations } from '../../api/types/users/user-relations';
import { FancyHeaderUserButtonsComponent } from "../../components/ui/layouts/fancy-header-user-buttons.component";
import { ExtendedUser } from '../../api/types/users/extended-user';
import { AuthenticationService } from '../../api/authentication.service';
import { TwoPaneLayoutComponent } from "../../components/ui/layouts/two-pane-layout.component";
import { ContainerComponent } from "../../components/ui/container.component";
import { Level } from '../../api/types/levels/level';
import { Photo } from '../../api/types/photos/photo';
import { BannerService } from '../../banners/banner.service';
import { RefreshApiError } from '../../api/refresh-api-error';
import { ListWithData } from '../../api/list-with-data';
import { defaultListInfo } from '../../api/refresh-api-list-info';
import { UserRoleComponent } from "../../components/ui/info/user-role.component";
import { FieldTree, form } from '@angular/forms/signals';
import { LevelCategoryPipe } from '../../pipes/level-category.pipe';
import { PhotoCategoryPipe } from '../../pipes/photo-category.pipe';
import { LevelCategoryRoute } from '../../api/types/levels/level-category-route';
import { PhotoCategoryRoute } from '../../api/types/photos/photo-category-route';
import { UserPhotoListingComponent } from '../user-photo-listing/user-photo-listing.component';
import { UserLevelListingComponent } from '../user-level-listing/user-level-listing.component';

interface FilterFormInput {
  levelCategory: LevelCategoryRoute,
  photoCategory: PhotoCategoryRoute,
}

@Component({
    selector: 'app-user',
    imports: [
    DefaultPipe,
    UserAvatarComponent,
    DateComponent,
    FancyHeaderComponent,
    AsyncPipe,
    UserStatusComponent,
    UserStatisticsComponent,
    FancyHeaderUserButtonsComponent,
    TwoPaneLayoutComponent,
    ContainerComponent,
    UserRoleComponent,
    UserPhotoListingComponent,
    UserLevelListingComponent,
],
    templateUrl: './user.component.html',
    styles: ``
})
export class UserComponent {
  user: User | undefined | null;
  relations: UserRelations | undefined;
  protected ownUser: ExtendedUser | undefined;
  protected isMobile: boolean = false;

  constructor(private auth: AuthenticationService, private client: ClientService, route: ActivatedRoute, protected layout: LayoutService,
    protected banner: BannerService
  ) {

    route.params.subscribe(params => {
      const username: string | undefined = params['username'];
      const uuid: string | undefined = params['uuid'];

      this.client.getUserByEitherLookup(username, uuid).subscribe(user => {
        this.user = user;
        this.relations = user.ownRelations;

        this.auth.user.subscribe(user => {
          if(user) {
            this.ownUser = user;
          }
        });
      });
    });

    this.layout.isMobile.subscribe(v => this.isMobile = v);
  }
}