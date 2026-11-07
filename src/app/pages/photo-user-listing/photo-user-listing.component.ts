import {Component, Inject, PLATFORM_ID, ChangeDetectionStrategy, signal} from '@angular/core';
import {ClientService, defaultPageSize} from "../../api/client.service";
import {ActivatedRoute} from "@angular/router";
import {PageTitleComponent} from "../../components/ui/text/page-title.component";
import {ResponsiveGridComponent} from "../../components/ui/responsive-grid.component";
import {ContainerComponent} from "../../components/ui/container.component";
import {Scrollable} from "../../helpers/scrollable";
import {defaultListInfo, RefreshApiListInfo} from "../../api/refresh-api-list-info";
import {InfiniteScrollerComponent} from "../../components/ui/infinite-scroller.component";
import { User } from '../../api/types/users/user';
import { UserLinkComponent } from "../../components/ui/text/links/user-link.component";
import { DropdownMenuComponent } from "../../components/ui/form/dropdown-menu.component";
import { ButtonComponent } from "../../components/ui/form/button.component";
import { ContainerHeaderComponent } from "../../components/ui/container-header.component";
import { FormControl, FormGroup } from '@angular/forms';
import { BannerService } from '../../banners/banner.service';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { Photo } from '../../api/types/photos/photo';
import { PhotoComponent } from "../../components/items/photo.component";
import { isPlatformBrowser } from '@angular/common';
import { RefreshApiError } from '../../api/refresh-api-error';
import { CachedListWithData } from '../../api/cached-list-with-data';
import { RadioButtonGroupComponent } from '../../components/ui/form/radio-button-group.component';
import { PhotoCategoryRoute } from '../../api/types/photos/photo-category-route';
import { PhotoCategoryPipe } from '../../pipes/photo-category.pipe';
import { FieldTree, form } from '@angular/forms/signals';

interface FilterFormInput {
  photoCategory: PhotoCategoryRoute,
}

@Component({
    selector: 'app-photo-user-listing',
    imports: [
    PageTitleComponent,
    ResponsiveGridComponent,
    ContainerComponent,
    InfiniteScrollerComponent,
    UserLinkComponent,
    DropdownMenuComponent,
    ButtonComponent,
    ContainerHeaderComponent,
    PhotoComponent,
    RadioButtonGroupComponent
],
    providers: [
      PhotoCategoryPipe,
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    templateUrl: './photo-user-listing.component.html'
})
export class PhotoUserListingComponent implements Scrollable {
  user: User | undefined;
  photosByUser: CachedListWithData<Photo> | undefined;
  photosWithUser: CachedListWithData<Photo> | undefined;
  currentPhotos: CachedListWithData<Photo> = {
    data: [],
    listInfo: defaultListInfo,
    totalLoads: 0,
  };

  showPhotoDropdown: boolean = false;

  filterInputs = signal<FilterFormInput>({
    photoCategory: PhotoCategoryRoute.ByUser,
  });

  filterForm: FieldTree<FilterFormInput, string | number, "writable"> = form(this.filterInputs);

  protected readonly isBrowser: boolean;

  constructor(private client: ClientService, protected banner: BannerService, private route: ActivatedRoute, @Inject(PLATFORM_ID) platformId: Object) {
    route.params.subscribe(params => {
      const username: string | undefined = params['username'];
      const category: string | undefined = params['category'];

      if (username != null) {
        this.client.getUserByUsername(username).subscribe({
          error: error => {
            const apiError: RefreshApiError | undefined = error.error?.error;
            this.banner.warn("Failed to get user", apiError == null ? error.message : apiError.message);
          },
          next: user => {
            this.user = user;

            if (category != null) {
              switch (category) {
                case "by":
                  this.setPhotoSelection(0);
                  break;
                case "with":
                  this.setPhotoSelection(1);
                  break;
                default:
                  this.banner.warn("Cannot get photos", "Selection '" + category + "' is unknown");
                  return;
              }
            }
          }
        });
      }
    });

    this.isBrowser = isPlatformBrowser(platformId);
  }

  photoSelectionButtonClick() {
    this.showPhotoDropdown = !this.showPhotoDropdown;
  }

  getPhotoSelectionText(selection: number): string {
    switch (selection) {
      case 0: return "By";
      case 1: return "With";
      default: return "Something";
    }
  }

  setPhotoSelection(selection: number) {
    if (this.user == null) return;

    let previousSelection: number = this.filterForm.controls.selection.getRawValue()!;
    if (selection === previousSelection) return;

    switch (previousSelection) {
      case 0:
        this.photosByUser = this.currentPhotos;
        break;
      case 1:
        this.photosWithUser = this.currentPhotos;
        break;
    }

    let cachedList: CachedListWithData<Photo> | undefined;
    switch (selection) {
      case 0:
        this.photoSelectionString = "by";
        cachedList = this.photosByUser;
        break;
      case 1:
        this.photoSelectionString = "with";
        cachedList = this.photosWithUser;
        break;
      default:
        this.banner.warn("Cannot get photos", "Selection " + selection + " is unknown");
        return;
    }

    this.filterForm.controls.selection.setValue(selection);
    if(this.isBrowser) {
      window.history.replaceState({}, '', `/photos/${this.photoSelectionString}/user/${this.user.username}`);
    }

    if (cachedList != null) {
      this.currentPhotos = cachedList;
      return;
    }

    this.currentPhotos = {
      data: [],
      listInfo: defaultListInfo,
      totalLoads: 0,
    };
    this.currentPhotos.totalLoads++;
    this.loadData();
  }

  isLoading: boolean = false;
  get listInfo() {return this.currentPhotos.listInfo}

  loadData(): void {
    if(!this.user) return;

    this.isLoading = true;
    this.client.getPhotosRelatedToUserUuid(this.user.userId, this.photoSelectionString, this.currentPhotos.listInfo.nextPageIndex, defaultPageSize).subscribe({
      error: error => {
        const apiError: RefreshApiError | undefined = error.error?.error;
        this.banner.warn("Failed to get photos", apiError == null ? error.message : apiError.message);
      },
      next: list => {
        this.isLoading = false;

        this.currentPhotos.data = this.currentPhotos.data.concat(list.data);
        this.currentPhotos.listInfo = list.listInfo;
      }
    });
  }

  incrementLoads() {
    this.currentPhotos.totalLoads++;
  }

  protected readonly faChevronDown = faChevronDown;
  protected readonly faChevronUp = faChevronUp;
  protected readonly photoCategoryRoutes = PhotoCategoryRoute;
}
