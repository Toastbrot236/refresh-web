import {ImageLoaderConfig} from "@angular/common";

export function getApiBaseUrl(): string {
    return "http://192.168.2.111:10061/api/v3";
}

export function getImageLink(hash: string): string {
    return `${getApiBaseUrl()}/assets/${hash}/image`;
}

export function loadImage(config: ImageLoaderConfig) {
    if(config.src.startsWith("/")) return config.src;
    if(config.src.startsWith("http")) return config.src;

    // Only consider SHA1 asset hashes
    // Naturally filters out GUIDs, and blank hashes.
    let expectedLen = config.src.startsWith("psp/") ? 44 : 40;
    if(config.src.length != expectedLen) return "/assets/missingLevel.svg";

    return getImageLink(config.src);
}
