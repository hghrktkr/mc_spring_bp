// Agentとプレイヤーの紐づけ、管理

import { Entity, Player, world } from "@minecraft/server";
import { Agent } from "./ClassAgent";
import { testMode } from "../settings/testMode";

class AgentManager {
    constructor() {
        this.agentsFromPlayerId = new Map();    // playerId -> AgentInstance
        this.agentsFromAgentId = new Map();     // agentId -> AgentInstance
    }

    /**
     * 
     * @param {Entity} agent 
     * @param {Player} player 
     */
    setAgent(agent, player) {
        const newAgentInstance = new Agent(agent, player);
        this.agentsFromPlayerId.set(
            newAgentInstance.playerId,
            newAgentInstance
        );
        this.agentsFromAgentId.set(
            newAgentInstance.agentId,
            newAgentInstance
        );
        if (testMode) world.sendMessage(`[test] player: ${player.nameTag}, agent: ${agent.nameTag}を追加`);
    }

    /**
     * 
     * @param {string} playerId 
     * @returns {Agent | null}
     */
    getAgentFromPlayerId(playerId) {
        if (!this.checkHasAgentFromPlayerId(playerId)) {
            if (testMode) world.sendMessage(`[test] playerId: ${playerId} のエージェントが見つかりませんでした`);
            return null;
        }

        return this.agentsFromPlayerId.get(playerId);
    }

    /**
     * 
     * @param {string} agentId 
     * @returns {Agent | null}
     */
    getAgentFromAgentId(agentId) {
        if (!this.checkHasAgentFromAgentId(agentId)) {
            if (testMode) world.sendMessage(`[test] agentId: ${agentId} のエージェントが見つかりませんでした`);
            return null;
        }

        return this.agentsFromAgentId.get(agentId);
    }

    /**
     * 
     * @param {string} playerId 
     */
    deleteAgentFromPlayerId(playerId) {
        if (!this.checkHasAgentFromPlayerId(playerId)) {
            if (testMode) world.sendMessage(`[test] playerId: ${playerId} のエージェントが見つかりませんでした`);
            return;
        }

        const agentId = this.getAgentFromPlayerId(playerId).agentId;
        this.agentsFromPlayerId.delete(playerId);
        this.agentsFromAgentId.delete(agentId);
    }

    /**
     * 
     * @param {string} agentId 
     */
    deleteAgentFromAgentId(agentId) {
        if (!this.checkHasAgentFromAgentId(agentId)) {
            if (testMode) world.sendMessage(`[test] agentId: ${agentId} のエージェントが見つかりませんでした`);
            return;
        }

        const playerId = this.getAgentFromAgentId(agentId).playerId;
        this.agentsFromAgentId(agentId);
        this.agentsFromPlayerId(playerId);
    }

    /**
     * 
     * @param {string} playerId 
     * @returns {boolean}
     */
    checkHasAgentFromPlayerId(playerId) {
        if (!this.agentsFromPlayerId.has(playerId)) return false;
        
        const agentInstance = this.getAgentFromPlayerId(playerId);
        const existsAgent = agentInstance.agent.isValid;
        return existsAgent;
    }

    /**
     * 
     * @param {string} agentId 
     * @returns {boolean}
     */
    checkHasAgentFromAgentId(agentId) {
        if (!this.agentsFromAgentId.has(agentId)) return false;

        const agentInstance = this.getAgentFromAgentId(agentId);
        const existsAgent = agentInstance.agent.isValid;
        return existsAgent;
    }
}

export const agentManager = new AgentManager();