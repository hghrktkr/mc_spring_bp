import { Player, system } from "@minecraft/server";
import { testMode } from "../settings/testMode";

let cameraIntervalId;

/**
 * 
 * @param {Player} player 
 */
export function setCameraForMiniPlayer(player) {
    if (cameraIntervalId !== undefined) return;

    cameraIntervalId = system.runInterval(() => {
        let cameraY = 0.5;
        let cameraZ = -3.5;
        const maxCameraDistance = 3.5;
        const rot = player.getRotation();
        const direction = player.getViewDirection();
        const reverseDirection = {
            x: -1 * direction.x,
            y: -1 * direction.y,
            z: -1 * direction.z
        }

        // カメラが地面にめり込むとき
        if (rot.x < -10) {
            cameraY = 0;
            cameraZ = -0.25;
        }

        // カメラが壁にめり込むとき
        const hitBlock = player.dimension.getBlockFromRay(
            player.getHeadLocation(),
            reverseDirection, 
            {
                maxDistance: maxCameraDistance
            }
        );
        if (hitBlock !== undefined) {
            const blockLoc = hitBlock.faceLocation;
            const distance = Math.sqrt(blockLoc.x**2 + blockLoc.y**2 + blockLoc.z**2);
            cameraZ = Math.min(maxCameraDistance, distance) * -1;
        }

        player.runCommand(
            `camera @s set edu:third_person_mini ease 0.1 linear pos ^^${cameraY}^${cameraZ} rot ${rot.x} ${rot.y}`
        );
    }, 1);
}

export function stopCameraForMiniPlayer(player) {
    if (cameraIntervalId === undefined) return;

    system.clearRun(cameraIntervalId);
    cameraIntervalId = undefined;
    system.run(() => {
        player.runCommand('camera @s clear');
    });
}