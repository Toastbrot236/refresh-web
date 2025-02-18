import {Injectable} from "@angular/core";
import {ApiImplementation} from "./api-implementation";
import {HttpClient} from "@angular/common/http";
import {TokenStorageService} from "./token-storage.service";
import {ExtendedUser} from "./types/users/extended-user";
import {AuthRequest} from "./types/auth/auth-request";
import {AuthResponse} from "./types/auth/auth-response";
import {BehaviorSubject} from "rxjs";
import { BannerService } from "../banners/banner.service";
import { RefreshApiError } from "./refresh-api-error";
import { AuthRefreshRequest } from "./types/auth/auth-refresh-request";
import { RefreshApiResponse } from "./refresh-api-response";
import { Router } from "@angular/router";
import { RegisterRequest } from "./types/auth/register-request";

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService extends ApiImplementation {
    public user: BehaviorSubject<ExtendedUser | undefined> = new BehaviorSubject<ExtendedUser | undefined>(undefined);
    
    constructor(http: HttpClient, private tokenStorage: TokenStorageService, private bannerService: BannerService, private router: Router) {
        super(http);

        const storedToken: string | null = this.tokenStorage.GetStoredGameToken();
        console.debug("Has existing token:", storedToken !== null);
        
        const storedUser: ExtendedUser | null = this.tokenStorage.GetStoredUser();
        if (storedToken && storedUser) {
            console.debug("Has existing user:", storedUser);
            this.user.next(storedUser);
        }
        
        if (storedToken) {
            this.GetOwnUser(true);
        }
    }
    
    private HandleAuthResponse(response: AuthResponse) {
        this.tokenStorage.SetStoredGameToken(response.tokenData);
        this.tokenStorage.SetStoredRefreshToken(response.refreshTokenData);
        
        this.GetOwnUser();
    }
    
    private GetOwnUser(refreshTokenIfFail: boolean = false) {
        this.http.get<ExtendedUser>("/users/me").subscribe({
            error: error => {
                if (refreshTokenIfFail) {
                    this.RefreshToken();
                }
                else {
                    const apiError: RefreshApiError | undefined = error.error?.error;
                    this.bannerService.error("Failed to get your user info", apiError == null ? error.message : apiError.message);
                }
            },
            next: response => {
                this.user.next(response);
                this.tokenStorage.SetStoredUser(response);

                console.log(response);
            },
        });
    }

    private RefreshToken() {
        const oldRefreshToken: string | null = this.tokenStorage.GetStoredRefreshToken();

        // At this point we know the token exists in the local store
        const request: AuthRefreshRequest = {
            tokenData: oldRefreshToken!
        }

        this.http.post<AuthResponse>("/refreshToken", request).subscribe({
            error: error => {
                this.ResetStoredInformation();

                const apiError: RefreshApiError | undefined = error.error?.error;
                this.bannerService.error("Failed to extend session", apiError == null ? error.message : apiError.message);
            },
            next: response => {
                this.tokenStorage.SetStoredGameToken(response.tokenData);
                this.tokenStorage.SetStoredRefreshToken(response.refreshTokenData);
                this.GetOwnUser();
            },
        });
    }

    public Register(username: string, emailAddress: string, passwordSha512: string, redirectAfterSuccess: boolean = false): boolean {
        if (this.user.value != undefined) {
            this.bannerService.error("Registration failed", "Cannot register while already logged in as someone.");
            return false;
        }

        const body: RegisterRequest = {
            username: username,
            emailAddress: emailAddress,
            passwordSha512: passwordSha512,
        }

        this.http.post<AuthResponse>("/register", body).subscribe({
            error: error => {
                const apiError: RefreshApiError | undefined = error.error?.error;
                this.bannerService.error("Registration failed", apiError == null ? error.message : apiError.message);
                return false;
            },
            next: response => {
                if (response === undefined) {
                    console.warn("response was null?", response)
                    return false;
                }

                // At this point the server has successfully created an account and it doesn't require activation by authenticating in-game
                this.HandleAuthResponse(response);
                this.bannerService.success("Registration successful", "Your new account has been successfully created!");

                if (redirectAfterSuccess) {
                    this.user.subscribe((user) => {
                        if (user) {
                            this.router.navigate(['/user/', user.username]);
                        }
                    });
                }

                return true;
            }
        })

        return false;
    }
    
    public LogIn(emailAddress: string, password: string, redirectAfterSuccess: boolean = false): boolean {
        if (this.user.value != undefined) {
            this.bannerService.error("Login failed", "Cannot log in while already logged in as someone.");
            return false;
        }

        const body: AuthRequest = {
            emailAddress,
            passwordSha512: password,
        }
        
        this.http.post<AuthResponse>("/login", body).subscribe({
            error: error => {
                const apiError: RefreshApiError | undefined = error.error?.error;
                this.bannerService.error("Login failed", apiError == null ? error.message : apiError.message);
                return false;
            },
            next: response => {
                if (response === undefined) {
                    console.warn("response was null?", response)
                    return false;
                }
                    
                this.HandleAuthResponse(response);
                this.bannerService.success("Login successful", "Successfully logged in, have fun!");

                if (redirectAfterSuccess) {
                    this.user.subscribe((user) => {
                        if (user) {
                            this.router.navigate(['/user/', user.username]);
                        }
                    });
                }

                return true;
            },
        });

        return false;
    }

    public LogOut(redirectAfterSuccess: boolean = false) {
        this.http.put<RefreshApiResponse<undefined>>("/logout", null).subscribe({
            error: error => {
                const apiError: RefreshApiError | undefined = error.error?.error;
                this.bannerService.error("Logout failed", apiError == null ? error.message : apiError.message);
            },
            next: response => {
                this.ResetStoredInformation();
                this.bannerService.success("Logged out", "You have been logged out.");
                if (redirectAfterSuccess) this.router.navigate(['/']);
            },
        })
    }

    private ResetStoredInformation() {
        this.tokenStorage.ClearStoredGameToken();
        this.tokenStorage.ClearStoredRefreshToken();
        this.tokenStorage.ClearStoredUser();
        this.user.next(undefined);
    }
}