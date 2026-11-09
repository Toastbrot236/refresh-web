import { Component, ChangeDetectionStrategy, Input, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FieldTree } from '@angular/forms/signals';
import { isPlatformBrowser } from '@angular/common';
import { Observer } from 'rxjs';
import { ScoreTypePipe } from '../../../pipes/score-type.pipe';
import { SlugPipe } from '../../../pipes/slug.pipe';
import { BannerService } from '../../../banners/banner.service';
import { ClientService, defaultPageSize } from '../../../api/client.service';
import { Score } from '../../../api/types/levels/score';
import { ScorePreviewComponent } from '../../items/score-preview.component';
import { DividerComponent } from '../divider.component';
import { Level } from '../../../api/types/levels/level';
import { ListWithData } from '../../../api/list-with-data';
import { defaultListInfo } from '../../../api/refresh-api-list-info';
import { LevelType } from '../../../api/types/levels/level-type';
import { RefreshApiError } from '../../../api/refresh-api-error';
import { LevelLeaderboardFormInput } from '../../../forms/level-leaderboard-form-input';
import { EntityListComponent } from './entity-list.component';

@Component({
    selector: 'app-level-leaderboard-list',
    imports: [
    ScorePreviewComponent,
    DividerComponent,
    EntityListComponent,
],
    providers: [
        SlugPipe,
        ScoreTypePipe
    ],
    template: `
        <app-entity-list [list]="currentList" [errorMessage]="errorMessage">
            @for (score of currentList.data; track score.scoreId) {
                <div class="py-1.5">
                    <app-score-preview [score]="score" (deleted)="removeScore(score.scoreId)" />
                    @if (!isPreview) {
                        <app-divider />
                    }
                </div>
            }
        </app-entity-list>
    `,
    changeDetection: ChangeDetectionStrategy.Eager,
    styles: ``
})

// Takes the formField and overwrites its options with defaults or query params, emits the current ListWithData
export class LevelLeaderboardListComponent {
    currentList: ListWithData<Score> = {
        data: [],
        listInfo: defaultListInfo,
    };

    @Input({required: true}) form: FieldTree<LevelLeaderboardFormInput, string | number, "writable"> = null!;
    @Input() currentListEmitter: Observer<ListWithData<Score>> | undefined;
    @Input({required: true}) level: Level = null!;
    @Input({required: true}) isPreview: boolean = null!;

    errorMessage: string | undefined;
    isLoading: boolean = true;
    totalLoads: number = 0;
    protected readonly isBrowser: boolean;

    constructor(protected client: ClientService,
        protected banner: BannerService, private route: ActivatedRoute, @Inject(PLATFORM_ID) platformId: Object,
        protected scoreTypePipe: ScoreTypePipe, protected cd: ChangeDetectorRef
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
                let scoreType: number | undefined = query['scoreType'];

                // fall back to 1 if invalid
                if (scoreType && (scoreType < 0 || scoreType > 4)) {
                    scoreType = 1;
                }
                // not specified in query params? set to default (usually 1 for 1-player-mode, but default to 0
                // for cutscene levels, since player-mode doesn't matter there).
                else if (!scoreType) {
                    scoreType = this.level.levelType === LevelType.Cutscene ? 0 : 1;
                }

                this.form.scoreType().value.set(scoreType);

                // Manually load the first page (not only needed for preview for some reason).
                // Have to manually increment total loads for this though, so the infinite scroller doesn't download the same page again.
                this.loadNextPage();
                this.totalLoads++;
            }
        });
    }

    loadNextPage() {
        if (!this.level) return;

        const scoreType: number = this.form.scoreType().value();
        let count: number = this.isPreview ? 10 : defaultPageSize;
        let skip: number = this.isPreview ? 0 : this.currentList.listInfo.nextPageIndex;
        this.isLoading = true;
        
        // TODO re-implement caching, but in ClientService instead to make it easier to manage + more effective
        this.client.getScoresForLevel(this.level.levelId, scoreType, skip, count).subscribe({
            error: error => {
                // TODO show on component instead of in a banner
                const apiError: RefreshApiError | undefined = error.error?.error;
                this.errorMessage = apiError == null ? error.message : apiError.message;
                
                this.isLoading = false;
                this.cd.detectChanges();
            },
            next: photoPage => {
                this.currentList.data = this.currentList.data.concat(photoPage.data);
                this.currentList.listInfo = photoPage.listInfo;
                if (this.currentListEmitter) {
                    this.currentListEmitter.next(this.currentList);
                }

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
}
