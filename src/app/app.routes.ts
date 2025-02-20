import {Route, Routes} from '@angular/router';
import {appendDebugRoutes} from "./debug/debug.routes";

export const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./pages/landing/landing.component').then(x => x.LandingComponent),
        data: {title: "Home"}
    },
    {
        path: 'levels',
        loadComponent: () => import('./pages/level/level-categories/categories.component').then(x => x.CategoriesComponent),
        data: {title: "Level Categories"}
    },
    {
        path: 'levels/:category',
        loadComponent: () => import('./pages/level/listing/level-listing.component').then(x => x.LevelListingComponent),
        data: {title: "Category"}
    },
    {
        path: 'level/:id/:slug',
        loadComponent: () => import('./pages/level/level-details/level.component').then(x => x.LevelComponent),
        data: {title: "Unnamed Level"},
    },
    {
        path: 'level/:id',
        loadComponent: () => import('./pages/level/level-details/level.component').then(x => x.LevelComponent),
        data: {title: "Unnamed Level"},
    },
    ...alias("level/:id/:slug", "slot/:id/:slug"),
    ...alias("level/:id", "slot/:id",),
    {
        path: 'photos',
        loadComponent: () => import('./pages/photo/listing/photo-listing.component').then(x => x.PhotoListingComponent),
        data: {title: "Photos"},
    },
    {
        path: 'photos',
        loadComponent: () => import('./pages/photo/listing/photo-listing.component').then(x => x.PhotoListingComponent),
        data: {title: "Photos"},
    },
    {
        path: 'photo/:id',
        loadComponent: () => import('./pages/photo/details/photo-page.component').then(x => x.PhotoPageComponent),
        data: {title: "Photo"},
    },
    {
        path: 'activity',
        loadComponent: () => import('./pages/activity-listing/activity-listing.component').then(x => x.ActivityListingComponent),
        data: {title: "Recent Activity"},
    },
    {
        path: 'rooms',
        loadComponent: () => import('./pages/room-listing/room-listing.component').then(x => x.RoomListingComponent),
        data: {title: "Room Listing"},
    },
    {
        path: 'user/:username',
        loadComponent: () => import('./pages/user/details/user.component').then(x => x.UserComponent),
        data: {title: "User Page"},
    },
    {
        path: 'user/settings',
        loadComponent: () => import('./pages/user/settings/user-settings.component').then(x => x.UserSettingsComponent),
        data: {title: "User Settings Overview"},
    },
    {
        path: 'user/settings/account',
        loadComponent: () => import('./pages/user/settings/account/user-account-settings.component').then(x => x.UserAccountSettingsComponent),
        data: {title: "User Account Settings"},
    },
    {
        path: 'user/settings/auth',
        loadComponent: () => import('./pages/user/settings/auth/user-auth-settings.component').then(x => x.UserAuthSettingsComponent),
        data: {title: "User Game Authentication"},
    },
    {
        path: 'user/settings/misc',
        loadComponent: () => import('./pages/user/settings/misc/user-misc-settings.component').then(x => x.UserMiscSettingsComponent),
        data: {title: "Other User Settings"},
    },
    {
        path: 'user/settings/profile',
        loadComponent: () => import('./pages/user/settings/profile/user-profile-settings.component').then(x => x.UserProfileSettingsComponent),
        data: {title: "User Profile Settings"},
    },
    {
        path: 'u/:uuid',
        loadComponent: () => import('./pages/user/details/user.component').then(x => x.UserComponent),
        data: {title: "User Page"},
    },
    {
        path: 'register',
        loadComponent: () => import('./pages/auth/register/register.component').then(x => x.RegisterComponent),
        data: {title: "Register"},
    },
    {
        path: 'login',
        loadComponent: () => import('./pages/auth/login/login.component').then(x => x.LoginComponent),
        data: {title: "Log In"},
    },
    {
        path: 'logout',
        loadComponent: () => import('./pages/auth/logout/logout.component').then(x => x.LogoutComponent),
        data: {title: "Log Out"},
    },
    {
        path: 'contests',
        loadComponent: () => import('./pages/contest-listing/contest-listing.component').then(x => x.ContestListingComponent),
        data: {title: "Contests"},
    },
    ...appendDebugRoutes(),
    // KEEP THIS ROUTE LAST! It handles pages that do not exist.
    {
        path: '**',
        loadComponent: () => import('./pages/404/404.component').then(x => x.NotFoundComponent),
        data: {title: "404 Not Found"}
    }
];

function alias(route: string, ...names: string[]): Route[] {
    let routes: Route[] = [];
    for (let name of names) {
        routes.push({
            path: name,
            redirectTo: route,
        });
    }

    return routes;
}
