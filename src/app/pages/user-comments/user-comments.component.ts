import {Component} from '@angular/core';
import {ClientService} from "../../api/client.service";
import {ActivatedRoute} from "@angular/router";
import {AuthenticationService} from "../../api/authentication.service";
import { ExtendedUser } from '../../api/types/users/extended-user';
import { BannerService } from '../../banners/banner.service';
import { RefreshApiError } from '../../api/refresh-api-error';
import { User } from '../../api/types/users/user';
import { CommentListComponent } from "../../components/items/comment-list.component";

@Component({
    selector: 'app-user-comments',
    imports: [
    CommentListComponent
],
    templateUrl: './user-comments.component.html'
})
export class UserCommentsComponent {
  protected profile: User | undefined | null;
  protected ownUser: ExtendedUser | undefined;

  constructor(private client: ClientService, route: ActivatedRoute, private auth: AuthenticationService, protected banner: BannerService)
  {
    route.params.subscribe(params => {
      const username: string | undefined = params['username'];
      const uuid: string | undefined = params['uuid'];

      this.client.getUserByEitherLookup(username, uuid).subscribe({
        error: error => {
          const apiError: RefreshApiError | undefined = error.error?.error;
          banner.error("Failed to load profile", apiError == null ? error.message : apiError.message);
        },

        next: response => {
          this.profile = response;

          this.auth.user.subscribe(user => {
            if(user) {
              this.ownUser = user;
            }
          });
        }
      });
    });
  }
}