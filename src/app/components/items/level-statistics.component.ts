import {Component, Input} from '@angular/core';
import {Level} from "../../api/types/levels/level";
import {faBell, faHeart, faPlay, faStar, faThumbsDown, faThumbsUp} from "@fortawesome/free-solid-svg-icons";
import {StatisticComponent} from "../ui/info/statistic.component";
import { FaIconComponent } from '@fortawesome/angular-fontawesome';

@Component({
    selector: 'app-level-statistics',
    imports: [
        StatisticComponent,
        FaIconComponent,
    ],
    template: `
    <div class="flex gap-x-1.5">
      <app-statistic [value]=level.yayRatings name="Yays" [icon]=faThumbsUp></app-statistic>
      <app-statistic [value]=level.booRatings name="Boos" [icon]=faThumbsDown></app-statistic>
      <app-statistic [value]=level.hearts name="Hearts" [icon]=faHeart [highlight]="highlightHearted"></app-statistic>
      <app-statistic [value]=level.uniquePlays name="Plays" [icon]=faPlay [highlight]="highlightPlayed"></app-statistic>
      <app-statistic [value]=level.score name="Cool Rating (CR)" [icon]=faStar [truncate]=true></app-statistic>
      @if (showQueued) {
        <fa-icon [icon]="faBell" class="text-yellow"></fa-icon>
      }
    </div>
  `
})
export class LevelStatisticsComponent {
  @Input({required: true}) level: Level = undefined!;

  protected highlightHearted: boolean = false;
  protected highlightPlayed: boolean = false;
  protected showQueued: boolean = false;

  ngOnInit(): void {
    if (this.level.ownRelations != null) {
      this.highlightHearted = this.level.ownRelations.isHearted;
      this.highlightPlayed = this.level.ownRelations.totalPlays > 0;
      this.showQueued = this.level.ownRelations.isQueued;
    }
  }

  protected readonly faThumbsUp = faThumbsUp;
  protected readonly faThumbsDown = faThumbsDown;
  protected readonly faHeart = faHeart;
  protected readonly faStar = faStar;
  protected readonly faPlay = faPlay;
  protected readonly faBell = faBell;
}
