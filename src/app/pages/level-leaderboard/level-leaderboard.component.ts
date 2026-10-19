import {Component, effect, Inject, PLATFORM_ID, signal} from '@angular/core';
import {Level} from "../../api/types/levels/level";
import {ClientService, defaultPageSize} from "../../api/client.service";
import {ActivatedRoute, Router} from "@angular/router";
import { isPlatformBrowser } from "@angular/common";
import {LayoutService} from "../../services/layout.service";
import {AuthenticationService} from "../../api/authentication.service";
import { ExtendedUser } from '../../api/types/users/extended-user';
import { UserRoles } from '../../api/types/users/user-roles';
import { PageTitleComponent } from "../../components/ui/text/page-title.component";
import { ButtonComponent } from "../../components/ui/form/button.component";
import { faChevronDown, faChevronUp, faTrash, faUser, faUsers } from '@fortawesome/free-solid-svg-icons';
import { BannerService } from '../../banners/banner.service';
import { RefreshApiError } from '../../api/refresh-api-error';
import { DropdownMenuComponent } from "../../components/ui/form/dropdown-menu.component";
import { SlugPipe } from '../../pipes/slug.pipe';
import { Score } from '../../api/types/levels/score';
import { ScoreTypePipe } from '../../pipes/score-type.pipe';
import { defaultListInfo, RefreshApiListInfo } from '../../api/refresh-api-list-info';
import { InfiniteScrollerComponent } from "../../components/ui/infinite-scroller.component";
import { ScorePreviewComponent } from "../../components/items/score-preview.component";
import { LevelLinkComponent } from "../../components/ui/text/links/level-link.component";
import { ContainerHeaderComponent } from "../../components/ui/container-header.component";
import { LevelType } from '../../api/types/levels/level-type';
import { ListWithData } from '../../api/list-with-data';
import { FieldTree, form, FormField } from '@angular/forms/signals';
import { RadioButtonGroupComponent } from '../../components/ui/form/radio-button-group.component';

interface FilterFormInput {
  scoreType: number,
}

@Component({
    selector: 'app-level-leaderboard',
    imports: [
    PageTitleComponent,
    ButtonComponent,
    DropdownMenuComponent,
    InfiniteScrollerComponent,
    ScorePreviewComponent,
    ScoreTypePipe,
    LevelLinkComponent,
    ContainerHeaderComponent,
    RadioButtonGroupComponent,
    FormField
],
    providers: [
        SlugPipe,
        ScoreTypePipe
    ],
    templateUrl: './level-leaderboard.component.html'
})
export class LevelLeaderboardComponent {
  level: Level | undefined | null;
  // TODO: probably rethink this way of caching once we start using more filters (showAll etc)
  scoresPerType: Map<number, ListWithData<Score>> = new Map();
  currentScores: Score[] = []; // current view of the scores
  listInfo: RefreshApiListInfo = defaultListInfo;
  isLoading: boolean = false;
  
  //private queryParams: Params = {};
  protected mayDeleteScores: boolean = false;
  
  protected readonly isBrowser: boolean;
  protected ownUser: ExtendedUser | undefined;

  filterInputs = signal<FilterFormInput>({
    scoreType: 1,
  });

  filterForm: FieldTree<FilterFormInput, string | number, "writable"> = form(this.filterInputs);
  showFilterMenu: boolean = false;

  constructor(private client: ClientService, protected banner: BannerService, route: ActivatedRoute, 
              protected layout: LayoutService, private auth: AuthenticationService,
              @Inject(PLATFORM_ID) platformId: Object, private router: Router, private slug: SlugPipe, protected scoreTypePipe: ScoreTypePipe)
  {
    this.isBrowser = isPlatformBrowser(platformId);
    
    // listen for radio button changes
    effect(() => {
      console.log("lvl scores filter form effect callback executed: score tpe " + this.filterInputs().scoreType);
      this.getScores();
    });

    route.params.subscribe(params => {
      const id: number = +params['id'];
      this.client.getLevelById(id).subscribe({
        error: error => {
          const apiError: RefreshApiError | undefined = error.error?.error;
          this.banner.warn("Failed to get level", apiError == null ? error.message : apiError.message);
        },

        next: response => {
          if (response) {
            this.level = response;
            // Type doesn't matter for cutscenes, so just show scores from all player modes by default
            this.filterForm.scoreType().value.set(response.levelType === LevelType.Cutscene ? 0 : 1);

            this.auth.user.subscribe(user => {
              if (user) {
                this.ownUser = user;
                this.mayDeleteScores = user.role >= UserRoles.Moderator;
              }
            })

            if(this.isBrowser) {
              window.history.replaceState({}, '', `/level/${response.levelId}/${this.slug.transform(response.title)}/leaderboard`);
            }

            /*
            route.queryParams.subscribe((params: Params) => {
              this.queryParams = params;
            });
            */
          }
        }
      });
    });
  }

  getScores(): void {
    if(!this.level) return;

    const scoreType: number = this.filterForm.scoreType().value();
    this.isLoading = true;

    this.client.getScoresForLevel(this.level.levelId, scoreType, this.listInfo.nextPageIndex, defaultPageSize).subscribe({
      error: error => {
        this.isLoading = false;
        const apiError: RefreshApiError | undefined = error.error?.error;
        this.banner.warn("Failed to get scores", apiError == null ? error.message : apiError.message);
      },
      next: list => {
        this.isLoading = false;

        this.currentScores = this.currentScores.concat(list.data);
        this.listInfo = list.listInfo;
      }
    });
  }

  scoreTypeButtonClick() {
    this.showFilterMenu = !this.showFilterMenu;
  }

  removeScore(uuid: string) {
    // Remove from cache
    for (let [scoreType, oldList] of this.scoresPerType) {

      let newList: Score[] = [];
      for (let score of oldList.data) {
        if (score.scoreId !== uuid) newList.push(score);
      }

      oldList.listInfo.totalItems--;
      oldList.listInfo.nextPageIndex--;

      this.scoresPerType.set(scoreType, {
        listInfo: oldList.listInfo,
        data: newList,
      });
    }

    // Remove from current list
    let newCurrentList: Score[] = [];
    for (let score of this.currentScores) {
      if (score.scoreId !== uuid) newCurrentList.push(score);
    }

    this.currentScores = newCurrentList;
    this.listInfo.totalItems--;
    this.listInfo.nextPageIndex--;
  }

  protected readonly faTrash = faTrash;
  protected readonly faUser = faUser;
  protected readonly faChevronDown = faChevronDown;
  protected readonly faChevronUp = faChevronUp;
  protected readonly faUsers = faUsers;
}
