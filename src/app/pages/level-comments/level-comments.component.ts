import {Component, Inject, PLATFORM_ID} from '@angular/core';
import {Level} from "../../api/types/levels/level";
import {ClientService} from "../../api/client.service";
import {ActivatedRoute} from "@angular/router";
import {SlugPipe} from "../../pipes/slug.pipe";
import { isPlatformBrowser, } from "@angular/common";
import {EmbedService} from "../../services/embed.service";
import {LayoutService} from "../../services/layout.service";
import {AuthenticationService} from "../../api/authentication.service";
import { ExtendedUser } from '../../api/types/users/extended-user';
import { BannerService } from '../../banners/banner.service';
import { RefreshApiError } from '../../api/refresh-api-error';
import { CommentListComponent } from "../../components/items/comment-list.component";

@Component({
    selector: 'app-level-comments',
    imports: [
    CommentListComponent
],
    providers: [
        SlugPipe
    ],
    templateUrl: './level-comments.component.html'
})
export class LevelCommentsComponent {
  protected level: Level | undefined | null;
  protected ownUser: ExtendedUser | undefined;
  protected readonly isBrowser: boolean;

  initialized: boolean = false;

  constructor(private embed: EmbedService, private client: ClientService, private slug: SlugPipe,
              route: ActivatedRoute, protected layout: LayoutService, private auth: AuthenticationService,
              @Inject(PLATFORM_ID) platformId: Object, protected banner: BannerService)
  {
    this.isBrowser = isPlatformBrowser(platformId);

    route.params.subscribe(params => {
      const id: number = +params['id'];

      this.client.getLevelById(id).subscribe({
        error: error => {
          const apiError: RefreshApiError | undefined = error.error?.error;
          banner.error("Failed to load level", apiError == null ? error.message : apiError.message);
        },

        next: response => {
          if(!this.level && response) {
            this.level = response;

            if(this.isBrowser) {
              window.history.replaceState({}, '', `/level/${response.levelId}/${this.slug.transform(response.title)}/comments`);
            }

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
}