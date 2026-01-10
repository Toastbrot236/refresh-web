import {Room} from "../rooms/room";
import {MinimalUser} from "./minimal-user";
import {UserRole} from "./user-role";
import {UserStatistics} from "./user-statistics";

export interface User extends MinimalUser {
    role: UserRole;
    
    description: string;
    joinDate: Date;
    lastLoginDate: Date;

    statistics: UserStatistics;
    activeRoom: Room | undefined;
}
