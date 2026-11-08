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
    providers: [
      LevelCategoryPipe,
      PhotoCategoryPipe,
    ],
    templateUrl: './user.component.html',
    styles: ``
})
export class UserComponent {
  user: User | undefined | null;
  relations: UserRelations | undefined;
  protected ownUser: ExtendedUser | undefined;
  protected isMobile: boolean = false;

  levelsPublishedByUser: ListWithData<Level> | undefined;
  levelsHeartedByUser: ListWithData<Level> | undefined;
  currentLevels: ListWithData<Level> = {
    data: [],
    listInfo: defaultListInfo,
  };

  showLevelDropdown: boolean = false;

  filterInputs = signal<FilterFormInput>({
    levelCategory: LevelCategoryRoute.ByUser,
    photoCategory: PhotoCategoryRoute.ByUser,
  });

  filterForm: FieldTree<FilterFormInput, string | number, "writable"> = form(this.filterInputs);

  photosByUser: ListWithData<Photo> | undefined;
  photosWithUser: ListWithData<Photo> | undefined;
  currentPhotos: ListWithData<Photo> = {
    data: [],
    listInfo: defaultListInfo,
  };

  showPhotoDropdown: boolean = false;

  constructor(private auth: AuthenticationService, private client: ClientService, route: ActivatedRoute, protected layout: LayoutService,
    protected banner: BannerService, protected levelCategoryPipe: LevelCategoryPipe, protected photoCategoryPipe: PhotoCategoryPipe
  ) {
    
    // listen for radio button changes
    effect(() => {
      console.log("filter form effect callback executed: user lvl category " + this.filterInputs().levelCategory + ", user photo cat " + this.filterInputs().photoCategory);
      this.getLevels();
      this.getPhotos();
    });

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

        // Initial load
        this.getLevels();
        this.getPhotos();
      });
    });

    this.layout.isMobile.subscribe(v => this.isMobile = v);
  }

  levelSelectionButtonClick() {
    this.showLevelDropdown = !this.showLevelDropdown;
  }

  getLevels() {
    if (this.user == null) return;
    let cachedList: ListWithData<Level> | undefined;

    const category: LevelCategoryRoute = this.filterInputs().levelCategory;

    switch (category) {
      case LevelCategoryRoute.ByUser:
        cachedList = this.levelsPublishedByUser;
        break;

      case LevelCategoryRoute.HeartedByUser:
        cachedList = this.levelsHeartedByUser;
        break;

      default:
        this.banner.warn("Cannot get levels", "Selected category '" + category + "' is unknown");
        return;
    }

    this.filterForm.levelCategory().value.set(category);

    if (cachedList != null) {
      this.currentLevels = cachedList;
      return;
    }

    this.client.getLevelsInCategory(category, 0, 5, {u: this.user.username}).subscribe({
      error: error => {
        const apiError: RefreshApiError | undefined = error.error?.error;
        this.banner.warn("Failed to get levels", apiError == null ? error.message : apiError.message);
      },
      next: levelPage => {
        // cache the page
        switch (category) {
          case LevelCategoryRoute.ByUser:
            this.levelsPublishedByUser = levelPage;
            break;
          case LevelCategoryRoute.HeartedByUser:
            this.levelsHeartedByUser = levelPage;
            break;
        }

        this.currentLevels = levelPage;
      }
    });
  }

  photoSelectionButtonClick() {
    this.showPhotoDropdown = !this.showPhotoDropdown;
  }

  getPhotos() {
    if (this.user == null) return;
    let cachedList: ListWithData<Photo> | undefined;

    const category: PhotoCategoryRoute = this.filterInputs().photoCategory;

    switch (category) {
      case PhotoCategoryRoute.ByUser:
        cachedList = this.photosByUser;
        break;
      case PhotoCategoryRoute.WithUser:
        cachedList = this.photosWithUser;
        break;
      default:
        this.banner.warn("Cannot get photos", "Selected category '" + category + "' is unknown");
        return;
    }
    this.filterForm.photoCategory().value.set(category);

    if (cachedList != null) {
      this.currentPhotos = cachedList;
      return;
    }

    // TODO consider whether 2 is enough or not, depending on how wide the user's window is, the photos will automatically scale
    // in a way where 2 photos will cause the photo panel to be either longer or shorter than the level panel
    this.client.getPhotosRelatedToUserUuid(this.user.userId, category, 0, 2).subscribe({
      error: error => {
        const apiError: RefreshApiError | undefined = error.error?.error;
        this.banner.warn("Failed to get photos with user", apiError == null ? error.message : apiError.message);
      },
      next: photoPage => {
        // cache the page
        switch (category) {
          case PhotoCategoryRoute.ByUser:
            this.photosByUser = this.currentPhotos;
            break;

          case PhotoCategoryRoute.WithUser:
            this.photosWithUser = this.currentPhotos;
            break;
        }

        this.currentPhotos = photoPage;
      }
    });
  }

  protected readonly levelCategoryRoutes = LevelCategoryRoute;
  protected readonly photoCategoryRoutes = PhotoCategoryRoute;
}