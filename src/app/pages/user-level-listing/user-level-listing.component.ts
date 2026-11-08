import { Component, ChangeDetectionStrategy, Input, Inject, PLATFORM_ID, signal, ChangeDetectorRef } from '@angular/core';
import { User } from '../../api/types/users/user';
import { ClientService, defaultPageSize } from '../../api/client.service';
import { PhotoCategoryPipe } from '../../pipes/photo-category.pipe';
import { ActivatedRoute } from '@angular/router';
import { FieldTree, form } from '@angular/forms/signals';
import { ContainerComponent } from '../../components/ui/container.component';
import { ResponsiveGridComponent } from '../../components/ui/responsive-grid.component';
import { BannerService } from '../../banners/banner.service';
import { RefreshApiError } from '../../api/refresh-api-error';
import { EntityListComponent } from '../../components/ui/lists/entity-list.component';
import { DropdownRadioButtonComponent } from '../../components/ui/form/dropdown-radio-button-group.component';
import { UserLinkComponent } from '../../components/ui/text/links/user-link.component';
import { isPlatformBrowser } from '@angular/common';
import { ListWithData } from '../../api/list-with-data';
import { defaultListInfo } from '../../api/refresh-api-list-info';
import { LevelCategoryRoute } from '../../api/types/levels/level-category-route';
import { LevelPreviewComponent } from '../../components/items/level-preview.component';
import { Level } from '../../api/types/levels/level';
import { InfiniteScrollerComponent } from '../../components/ui/infinite-scroller.component';
import { LevelCategoryPipe } from '../../pipes/level-category.pipe';


interface FilterFormInput {
  levelCategory: LevelCategoryRoute,
}

@Component({
    selector: 'app-user-level-listing',
    imports: [
    ContainerComponent,
    ResponsiveGridComponent,
    EntityListComponent,
    DropdownRadioButtonComponent,
    UserLinkComponent,
    LevelPreviewComponent,
    InfiniteScrollerComponent
],
    templateUrl: './user-level-listing.component.html',
    providers: [
        LevelCategoryPipe
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    styles: ``
})

// This component has inputs because it's intended to also be usable as a component
// on the user info page for the levels preview.
export class UserLevelListingComponent {
    @Input() isPreview: boolean = false;
    user: User = null!;

    filterInputs = signal<FilterFormInput>({
        levelCategory: LevelCategoryRoute.ByUser,
    });

    filterForm: FieldTree<FilterFormInput, string | number, "writable"> = form(this.filterInputs);

    currentList: ListWithData<Level> = {
        data: [],
        listInfo: defaultListInfo,
    };

    isLoading: boolean = true;
    protected readonly isBrowser: boolean;

    constructor(protected client: ClientService, protected categoryPipe: LevelCategoryPipe,
        protected banner: BannerService, private route: ActivatedRoute, @Inject(PLATFORM_ID) platformId: Object,
        protected cd: ChangeDetectorRef
    ) {
        route.params.subscribe(params => {
            const username: string | undefined = params['username'];
            const category: string | undefined = params['levelCategory'];

            if (username != null) {
                this.client.getUserByUsername(username).subscribe({
                    error: error => {
                        // TODO show on component instead of in a banner
                        const apiError: RefreshApiError | undefined = error.error?.error;
                        this.banner.warn("Failed to get user", apiError == null ? error.message : apiError.message);
                    },
                    next: user => {
                        this.user = user;

                        if (category != null) {
                            switch (category) {
                                case LevelCategoryRoute.ByUser:
                                    this.filterForm.levelCategory().value.set(LevelCategoryRoute.ByUser);
                                    break;
                                case LevelCategoryRoute.HeartedByUser:
                                    this.filterForm.levelCategory().value.set(LevelCategoryRoute.HeartedByUser);
                                    break;
                                default:
                                    // default to byUser
                                    this.filterForm.levelCategory().value.set(LevelCategoryRoute.ByUser);
                                    break;
                            }
                        }
                    }
                });
            }
        });

        this.isBrowser = isPlatformBrowser(platformId);
    }

    ngOnInit() {
        this.loadNextPage();
    }

    loadNextPage() {
        if (!this.user) return;
        this.isLoading = true;

        const category: LevelCategoryRoute = this.filterInputs().levelCategory;

        let count: number = this.isPreview ? 5 : defaultPageSize;
        let skip: number = this.isPreview ? 0 : this.currentList.listInfo.nextPageIndex;
        
        // TODO re-implement caching, but in ClientService instead to make it easier to manage + more effective
        this.client.getLevelsInCategory(category, skip, count, {u: this.user.username}).subscribe({
            error: error => {
                // TODO show on component instead of in a banner
                const apiError: RefreshApiError | undefined = error.error?.error;
                this.banner.warn("Failed to get photos with user", apiError == null ? error.message : apiError.message);
                this.isLoading = false;
            },
            next: nextPage => {
                this.currentList.data = this.currentList.data.concat(nextPage.data);
                this.currentList.listInfo = nextPage.listInfo;
                this.isLoading = false;
            }
        });
    }

    protected readonly levelCategoryRoutes = LevelCategoryRoute;
}
