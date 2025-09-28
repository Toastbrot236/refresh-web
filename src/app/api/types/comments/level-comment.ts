import { MinimalLevel } from "../levels/minimal-level";
import { Comment } from "./comment";

export interface LevelComment extends Comment {
    level: MinimalLevel;
}