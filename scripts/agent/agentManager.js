// Agentとプレイヤーの紐づけ、管理

import { Entity, Player } from "@minecraft/server";
import { AgentMove } from "./agentMove";
import { testMode } from "../settings/testMode";

class AgentManager {
    constructor() {
        this.agentMap = new Map();
    }

    /**
     * 
     * @param {Entity} agent 
     * @param {Player} player 
     */
    setAgent(agent, player) {
        const newAgentInstance = new AgentMove(agent, player);
        this.agentMap.set(player.id, newAgentInstance);
        if (testMode) player.sendMessage(`[test] player: ${player.nameTag}, agent: ${agent.nameTag}を追加`);
    }

    /**
     * 
     * @param {string} playerId 
     * @returns {AgentMove}
     */
    getAgentFromPlayerId(playerId) {
        return this.agentMap.get(playerId);
    }

    /**
     * 
     * @param {string} playerId 
     */
    deleteAgentFromPlayerId(playerId) {
        this.agentMap.delete(playerId);
    }

    /**
     * 
     * @param {string} playerId 
     * @returns {boolean}
     */
    checkHasAgentFromPlayerId(playerId) {
        if (this.agentMap.has(playerId)) return false;
        
        const agentInstance = this.getAgentFromPlayerId(playerId);
        const existsAgent = agentInstance.agent.isValid;
        return existsAgent;
    }
}

export const agentManager = new AgentManager();