import { MinimalUser } from "../users/minimal-user";
import { Comment } from "./comment";

export interface ProfileComment extends Comment {
    profile: MinimalUser;
}