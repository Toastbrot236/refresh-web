import {Room} from "../rooms/room";
import { MinimalUser } from "./minimal-user";
import {UserStatistics} from "./user-statistics";

export interface User extends MinimalUser {
    role: number;
    
    description: string;
    joinDate: Date;
    lastLoginDate: Date;

    statistics: UserStatistics;
    activeRoom: Room | undefined;
}
