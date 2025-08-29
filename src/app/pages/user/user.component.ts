import { AfterViewInit, Component, ElementRef, ViewChild } from '@angular/core';
import {User} from "../../api/types/users/user";
import {TitleService} from "../../services/title.service";
import {ClientService} from "../../api/client.service";
import { ActivatedRoute, RouterLink } from "@angular/router";
import {DefaultPipe} from "../../pipes/default.pipe";
import { AsyncPipe } from "@angular/common";
import {UserAvatarComponent} from "../../components/ui/photos/user-avatar.component";
import {DateComponent} from "../../components/ui/info/date.component";
import {FancyHeaderComponent} from "../../components/ui/layouts/fancy-header.component";
import {LayoutService} from "../../services/layout.service";
import {UserStatusComponent} from "../../components/ui/info/user-status.component";
import {UserStatisticsComponent} from "../../components/items/user-statistics.component";
import { ContainerComponent } from "../../components/ui/container.component";
import { PaneTitleComponent } from "../../components/ui/text/pane-title.component";
import { DividerComponent } from "../../components/ui/divider.component";
import { Level } from '../../api/types/levels/level';
import { TwoPaneLayoutComponent } from "../../components/ui/layouts/two-pane-layout.component";
import { BannerService } from '../../banners/banner.service';
import { LevelPreviewComponent } from "../../components/items/level-preview.component";
import { DarkContainerComponent } from "../../components/ui/dark-container.component";
import { RefreshApiError } from '../../api/refresh-api-error';
import { FormControl, FormGroup } from '@angular/forms';
import {faChevronDown, faHeart, faUser} from "@fortawesome/free-solid-svg-icons";
import { ButtonComponent } from "../../components/ui/form/button.component";
import { userLevelOptions, userPhotoOptions } from '../../helpers/content-options';
import { DropdownMenuComponent } from "../../components/ui/dropdown-menu.component";
import { RadioButtonComponent } from "../../components/ui/form/radio-button.component";

@Component({
    selector: 'app-user',
    imports: [
    DefaultPipe,
    UserAvatarComponent,
    DateComponent,
    FancyHeaderComponent,
    AsyncPipe,
    UserStatusComponent,
    UserStatisticsComponent,
    ContainerComponent,
    PaneTitleComponent,
    RouterLink,
    DividerComponent,
    TwoPaneLayoutComponent,
    LevelPreviewComponent,
    DarkContainerComponent,
    ButtonComponent,
    DropdownMenuComponent,
    RadioButtonComponent
],
    templateUrl: './user.component.html',
    styles: ``
})
export class UserComponent implements AfterViewInit {
  user: User | undefined | null;

  publishedLevels: Level[] | undefined;
  heartedLevels: Level[] | undefined;

  publishedLevelsPlaceholderText = "No levels";
  heartedLevelsPlaceholderText = "No levels";

  showLevelOptionsMenu: boolean = false;
  showPhotoOptionsMenu: boolean = false;

  optionsForm = new FormGroup({
    levelOption: new FormControl(0),
    photoOption: new FormControl(0),
  });

  @ViewChild('levelOptionsMenu') levelOptionsMenuElement!: ElementRef;

  constructor(private title: TitleService, private client: ClientService, private route: ActivatedRoute, protected layout: LayoutService, private banner: BannerService) {
    route.params.subscribe(params => {
      const username: string | undefined = params['username'];
      const uuid: string | undefined = params['uuid'];

      this.client.getUserByEitherLookup(username, uuid).subscribe(user => {
        this.user = user;

        // Set these here incase only the uuid, not the username query param is set
        if (user) {
          this.client.getLevelsInCategory("byUser", 0, 3, {"u": user.username}).subscribe({
            error: error => {
              const apiError: RefreshApiError | undefined = error.error?.error;
              this.publishedLevelsPlaceholderText = "Failed to fetch levels: ";
              if (apiError?.statusCode == 404) this.publishedLevelsPlaceholderText += "Category not found";
              else this.publishedLevelsPlaceholderText += apiError == null ? error.message : apiError!.message;
            },
            next: list => {
              this.publishedLevels = list.data;
            }
          });

          this.client.getLevelsInCategory("hearted", 0, 3, {"u": user.username}).subscribe({
            error: error => {
              const apiError: RefreshApiError | undefined = error.error?.error;
              this.heartedLevelsPlaceholderText = "Failed to fetch levels: ";
              if (apiError?.statusCode == 404) this.heartedLevelsPlaceholderText += "Category not found";
              else this.heartedLevelsPlaceholderText += apiError == null ? error.message : apiError!.message;
            },
            next: list => {
              this.heartedLevels = list.data;
            }
          });
        }
      });
    })
  }

  ngAfterViewInit() {
    
  }

  showLevelOptions() {
    this.showLevelOptionsMenu = !this.showLevelOptionsMenu;
    //if (this.showLevelOptionsMenu == true) {
      this.levelOptionsMenuElement.nativeElement.focus();
    //}
  }

  hideLevelOptions() {
    this.banner.success("hideLevelOptions()", "");
    this.showLevelOptionsMenu = false;
  }

  setLevelsToShow(input: number) {
    this.optionsForm.controls.levelOption.setValue(input);
  }

  showPhotoOptions() {
    this.showPhotoOptionsMenu = !this.showPhotoOptionsMenu;
  }

  setPhotosToShow(input: number) {
    this.optionsForm.controls.photoOption.setValue(input);
  }

  protected readonly userLevelOptions = userLevelOptions;
  protected readonly userPhotoOptions = userPhotoOptions;

  protected readonly faChevronDown = faChevronDown;
  protected readonly faUser = faUser;
  protected readonly faHeart = faHeart;
}