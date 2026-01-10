import { RatingType } from "./rating-type";

export interface Rating {
    yayRatings: number;
    booRatings: number;
    ownRating: RatingType;
}