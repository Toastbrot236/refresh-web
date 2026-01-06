import {Component, Inject, PLATFORM_ID} from '@angular/core';
import {ClientService} from "../../api/client.service";
import {ActivatedRoute} from "@angular/router";
import {SlugPipe} from "../../pipes/slug.pipe";
import { isPlatformBrowser, } from "@angular/common";
import {LayoutService} from "../../services/layout.service";
import {AuthenticationService} from "../../api/authentication.service";
import { ExtendedUser } from '../../api/types/users/extended-user';
import { faPaperPlane, faPencil } from '@fortawesome/free-solid-svg-icons';
import { BannerService } from '../../banners/banner.service';
import { RefreshApiError } from '../../api/refresh-api-error';
import { User } from '../../api/types/users/user';
import { CommentListComponent } from "../../components/items/comment-list.component";

@Component({
    selector: 'app-user-comments',
    imports: [
    CommentListComponent
],
    providers: [
        SlugPipe
    ],
    templateUrl: './user-comments.component.html'
})
export class UserCommentsComponent {
  protected profile: User | undefined | null;
  protected ownUser: ExtendedUser | undefined;
  protected readonly isBrowser: boolean;

  initialized: boolean = false;

  constructor(private client: ClientService, route: ActivatedRoute, protected layout: LayoutService, 
              private auth: AuthenticationService, @Inject(PLATFORM_ID) platformId: Object, 
              protected banner: BannerService)
  {
    this.isBrowser = isPlatformBrowser(platformId);

    route.params.subscribe(params => {
      const username: string | undefined = params['username'];
      const uuid: string | undefined = params['uuid'];

      this.client.getUserByEitherLookup(username, uuid).subscribe({
        error: error => {
          const apiError: RefreshApiError | undefined = error.error?.error;
          banner.error("Failed to load profile", apiError == null ? error.message : apiError.message);
        },

        next: response => {
          if(!this.profile && response) {
            this.profile = response;

            this.auth.user.subscribe(user => {
              if(user) {
                this.ownUser = user;
              }

              this.initialized = true;
            });
          }
        }
      });
    });
  }

  protected readonly faPencil = faPencil;
  protected readonly faPaperPlane = faPaperPlane;
}