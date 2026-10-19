import {Component, effect, Inject, PLATFORM_ID, signal} from '@angular/core';
import {ClientService, defaultPageSize} from "../../api/client.service";
import {ActivatedRoute} from "@angular/router";
import {PageTitleComponent} from "../../components/ui/text/page-title.component";
import {ResponsiveGridComponent} from "../../components/ui/responsive-grid.component";
import {Level} from "../../api/types/levels/level";
import {LevelPreviewComponent} from "../../components/items/level-preview.component";
import {ContainerComponent} from "../../components/ui/container.component";
import {Scrollable} from "../../helpers/scrollable";
import {defaultListInfo, RefreshApiListInfo} from "../../api/refresh-api-list-info";
import {InfiniteScrollerComponent} from "../../components/ui/infinite-scroller.component";
import { User } from '../../api/types/users/user';
import { UserLinkComponent } from "../../components/ui/text/links/user-link.component";
import { DropdownMenuComponent } from "../../components/ui/form/dropdown-menu.component";
import { ButtonComponent } from "../../components/ui/form/button.component";
import { ContainerHeaderComponent } from "../../components/ui/container-header.component";
import { BannerService } from '../../banners/banner.service';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { isPlatformBrowser } from '@angular/common';
import { RefreshApiError } from '../../api/refresh-api-error';
import { CachedListWithData } from '../../api/cached-list-with-data';
import { RadioButtonGroupComponent } from '../../components/ui/form/radio-button-group.component';
import { FieldTree, form, FormField } from '@angular/forms/signals';
import { LevelCategoryPipe } from '../../pipes/level-category.pipe';

interface FilterFormInput {
  category: string,
}

@Component({
    selector: 'app-level-user-listing',
    imports: [
    PageTitleComponent,
    ResponsiveGridComponent,
    LevelPreviewComponent,
    ContainerComponent,
    InfiniteScrollerComponent,
    UserLinkComponent,
    DropdownMenuComponent,
    ButtonComponent,
    ContainerHeaderComponent,
    RadioButtonGroupComponent,
    FormField,
    LevelCategoryPipe
],
    providers: [
      LevelCategoryPipe
    ],
    templateUrl: './level-user-listing.component.html'
})
export class LevelUserListingComponent implements Scrollable {
  user: User | undefined;
  levelsPublishedByUser: CachedListWithData<Level> | undefined;
  levelsHeartedByUser: CachedListWithData<Level> | undefined;
  currentLevels: CachedListWithData<Level> = {
    data: [],
    listInfo: defaultListInfo,
    totalLoads: 0,
  };

  showLevelDropdown: boolean = false;

  // Category names used for the API request routes, and internally to identify cache, radio buttons (ID and value) etc
  protected readonly byUserCategoryKey: string = "byUser";
  protected readonly heartedCategoryKey: string = "hearted";

  filterInputs = signal<FilterFormInput>({
    category: '',
  });

  filterForm: FieldTree<FilterFormInput, string | number, "writable"> = form(this.filterInputs);

  protected readonly isBrowser: boolean;

  constructor(private client: ClientService, protected banner: BannerService, private route: ActivatedRoute, @Inject(PLATFORM_ID) platformId: Object,
    protected categoryPipe: LevelCategoryPipe) {
    
    // listen for radio button changes
    effect(() => {
      console.log("filter form effect callback executed: lvl category " + this.filterInputs().category);
      this.getLevels();
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
              // listener above will take care of calling getLevels() when we set the signal value
              this.filterForm.category().value.set(category);
            }
          }
        });
      }
    });

    this.isBrowser = isPlatformBrowser(platformId);
  }

  levelSelectionButtonClick() {
    this.showLevelDropdown = !this.showLevelDropdown;
  }

  getLevels() {
    if (!this.user) return;
    let cachedList: CachedListWithData<Level> | undefined;

    const category: string = this.filterInputs().category;

    switch (category) {
      case this.byUserCategoryKey:
        cachedList = this.levelsPublishedByUser;
        break;

      case this.heartedCategoryKey:
        cachedList = this.levelsHeartedByUser;
        break;

      default:
        this.banner.warn("Cannot get levels", "Selected category '" + category + "' is unknown");
        return;
    }

    this.filterForm.category().value.set(category);

    if(this.isBrowser) {
      window.history.replaceState({}, '', `/levels/${category}/user/${this.user.username}`);
    }

    // If we have already cached the wanted category's results, set the current list to the cache and stop here.
    // Otherwise proceed to download the list from the server, and then cache it.
    if (cachedList != null) {
      this.currentLevels = cachedList;
      return;
    }

    this.currentLevels = {
      data: [],
      listInfo: defaultListInfo,
      totalLoads: 0,
    };
    this.currentLevels.totalLoads++;
    this.loadData();
  }

  isLoading: boolean = false;
  get listInfo() {return this.currentLevels.listInfo}

  loadData(): void {
    if(!this.user) return;

    const category: string = this.filterForm.category().value();

    this.isLoading = true;
    this.client.getLevelsInCategory(category, this.listInfo.nextPageIndex, defaultPageSize, {u: this.user.username}).subscribe({
      error: error => {
        const apiError: RefreshApiError | undefined = error.error?.error;
        this.banner.warn("Failed to get levels", apiError == null ? error.message : apiError.message);
      },
      next: list => {
        this.currentLevels.data = this.currentLevels.data.concat(list.data);
        this.currentLevels.listInfo = list.listInfo;
        this.isLoading = false;

        // Cache our results
        switch (category) {
          case this.byUserCategoryKey:
            this.levelsPublishedByUser = this.currentLevels;
            break;

          case this.heartedCategoryKey:
            this.levelsHeartedByUser = this.currentLevels;
            break;
        }
      }
    });
  }

  incrementLoads() {
    this.currentLevels.totalLoads++;
  }

  protected readonly faChevronDown = faChevronDown;
  protected readonly faChevronUp = faChevronUp;
}
