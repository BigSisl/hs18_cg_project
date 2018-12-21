import * as THREE from "three";

export interface WorldModel {
    load(): void;
    unload(): void;
    update(delta: number): void;
}

export interface UpdateableWorld {
    updateMappingPosition(pos: THREE.Vector3): void;
}