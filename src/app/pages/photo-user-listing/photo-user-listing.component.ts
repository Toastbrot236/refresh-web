import {Component, effect, Inject, PLATFORM_ID, signal} from '@angular/core';
import {ClientService, defaultPageSize} from "../../api/client.service";
import {ActivatedRoute} from "@angular/router";
import {PageTitleComponent} from "../../components/ui/text/page-title.component";
import {ResponsiveGridComponent} from "../../components/ui/responsive-grid.component";
import {ContainerComponent} from "../../components/ui/container.component";
import {Scrollable} from "../../helpers/scrollable";
import {defaultListInfo} from "../../api/refresh-api-list-info";
import {InfiniteScrollerComponent} from "../../components/ui/infinite-scroller.component";
import { User } from '../../api/types/users/user';
import { UserLinkComponent } from "../../components/ui/text/links/user-link.component";
import { DropdownMenuComponent } from "../../components/ui/form/dropdown-menu.component";
import { ButtonComponent } from "../../components/ui/form/button.component";
import { ContainerHeaderComponent } from "../../components/ui/container-header.component";
import { BannerService } from '../../banners/banner.service';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { Photo } from '../../api/types/photos/photo';
import { PhotoComponent } from "../../components/items/photo.component";
import { isPlatformBrowser } from '@angular/common';
import { RefreshApiError } from '../../api/refresh-api-error';
import { CachedListWithData } from '../../api/cached-list-with-data';
import { RadioButtonGroupComponent } from '../../components/ui/form/radio-button-group.component';
import { FieldTree, form, FormField } from '@angular/forms/signals';
import { PhotoCategoryPipe } from '../../pipes/photo-category.pipe';

interface FilterFormInput {
  category: string,
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
    RadioButtonGroupComponent,
    FormField,
    PhotoCategoryPipe,
],
    providers: [
      PhotoCategoryPipe,
    ],
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

  // Category names used for the API request routes, and internally to identify cache, radio buttons (ID and value) etc
  protected readonly byUserCategoryKey: string = "by";
  protected readonly withUserCategoryKey: string = "with";

  filterInputs = signal<FilterFormInput>({
    category: this.byUserCategoryKey,
  });

  filterForm: FieldTree<FilterFormInput, string | number, "writable"> = form(this.filterInputs);

  protected readonly isBrowser: boolean;

  constructor(private client: ClientService, protected banner: BannerService, private route: ActivatedRoute, @Inject(PLATFORM_ID) platformId: Object,
    protected categoryPipe: PhotoCategoryPipe) {
    
    // listen for radio button changes
    effect(() => {
      console.log("filter form effect callback executed: lvl category " + this.filterInputs().category);
      this.getPhotos();
    });
    
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
              // listener above will take care of calling getPhotos() when we set the signal value
              this.filterForm.category().value.set(category);
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

  getPhotos() {
    if (!this.user) return;
    let cachedList: CachedListWithData<Photo> | undefined;

    const category: string = this.filterInputs().category;

    switch (category) {
      case this.byUserCategoryKey:
        cachedList = this.photosByUser;
        break;
      case this.withUserCategoryKey:
        cachedList = this.photosWithUser;
        break;
      default:
        this.banner.warn("Cannot get photos", "Selected category '" + category + "' is unknown");
        return;
    }

    this.filterForm.category().value.set(category);

    if(this.isBrowser) {
      window.history.replaceState({}, '', `/photos/${category}/user/${this.user.username}`);
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

    const category: string = this.filterForm.category().value();

    this.isLoading = true;
    this.client.getPhotosRelatedToUserUuid(this.user.userId, category, this.currentPhotos.listInfo.nextPageIndex, defaultPageSize).subscribe({
      error: error => {
        const apiError: RefreshApiError | undefined = error.error?.error;
        this.banner.warn("Failed to get photos", apiError == null ? error.message : apiError.message);
      },
      next: list => {
        this.currentPhotos.data = this.currentPhotos.data.concat(list.data);
        this.currentPhotos.listInfo = list.listInfo;
        this.isLoading = false;

        // Cache our results
        switch (category) {
          case this.byUserCategoryKey:
            this.photosByUser = this.currentPhotos;
            break;

          case this.withUserCategoryKey:
            this.photosWithUser = this.currentPhotos;
            break;
        }
      }
    });
  }

  incrementLoads() {
    this.currentPhotos.totalLoads++;
  }

  protected readonly faChevronDown = faChevronDown;
  protected readonly faChevronUp = faChevronUp;
}
