import { ChangeDetectorRef, Component, signal } from '@angular/core';
import {User} from "../../api/types/users/user";
import {ClientService} from "../../api/client.service";
import { ActivatedRoute } from "@angular/router";
import {DefaultPipe} from "../../pipes/default.pipe";
import { AsyncPipe } from "@angular/common";
import {UserAvatarComponent} from "../../components/ui/photos/user-avatar.component";
import {DateComponent} from "../../components/ui/info/date.component";
import {FancyHeaderComponent} from "../../components/ui/layouts/fancy-header.component";
import {LayoutService} from "../../services/layout.service";
import {UserStatusComponent} from "../../components/ui/info/user-status.component";
import {UserStatisticsComponent} from "../../components/items/user-statistics.component";
import { UserRelations } from '../../api/types/users/user-relations';
import { FancyHeaderUserButtonsComponent } from "../../components/ui/layouts/fancy-header-user-buttons.component";
import { ExtendedUser } from '../../api/types/users/extended-user';
import { AuthenticationService } from '../../api/authentication.service';
import { TwoPaneLayoutComponent } from "../../components/ui/layouts/two-pane-layout.component";
import { ContainerComponent } from "../../components/ui/container.component";
import { BannerService } from '../../banners/banner.service';
import { UserRoleComponent } from "../../components/ui/info/user-role.component";
import { FieldTree, form } from '@angular/forms/signals';
import { UserLevelFormInput } from '../../forms/user-level-form-input';
import { UserPhotoFormInput } from '../../forms/user-photo-form-input';
import { PhotoCategoryRoute } from '../../api/types/photos/photo-category-route';
import { LevelCategoryRoute } from '../../api/types/levels/level-category-route';
import { UserLevelListComponent } from '../../components/ui/lists/user-level-list.component';
import { UserPhotoListComponent } from '../../components/ui/lists/user-photo-list.component';
import { LevelCategoryPipe } from '../../pipes/level-category.pipe';
import { PhotoCategoryPipe } from '../../pipes/photo-category.pipe';
import { DropdownRadioButtonComponent } from '../../components/ui/form/dropdown-radio-button-group.component';
import { PreviewPanelComponent } from '../../components/ui/preview-panel';
import { faCertificate, faImages } from '@fortawesome/free-solid-svg-icons';

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
    FancyHeaderUserButtonsComponent,
    TwoPaneLayoutComponent,
    UserRoleComponent,
    UserPhotoListComponent,
    UserLevelListComponent,
    DropdownRadioButtonComponent,
    PreviewPanelComponent
],
    providers: [
      LevelCategoryPipe,
      PhotoCategoryPipe,
    ],
    templateUrl: './user.component.html',
    styles: ``
})
export class UserComponent {
  user: User | undefined | null;
  relations: UserRelations | undefined;

  levelInputs = signal<UserLevelFormInput>({
    levelCategory: LevelCategoryRoute.ByUser
  });
  levelForm: FieldTree<UserLevelFormInput, string | number, "writable"> = form(this.levelInputs);

  photoInputs = signal<UserPhotoFormInput>({
    photoCategory: PhotoCategoryRoute.ByUser
  });
  photoForm: FieldTree<UserPhotoFormInput, string | number, "writable"> = form(this.photoInputs);

  protected ownUser: ExtendedUser | undefined;
  protected isMobile: boolean = false;

  constructor(private auth: AuthenticationService, private client: ClientService, route: ActivatedRoute, protected layout: LayoutService,
    protected banner: BannerService, protected cd: ChangeDetectorRef, protected levelCategoryPipe: LevelCategoryPipe, protected photoCategoryPipe: PhotoCategoryPipe,
  ) {

    route.params.subscribe(params => {
      const username: string | undefined = params['username'];
      const uuid: string | undefined = params['uuid'];

      this.client.getUserByEitherLookup(username, uuid).subscribe(user => {
        this.user = user;
        this.relations = user.ownRelations;
        this.cd.detectChanges();

        this.auth.user.subscribe(user => {
          if(user) {
            this.ownUser = user;
          }
        });
      });
    });

    this.layout.isMobile.subscribe(v => this.isMobile = v);
  }

  protected readonly faCertificate = faCertificate;
  protected readonly faImages = faImages;
  protected readonly levelCategoryRoutes = LevelCategoryRoute;
  protected readonly photoCategoryRoutes = PhotoCategoryRoute;
}