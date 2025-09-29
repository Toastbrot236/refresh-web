import { MinimalLevel } from "../levels/minimal-level";
import { MinimalUser } from "../users/minimal-user";
import { Rating } from "./rating";

export interface Comment {
    commentId: number;
    content: string;
    publisher: MinimalUser;
    rating: Rating;
    timestamp: Date;

    level: MinimalLevel | undefined;
    profile: MinimalUser | undefined;
}