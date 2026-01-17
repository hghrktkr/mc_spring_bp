// エージェントの動きに関する制御
import { world, system, Entity, Player } from "@minecraft/server"
import { getDistance } from "../utils/locationUtils";

export class AgentMove {

    /**
     * 
     * @param {Entity} agent 
     * @param {Player} player 
     * @param {boolean} isFollowing
     * @param {{position: {x: number, y: number, z: number}, rotation: {x: number, y: number}}[]} playerPositionHistories
     */
    constructor(agent, player) {
        this.agent = agent;
        this.player = player;
        this.isFollowing = false;
        this.playerPositionHistories = [];
    }

    update() {
        if(!this.agent.isValid || !this.isFollowing) return;

        this.recordPlayerPosition();
        this.follow();
        this.enforceTeleport();
    
    }

    recordPlayerPosition() {
        const currentPosition = this.player.location;
        const currentDirection = this.player.getRotation();

        this.playerPositionHistories.push(
            {
                position: currentPosition,
                rotation: currentDirection
            }
        );

        if (this.playerPositionHistories.length > 10) {
            this.playerPositionHistories.shift();
        }
    }

    follow() {
        if (this.playerPositionHistories.length < 10) return;
        this.agent.tryTeleport(
            this.playerPositionHistories[0].position,
            {
                rotation: this.playerPositionHistories[0].rotation
            }
        );
    }

    enforceTeleport() {
        const agentPos = this.agent.location;
        const playerPos = this.player.location;
        const playerRot = this.player.getRotation();
        const distance = getDistance(agentPos, playerPos);

        if (distance > 5) {
            this.agent.tryTeleport(
                playerPos,
                {
                    rotation: playerRot
                }
            );
            this.playerPositionHistories.length = 0;
        }
    }

}