import { Component, ChangeDetectionStrategy, Input, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FieldTree } from '@angular/forms/signals';
import { isPlatformBrowser } from '@angular/common';
import { Observer } from 'rxjs';
import { SlugPipe } from '../../../pipes/slug.pipe';
import { BannerService } from '../../../banners/banner.service';
import { ClientService, defaultPageSize } from '../../../api/client.service';
import { Level } from '../../../api/types/levels/level';
import { ListWithData } from '../../../api/list-with-data';
import { defaultListInfo } from '../../../api/refresh-api-list-info';
import { RefreshApiError } from '../../../api/refresh-api-error';
import { UserLevelFormInput } from '../../../forms/user-level-form-input';
import { User } from '../../../api/types/users/user';
import { LevelCategoryRoute } from '../../../api/types/levels/level-category-route';
import { LevelPreviewComponent } from '../../items/level-preview.component';
import { ContainerComponent } from '../container.component';
import { ResponsiveGridComponent } from '../responsive-grid.component';
import { InfiniteScrollerComponent } from '../infinite-scroller.component';
import { EntityListComponent } from './entity-list.component';

@Component({
    selector: 'app-user-level-list',
    imports: [
        LevelPreviewComponent,
        ContainerComponent,
        ResponsiveGridComponent,
        InfiniteScrollerComponent,
        EntityListComponent,
],
    template: `
        <app-entity-list [list]="currentList" [errorMessage]="errorMessage">
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

                <app-infinite-scroller [totalLoads]="totalLoads" [isLoading]="this.isLoading" [listInfo]="this.currentList.listInfo" (loadData)="loadNextPage()" />
            }
        </app-entity-list>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    styles: ``
})

// Takes the formField and overwrites its options with defaults or query params, emits the current ListWithData
export class UserLevelListComponent {
    currentList: ListWithData<Level> = {
        data: [],
        listInfo: defaultListInfo,
    };

    @Input({required: true}) form: FieldTree<UserLevelFormInput, string | number, "writable"> = null!;
    @Input() currentListEmitter: Observer<ListWithData<Level>> | undefined;
    @Input({required: true}) user: User = null!;
    @Input({required: true}) isPreview: boolean = null!;

    errorMessage: string | undefined;

    isLoading: boolean = true;
    totalLoads: number = 0;
    protected readonly isBrowser: boolean;

    constructor(protected client: ClientService, protected cd: ChangeDetectorRef,
        protected banner: BannerService, private route: ActivatedRoute, @Inject(PLATFORM_ID) platformId: Object,
    ) {
        this.isBrowser = isPlatformBrowser(platformId);
    }

    ngOnInit() {
        // not in constructor because we want isPreview to be set to the parent's value, for our first page request
        this.initData();
    }

    initData() {
        this.route.queryParams.subscribe({
            next: query => {
                const category: string | undefined = query['levelCategory'];

                if (category != null) {
                    switch (category) {
                        case LevelCategoryRoute.ByUser:
                            this.form.levelCategory().value.set(LevelCategoryRoute.ByUser);
                            break;
                        case LevelCategoryRoute.HeartedByUser:
                            this.form.levelCategory().value.set(LevelCategoryRoute.HeartedByUser);
                            break;
                        default:
                            // default to byUser
                            this.form.levelCategory().value.set(LevelCategoryRoute.ByUser);
                            break;
                    }
                }

                // Manually load the first page (not only needed for preview for some reason).
                // Have to manually increment total loads for this though, so the infinite scroller doesn't download the same page again.
                this.loadNextPage();
                this.totalLoads++;
            }
        });
    }

    loadNextPage() {
        if (!this.user) return;
        this.isLoading = true;

        const category: LevelCategoryRoute = this.form.levelCategory().value();

        let count: number = this.isPreview ? 5 : defaultPageSize;
        let skip: number = this.isPreview ? 0 : this.currentList.listInfo.nextPageIndex;
        
        // TODO re-implement caching, but in ClientService instead to make it easier to manage + more effective
        this.client.getLevelsInCategory(category, skip, count, {u: this.user.username}).subscribe({
            error: error => {
                // TODO show on component instead of in a banner
                const apiError: RefreshApiError | undefined = error.error?.error;
                this.errorMessage = apiError == null ? error.message : apiError.message;
                
                this.isLoading = false;
                this.cd.detectChanges();
            },
            next: nextPage => {
                this.currentList.data = this.currentList.data.concat(nextPage.data);
                this.currentList.listInfo = nextPage.listInfo;
                
                this.isLoading = false;
                this.cd.detectChanges();
            }
        });
    }
}
