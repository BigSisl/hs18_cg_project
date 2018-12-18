export interface WorldModel {
    load(): void;
    unload(): void;
    update(delta: number): void;
}