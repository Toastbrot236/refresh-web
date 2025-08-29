export interface ContentOption {
    name: string
    route: string
}

export const userLevelOptions: ContentOption[] = [
    {
        name: "Published",
        route: "/levels/byUser"
    },
    {
        name: "Hearted",
        route: "/levels/hearted"
    },
];

export const userPhotoOptions: ContentOption[] = [
    {
        name: "By User",
        route: "/photos/by/username"
    },
    {
        name: "With User",
        route: "/photos/with/username"
    },
];