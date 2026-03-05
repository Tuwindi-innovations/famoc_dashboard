import { User } from "./User";

export interface HeadImage {
    idHeadImage: string;
    image:       string;
    pageName:    string;
    description: string;
    owner:       User;
}