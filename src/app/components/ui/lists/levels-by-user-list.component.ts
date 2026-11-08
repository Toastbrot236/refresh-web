import { Component, ChangeDetectionStrategy, Input, Inject, PLATFORM_ID, signal } from '@angular/core';
import { User } from '../../../api/types/users/user';
import { ClientService, defaultPageSize } from '../../../api/client.service';
import { PhotoCategoryPipe } from '../../../pipes/photo-category.pipe';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FieldTree, form } from '@angular/forms/signals';
import { ContainerComponent } from '../container.component';
import { ResponsiveGridComponent } from '../responsive-grid.component';
import { BannerService } from '../../../banners/banner.service';
import { RefreshApiError } from '../../../api/refresh-api-error';
import { EntityListComponent } from './entity-list.component';
import { DropdownRadioButtonComponent } from '../form/dropdown-radio-button-group.component';
import { UserLinkComponent } from '../text/links/user-link.component';
import { isPlatformBrowser } from '@angular/common';
import { ListWithData } from '../../../api/list-with-data';
import { defaultListInfo } from '../../../api/refresh-api-list-info';
import { LevelCategoryRoute } from '../../../api/types/levels/level-category-route';
import { LevelPreviewComponent } from '../../items/level-preview.component';
import { Level } from '../../../api/types/levels/level';
import { InfiniteScrollerComponent } from '../infinite-scroller.component';


interface FilterFormInput {
  levelCategory: LevelCategoryRoute,
}

@Component({
    selector: 'app-levels-by-user-list',
    imports: [
    ContainerComponent,
    ResponsiveGridComponent,
    EntityListComponent,
    DropdownRadioButtonComponent,
    UserLinkComponent,
    LevelPreviewComponent,
    InfiniteScrollerComponent
],
    template: `
        <app-entity-list title="Levels" [fullPageRouterLink]="'/levels/' + filterForm.levelCategory().value() + '/user/' + user.username"
            [isPreview]="isPreview" [entityList]="currentList">

            <ng-container toTheRightOfTitle class="flex flex-row flex-grow flex-wrap justify-between gap-x-2 gap-y-1">
                <app-dropdown-radio-button-group groupName="levelCategories" [buttonValues]="[
                        levelCategoryRoutes.ByUser,
                        levelCategoryRoutes.HeartedByUser,
                    ]" [textPipe]="categoryPipe" [radioFormField]="filterForm.levelCategory">
                </app-dropdown-radio-button-group>
            
                @if (!isPreview) {
                    <app-user-link class="content-center text-[20px]" [user]="user" />
                }
            </ng-container>

            <ng-container loadingContent>
                <p>Loading levels...</p>
            </ng-container>

            <ng-container noItemsContent>
                <p>No levels found! Try changing your filters...</p>
            </ng-container>

            <ng-container errorContent>
                <p>An error occurred, but we won't tell why, because it'S not implemented yet!</p>
            </ng-container>

            <ng-container listingContent>
                @if (isPreview) {
                    @for (level of currentList.data; track level.levelId) {
                        <div class="py-1.5">
                            <app-level-preview [level]="level" />
                        </div>
                    }
                }
                @else {
                    <app-responsive-grid>
                        @for (level of this.currentList.data; track level.levelId) {
                            <app-container [tight]="true">
                                <app-level-preview [level]="level" />
                            </app-container>
                        }
                    </app-responsive-grid>

                    <app-infinite-scroller [isLoading]="this.isLoading" [listInfo]="this.currentList.listInfo" (loadData)="loadNextPage()" />
                }
            </ng-container>
        </app-entity-list>
    `,
    providers: [
        PhotoCategoryPipe
    ],
    changeDetection: ChangeDetectionStrategy.Eager,
    styles: ``
})

export class PhotosByUserListComponent {
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

    isLoading: boolean = false;
    protected readonly isBrowser: boolean;

    constructor(protected client: ClientService, protected categoryPipe: PhotoCategoryPipe,
        protected banner: BannerService, private route: ActivatedRoute, @Inject(PLATFORM_ID) platformId: Object
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

    loadNextPage() {
        if (!this.user) return;

        const category: LevelCategoryRoute = this.filterInputs().levelCategory;

        let count: number = this.isPreview ? 5 : defaultPageSize;
        let skip: number = this.isPreview ? 0 : this.currentList.listInfo.nextPageIndex;
        
        // TODO re-implement caching, but in ClientService instead to make it easier to manage + more effective
        this.client.getLevelsInCategory(category, skip, count, {u: this.user.username}).subscribe({
            error: error => {
                // TODO show on component instead of in a banner
                const apiError: RefreshApiError | undefined = error.error?.error;
                this.banner.warn("Failed to get photos with user", apiError == null ? error.message : apiError.message);
            },
            next: nextPage => {
                this.currentList.data = this.currentList.data.concat(nextPage.data);
                this.currentList.listInfo = nextPage.listInfo;
            }
        });
    }

    protected readonly levelCategoryRoutes = LevelCategoryRoute;
}
