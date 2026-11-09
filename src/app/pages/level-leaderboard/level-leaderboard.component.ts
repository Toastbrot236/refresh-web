import { Component, ChangeDetectionStrategy, Inject, PLATFORM_ID, signal, ChangeDetectorRef } from '@angular/core';
import { ClientService } from '../../api/client.service';
import { ActivatedRoute } from '@angular/router';
import { FieldTree, form } from '@angular/forms/signals';
import { BannerService } from '../../banners/banner.service';
import { RefreshApiError } from '../../api/refresh-api-error';
import { DropdownRadioButtonComponent } from '../../components/ui/form/dropdown-radio-button-group.component';
import { isPlatformBrowser } from '@angular/common';
import { Level } from '../../api/types/levels/level';
import { SlugPipe } from '../../pipes/slug.pipe';
import { ScoreTypePipe } from '../../pipes/score-type.pipe';
import { LevelLinkComponent } from '../../components/ui/text/links/level-link.component';
import { ContainerHeaderComponent } from '../../components/ui/container-header.component';
import { PageTitleComponent } from '../../components/ui/text/page-title.component';
import { LevelLeaderboardListComponent } from '../../components/ui/lists/level-leaderboard-list.component';
import { LevelLeaderboardFormInput } from '../../forms/level-leaderboard-form-input';

@Component({
    selector: 'app-level-leaderboard',
    imports: [
    DropdownRadioButtonComponent,
    LevelLinkComponent,
    ContainerHeaderComponent,
    PageTitleComponent,
    LevelLeaderboardListComponent
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
    level: Level = null!;

    inputs = signal<LevelLeaderboardFormInput>({
        scoreType: 1,
    });
    form: FieldTree<LevelLeaderboardFormInput, string | number, "writable"> = form(this.inputs);

    errorMessage: string | undefined;
    protected readonly isBrowser: boolean;

    constructor(protected client: ClientService,
        protected banner: BannerService, private route: ActivatedRoute, @Inject(PLATFORM_ID) platformId: Object,
        protected slug: SlugPipe, protected scoreTypePipe: ScoreTypePipe, protected cd: ChangeDetectorRef
    ) {
        this.isBrowser = isPlatformBrowser(platformId);

        this.route.params.subscribe(params => {
            const levelId: number = +params['id'];

            this.client.getLevelById(levelId).subscribe({
                error: error => {
                    const apiError: RefreshApiError | undefined = error.error?.error;
                    this.errorMessage = apiError == null ? error.message : apiError.message;
                    this.cd.detectChanges();
                },
                next: level => {
                    this.level = level;
                    this.cd.detectChanges();
                }
            });
        });
    }
}
