import { Component, ChangeDetectionStrategy, Input, Inject, PLATFORM_ID, signal, ChangeDetectorRef } from '@angular/core';
import { ClientService, defaultPageSize } from '../../api/client.service';
import { PhotoCategoryPipe } from '../../pipes/photo-category.pipe';
import { ActivatedRoute } from '@angular/router';
import { FieldTree, form } from '@angular/forms/signals';
import { PhotoCategoryRoute } from '../../api/types/photos/photo-category-route';
import { ContainerComponent } from '../../components/ui/container.component';
import { ResponsiveGridComponent } from '../../components/ui/responsive-grid.component';
import { BannerService } from '../../banners/banner.service';
import { RefreshApiError } from '../../api/refresh-api-error';
import { EntityListComponent } from '../../components/ui/lists/entity-list.component';
import { DropdownRadioButtonComponent } from '../../components/ui/form/dropdown-radio-button-group.component';
import { isPlatformBrowser } from '@angular/common';
import { ListWithData } from '../../api/list-with-data';
import { defaultListInfo } from '../../api/refresh-api-list-info';
import { Level } from '../../api/types/levels/level';
import { Score } from '../../api/types/levels/score';
import { LevelType } from '../../api/types/levels/level-type';
import { ScorePreviewComponent } from '../../components/items/score-preview.component';
import { SlugPipe } from '../../pipes/slug.pipe';
import { ScoreTypePipe } from '../../pipes/score-type.pipe';
import { LevelLinkComponent } from '../../components/ui/text/links/level-link.component';
import { InfiniteScrollerComponent } from '../../components/ui/infinite-scroller.component';

interface FilterFormInput {
  scoreType: number,
}

@Component({
    selector: 'app-level-leaderboard-list',
    imports: [
    ContainerComponent,
    ResponsiveGridComponent,
    EntityListComponent,
    DropdownRadioButtonComponent,
    ScorePreviewComponent,
    SlugPipe,
    LevelLinkComponent,
    InfiniteScrollerComponent
],
    providers: [
        SlugPipe,
        ScoreTypePipe
    ],
    templateUrl: './level-leaderboard.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    styles: ``
})

// This component has inputs because it's intended to also be usable as a component
// on the level info page for the leaderboard preview.
export class LevelLeaderboardComponent {
    @Input() isPreview: boolean = false;
    level: Level = null!;

    filterInputs = signal<FilterFormInput>({
        scoreType: 1,
    });

    filterForm: FieldTree<FilterFormInput, string | number, "writable"> = form(this.filterInputs);

    currentList: ListWithData<Score> = {
        data: [],
        listInfo: defaultListInfo,
    };

    isLoading: boolean = false;
    protected readonly isBrowser: boolean;

    constructor(protected client: ClientService,
        protected banner: BannerService, private route: ActivatedRoute, @Inject(PLATFORM_ID) platformId: Object,
        protected slug: SlugPipe, protected scoreTypePipe: ScoreTypePipe, protected cd: ChangeDetectorRef
    ) {
        route.params.subscribe(params => {
            const levelId: number = +params['id'];
            let scoreType: number | undefined = params['scoreType'];

            // TODO levels aren't cached yet, so this will lead to double reqests on previews. Cache levels in ClientService to avoid that.
            this.client.getLevelById(levelId).subscribe({
                error: error => {
                    // TODO show on component instead of in a banner
                    const apiError: RefreshApiError | undefined = error.error?.error;
                    this.banner.warn("Failed to get user", apiError == null ? error.message : apiError.message);
                },
                next: level => {
                    this.level = level;

                    // set to 1 if invalid
                    if (scoreType && (scoreType < 0 || scoreType > 4)) {
                        scoreType = 1;
                    }
                    // not specified in query params? set to default (usually 1 for 1-player-mode, but default to 0
                    // for cutscene levels, since player-mode doesn't matter there).
                    else if (!scoreType) {
                        scoreType = level.levelType == LevelType.Cutscene ? 0 : 1;
                    }

                    this.filterForm.scoreType().value.set(scoreType);
                }
            });
        });

        this.isBrowser = isPlatformBrowser(platformId);
    }

    ngOnInit() {
        if (this.isPreview) {
            this.loadNextPage();
        } 
    }

    loadNextPage() {
        if (!this.level) return;

        const scoreType: number = this.filterInputs().scoreType;

        let count: number = this.isPreview ? 10 : defaultPageSize;
        let skip: number = this.isPreview ? 0 : this.currentList.listInfo.nextPageIndex;
        this.isLoading = true;
        
        // TODO re-implement caching, but in ClientService instead to make it easier to manage + more effective
        this.client.getScoresForLevel(this.level.levelId, scoreType, skip, count).subscribe({
            error: error => {
                // TODO show on component instead of in a banner
                const apiError: RefreshApiError | undefined = error.error?.error;
                this.banner.warn("Failed to get scores for level", apiError == null ? error.message : apiError.message);
                
                this.isLoading = false;
                this.cd.detectChanges();
            },
            next: photoPage => {
                this.currentList.data = this.currentList.data.concat(photoPage.data);
                this.currentList.listInfo = photoPage.listInfo;
                
                this.isLoading = false;
                this.cd.detectChanges();
            }
        });
    }
    
    removeScore(uuid: string) {
        // Remove from current list by creating a new list, and then only copying the items
        // whose ID doesn't match the deleted one.
        let newCurrentList: Score[] = [];
        for (let score of this.currentList.data) {
            if (score.scoreId !== uuid) newCurrentList.push(score);
        }

        this.currentList.data = newCurrentList;
        this.currentList.listInfo.totalItems--;
        this.currentList.listInfo.nextPageIndex--;
        this.cd.detectChanges();
    }

    protected readonly photoCategoryRoutes = PhotoCategoryRoute;
}
