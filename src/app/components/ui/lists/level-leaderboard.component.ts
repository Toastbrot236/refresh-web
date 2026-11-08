import { Component, ChangeDetectionStrategy, Input, Inject, PLATFORM_ID, signal } from '@angular/core';
import { ClientService, defaultPageSize } from '../../../api/client.service';
import { PhotoCategoryPipe } from '../../../pipes/photo-category.pipe';
import { ActivatedRoute } from '@angular/router';
import { FieldTree, form } from '@angular/forms/signals';
import { PhotoCategoryRoute } from '../../../api/types/photos/photo-category-route';
import { ContainerComponent } from '../container.component';
import { ResponsiveGridComponent } from '../responsive-grid.component';
import { BannerService } from '../../../banners/banner.service';
import { RefreshApiError } from '../../../api/refresh-api-error';
import { EntityListComponent } from './entity-list.component';
import { DropdownRadioButtonComponent } from '../form/dropdown-radio-button-group.component';
import { isPlatformBrowser } from '@angular/common';
import { ListWithData } from '../../../api/list-with-data';
import { defaultListInfo } from '../../../api/refresh-api-list-info';
import { Level } from '../../../api/types/levels/level';
import { Score } from '../../../api/types/levels/score';
import { LevelType } from '../../../api/types/levels/level-type';
import { ScorePreviewComponent } from '../../items/score-preview.component';
import { SlugPipe } from '../../../pipes/slug.pipe';
import { ScoreTypePipe } from '../../../pipes/score-type.pipe';
import { LevelLinkComponent } from '../text/links/level-link.component';


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
    LevelLinkComponent
],
    providers: [
        SlugPipe,
        ScoreTypePipe
    ],
    template: `
        <app-entity-list [title]="'Leaderboard for ' + level.isAdventure ? 'adventure' : 'level'"
            [fullPageRouterLink]="'/level/' + level.levelId + '/' + (level.title | slug) + '/leaderboard'"
            [isPreview]="isPreview" [entityList]="currentList">

            <ng-container toTheRightOfTitle class="flex flex-row flex-grow flex-wrap justify-between gap-x-2 gap-y-1">
                <app-dropdown-radio-button-group groupName="scoreTypes" [buttonValues]="[
                        0, 1, 2, 3, 4
                    ]" [textPipe]="scoreTypePipe" [radioFormField]="filterForm.scoreType">
                </app-dropdown-radio-button-group>
            
                @if (!isPreview) {
                    <app-level-link class="content-center" [level]="level" />
                }
            </ng-container>

            <ng-container loadingContent>
                <p>Loading scores...</p>
            </ng-container>

            <ng-container noItemsContent>
                <p>No scores found! Try changing your filters...</p>
            </ng-container>

            <ng-container errorContent>
                <p>An error occurred, but we won't tell why, because it'S not implemented yet!</p>
            </ng-container>

            <ng-container listingContent>
                @if (isPreview) {
                    @for (score of currentList.data; track score.scoreId) {
                        <div class="py-1.5">
                            <app-score-preview [score]="score" (deleted)="removeScore(score.scoreId)" />
                        </div>
                    }
                }
                @else {
                    <app-responsive-grid>
                        @for (score of this.currentList.data; track score.scoreId) {
                            <app-container [tight]="true">
                                <app-score-preview [score]="score" (deleted)="removeScore(score.scoreId)" />
                            </app-container>
                        }
                    </app-responsive-grid>
                }
            </ng-container>
        </app-entity-list>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    styles: ``
})

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
    protected readonly isBrowser: boolean;

    constructor(protected client: ClientService, protected categoryPipe: PhotoCategoryPipe,
        protected banner: BannerService, private route: ActivatedRoute, @Inject(PLATFORM_ID) platformId: Object,
        protected slug: SlugPipe, protected scoreTypePipe: ScoreTypePipe
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

    loadNextPage() {
        if (!this.level) return;

        const scoreType: number = this.filterInputs().scoreType;

        let count: number = this.isPreview ? 2 : defaultPageSize;
        let skip: number = this.isPreview ? 0 : this.currentList.listInfo.nextPageIndex;
        
        // TODO re-implement caching, but in ClientService instead to make it easier to manage + more effective
        this.client.getScoresForLevel(this.level.levelId, scoreType, skip, count).subscribe({
            error: error => {
                // TODO show on component instead of in a banner
                const apiError: RefreshApiError | undefined = error.error?.error;
                this.banner.warn("Failed to get scores for level", apiError == null ? error.message : apiError.message);
            },
            next: photoPage => {
                this.currentList.data = this.currentList.data.concat(photoPage.data);
                this.currentList.listInfo = photoPage.listInfo;
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
    }

    protected readonly photoCategoryRoutes = PhotoCategoryRoute;
}
