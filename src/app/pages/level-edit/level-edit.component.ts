import {Component, effect, Inject, PLATFORM_ID, signal} from '@angular/core';
import {Level} from "../../api/types/levels/level";
import {ClientService} from "../../api/client.service";
import {ActivatedRoute, Router} from "@angular/router";
import { AsyncPipe, isPlatformBrowser, NgClass, NgIf } from "@angular/common";
import {LevelAvatarComponent} from "../../components/ui/photos/level-avatar.component";
import {GamePipe} from "../../pipes/game.pipe";
import {LayoutService} from "../../services/layout.service";
import {DividerComponent} from "../../components/ui/divider.component";
import {AuthenticationService} from "../../api/authentication.service";
import { ExtendedUser } from '../../api/types/users/extended-user';
import { UserRoles } from '../../api/types/users/user-roles';
import { PageTitleComponent } from "../../components/ui/text/page-title.component";
import { ButtonComponent } from "../../components/ui/form/button.component";
import { faCertificate, faChevronDown, faChevronUp, faClone, faFloppyDisk, faPencil, faSignOutAlt, faTrash, faUser } from '@fortawesome/free-solid-svg-icons';
import { TextboxComponent } from '../../components/ui/form/textbox.component';
import { FormControl, FormGroup } from '@angular/forms';
import { LevelUpdateRequest } from '../../api/types/levels/level-update-request';
import { BannerService } from '../../banners/banner.service';
import { RefreshApiError } from '../../api/refresh-api-error';
import { sha1Async } from '../../helpers/crypto';
import { CheckboxComponent } from "../../components/ui/form/checkbox.component";
import { GameVersion } from '../../api/types/game-version';
import { FaIconComponent } from "@fortawesome/angular-fontawesome";
import { TextAreaComponent } from "../../components/ui/form/textarea.component";
import { DateComponent } from "../../components/ui/info/date.component";
import { DropdownMenuComponent } from "../../components/ui/form/dropdown-menu.component";
import { SlugPipe } from '../../pipes/slug.pipe';
import { DialogComponent } from "../../components/ui/dialog.component";
import { FieldTree, form, required, FormField } from '@angular/forms/signals';
import { RadioButtonGroupComponent } from '../../components/ui/form/radio-button-group.component';

interface MetadataFormInput {
  name: string,
  description: string,
};

// TODO since we already allow users to set reupload data of their own levels via attributes
// in the level name/description, we should also allow them to set it graphically here aswell.
interface LevelCuratorFormInput {
  isTeamPicked: boolean,
  gameVersion: GameVersion,
  isReupload: boolean,
  originalPublisher: string,
};

@Component({
    selector: 'app-level-edit',
    imports: [
    LevelAvatarComponent,
    AsyncPipe,
    DividerComponent,
    PageTitleComponent,
    ButtonComponent,
    TextboxComponent,
    NgIf,
    CheckboxComponent,
    FaIconComponent,
    GamePipe,
    TextAreaComponent,
    DateComponent,
    DropdownMenuComponent,
    DialogComponent,
    RadioButtonGroupComponent,
    FormField
],
    providers: [
        SlugPipe
    ],
    templateUrl: './level-edit.component.html'
})
export class LevelEditComponent {
  level: Level | undefined | null;
  
  protected readonly isBrowser: boolean;
  protected isMobile: boolean = false;
  protected ownUser: ExtendedUser | undefined;

  metadataInputs = signal<MetadataFormInput>({
    name: '',
    description: '',
  });

  metadataForm: FieldTree<MetadataFormInput, string | number, "writable"> = form(this.metadataInputs, (f) => {
    required(f.name, { message: 'Enter a name for your level' });
  });

  curatorInputs = signal<LevelCuratorFormInput>({
    isTeamPicked: false,
    gameVersion: GameVersion.LBP1,
    isReupload: false,
    originalPublisher: "",
  });

  curatorForm: FieldTree<LevelCuratorFormInput, string | number, "writable"> = form(this.curatorInputs, (f) => {
    required(f.gameVersion, { message: 'This level needs a valid game version' });
  });

  hasAnyPendingChanges: boolean = false;
  hasPendingMetadataChanges: boolean = false;
  hasPendingCuratorChanges: boolean = false;
  // team pick status is updated with a separate API request, so track it separately
  hasTeamPickedChanged: boolean = false;

  showDeletionPrompt: boolean = false;
  showGameMenu: boolean = false;
  gameButtonColor: string = "bg-secondary";

  isUserCurator: boolean = false;
  isUserModerator: boolean = false;
  isUserPublisher: boolean = false;

  gameMap: Map<GameVersion, string> = new Map<GameVersion, string>();

  constructor(private client: ClientService, protected banner: BannerService, route: ActivatedRoute, 
              protected layout: LayoutService, private auth: AuthenticationService,
              @Inject(PLATFORM_ID) platformId: Object, private router: Router, private slug: SlugPipe, private game: GamePipe)
  {
    this.isBrowser = isPlatformBrowser(platformId);

    // listen for radio button changes
    effect(() => {
      console.log("level edit form effect callbaclk executed: gaversion " + this.curatorInputs().gameVersion);
      this.setGameButtonColor(this.curatorInputs().gameVersion);
    });

    // init games selectable via dropdown, so we could pass it to the radio button group
    this.gameMap.set(GameVersion.LBP1, this.game.transform(GameVersion.LBP1, false));
    this.gameMap.set(GameVersion.LBP2, this.game.transform(GameVersion.LBP2, false));
    this.gameMap.set(GameVersion.LBP3, this.game.transform(GameVersion.LBP3, false));
    this.gameMap.set(GameVersion.LBPVita, this.game.transform(GameVersion.LBPVita, false));
    this.gameMap.set(GameVersion.LBPPSP, this.game.transform(GameVersion.LBPPSP, false));
    // no website, since that's not an actual game version of a level
    this.gameMap.set(GameVersion.BetaBuild, this.game.transform(GameVersion.BetaBuild, false));

    route.params.subscribe(params => {
      const id: number = +params['id'];
      this.client.getLevelById(id).subscribe(data => {
        if(!this.level && data) {
          this.level = data;
          this.updateInputs(data);

          if(this.isBrowser) {
            window.history.replaceState({}, '', `/level/${data.levelId}/${this.slug.transform(data.title)}/edit`);
          }

          this.auth.user.subscribe(user => {
            if(user) {
              this.ownUser = user;
              this.isUserPublisher = data.publisher != null && user.userId == data.publisher?.userId;
              this.isUserCurator = user.role >= UserRoles.Curator;
              this.isUserModerator = user.role >= UserRoles.Moderator;
            }
          });
        }
      });
    });

    this.layout.isMobile.subscribe(v => this.isMobile = v);
  }

  setGameButtonColor(game: GameVersion) {
    switch (game) {
      case 0: this.gameButtonColor = "bg-dark-pink"; break;
      case 1: this.gameButtonColor = "bg-dark-green"; break;
      case 2: this.gameButtonColor = "bg-orange"; break;
      case 3: this.gameButtonColor = "bg-purple"; break;
      case 4: this.gameButtonColor = "bg-light-blue"; break;
      case 6: this.gameButtonColor = "bg-blue"; break;
      default: this.gameButtonColor = "bg-tertiary"; break;
    }
  }

  updateInputs(level: Level) {
    this.hasAnyPendingChanges = false;
    this.hasPendingMetadataChanges = false;
    this.hasPendingCuratorChanges = false;

    this.metadataForm.name().value.set(level.title);
    this.metadataForm.description().value.set(level.description);

    this.curatorForm.gameVersion().value.set(level.gameVersion);
    this.curatorForm.isTeamPicked().value.set(level.teamPicked);
    this.curatorForm.isReupload().value.set(level.isReUpload);
    // Can't set to null, but we can still use isReupload to determine whether this needs any updating
    this.curatorForm.originalPublisher().value.set(level.originalPublisher ?? "");

    this.setGameButtonColor(level.gameVersion);
  }

  async gameButtonClick() {
    this.showGameMenu = !this.showGameMenu;
  }

  uploadChanges() {
    if (!this.hasAnyPendingChanges) return;

    if (this.hasTeamPickedChanged) this.updateTeamPick();
    if (this.hasPendingMetadataChanges) this.updateLevel();
    this.hasAnyPendingChanges = false;
  }

  updateTeamPick() {
    if (this.curatorForm.isTeamPicked().value()) {
      this.client.teamPickLevel(this.level!.levelId).subscribe({
        error: error => {
          const apiError: RefreshApiError | undefined = error.error?.error;
          this.banner.error("Failed to team pick level", apiError == null ? error.message : apiError.message);
        },
        next: response => {
          this.hasTeamPickedChanged = false;
          this.level!.teamPicked = true;
          this.level!.dateTeamPicked = new Date();
          this.banner.success("Level team picked!", "The level was successfully team picked.");
        }
      });
    }
    else {
      this.client.unTeamPickLevel(this.level!.levelId).subscribe({
        error: error => {
          const apiError: RefreshApiError | undefined = error.error?.error;
          this.banner.error("Failed to remove team pick", apiError == null ? error.message : apiError.message);
        },
        next: response => {
          this.hasTeamPickedChanged = false;
          this.level!.teamPicked = false;
          this.banner.success("Team pick removed!", "The level is no longer team picked.");
        }
      });
    }
  }

  updateLevel() {
    let request: LevelUpdateRequest = {
      title: this.metadataForm.name().value(),
      description: this.metadataForm.description().value(),

      gameVersion: this.curatorForm.gameVersion().value(),
      isReUpload: this.curatorForm.isReupload().value(),
      originalPublisher: this.curatorForm.originalPublisher().value(),
    };

    // Only make an admin request if the curator has either changed any curator options on the level, 
    // or this is another user's level. This way they may still edit the metadata of their own level
    // without having that be counted as moderation action.
    this.client.updateLevelById(this.level!.levelId, request, this.hasPendingCuratorChanges || !this.isUserPublisher).subscribe({
      error: error => {
        const apiError: RefreshApiError | undefined = error.error?.error;
        this.banner.error("Failed to update the level", apiError == null ? error.message : apiError.message);
      },
      next: response => {
        this.banner.success("Level updated!", "The level was successfully updated.");

        // Update level data
        this.level = response;
        this.updateInputs(response);
      }
    });
  }

  async uploadIcon($event: any) {
    const file: File = $event.target.files[0];
    console.log(file);

    const data: ArrayBuffer = await file.arrayBuffer();
    const hash: string = await sha1Async(data);

    this.client.uploadAsset(hash, data).subscribe({
      error: error => {
        const apiError: RefreshApiError | undefined = error.error?.error;
        this.banner.warn("Failed to upload new icon", apiError == null ? error.message : apiError.message);
      },
      next: _ => {
        this.updateLevelIcon(hash);
      }
    });
  }

  updateLevelIcon(hash: string) {
    this.client.updateLevelIconById(this.level!.levelId, hash, !this.isUserPublisher).subscribe({
      error: error => {
        const apiError: RefreshApiError | undefined = error.error?.error;
        this.banner.error("Failed to update the level icon", apiError == null ? error.message : apiError.message);
      },
      next: response => {
        this.banner.success("Level updated!", "The level icon was successfully updated.");

        // Update level data
        this.level = response;
      }
    });
  }

  avatarErr(img: EventTarget | null): void {
    if(!(img instanceof HTMLImageElement)) return;
    img.srcset = "/assets/missingLevel.svg";
  }

  async deleteButtonClick() {
    this.showDeletionPrompt = !this.showDeletionPrompt;
  }

  async closeDeleteDialog() {
    this.showDeletionPrompt = false;
  }

  delete() {
    if (this.level == undefined) return;

    this.client.deleteLevelById(this.level.levelId, !this.isUserPublisher).subscribe({
      error: error => {
        const apiError: RefreshApiError | undefined = error.error?.error;
        this.banner.error("Failed to delete the level", apiError == null ? error.message : apiError.message);
      },
      next: response => {
        this.banner.success("Level deleted!", "The level was successfully deleted.");

        // Navigate (TODO: redirect to page before the details page, or atleast last viewed level category)
        this.router.navigate(['/levels']);
      }
    });
  }

  protected readonly faFloppyDisk = faFloppyDisk;
  protected readonly faPencil = faPencil;
  protected readonly faTrash = faTrash;
  protected readonly faUser = faUser;
  protected readonly faCertificate = faCertificate;
  protected readonly faClone = faClone;
  protected readonly faChevronDown = faChevronDown;
  protected readonly faChevronUp = faChevronUp;
  protected readonly faSignOutAlt = faSignOutAlt;
}
