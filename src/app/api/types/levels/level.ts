import {User} from "../users/user";
import {MinimalLevel} from "./minimal-level";

export interface Level extends MinimalLevel {
    description: string;
    publishDate: Date;
    updateDate: Date;
    booRatings: number;
    yayRatings: number;
    hearts: number;
    totalPlays: number;
    uniquePlays: number;
    publisher: User | undefined;
    teamPicked: boolean;
    gameVersion: number;
    score: number;
    slotType: number;
}
