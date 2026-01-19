// Agentとプレイヤーの紐づけ、管理

import { Entity, Player, world } from "@minecraft/server";
import { Agent } from "./ClassAgent";
import { testMode } from "../settings/testMode";

class AgentManager {
    constructor() {
        this.agentsFromPlayerId = new Map();    // playerId -> AgentInstance
        this.agentsFromAgentId = new Map();     // agentId -> AgentInstance
    }
    
    updateFollowing() {
        for (const agent of this.agentsFromPlayerId.values()) {
            if (!agent.agent.isValid || !agent.player.isValid) {
                this.deleteAgentFromAgentId(agent.agentId);
            }
            agent.update();
        }
    }

    /**
     * 
     * @param {Entity} agent 
     * @param {Player} player 
     */
    setAgent(agent, player) {
        if (this.checkHasAgentFromPlayerId(player.id)) {
            if (testMode) world.sendMessage(`§c[test] player: ${player.nameTag}, agent: ${agent.nameTag}はすでに登録されています`);
            
            if (this.checkAgentExistsFromPlayerId(player.id)) {
                if (testMode) world.sendMessage(`§c[test] 登録を中断します`);
                return;
            }
            else {
                if (testMode) world.sendMessage(`§c[test] agent: ${agent.nameTag}がデスポーンしています`);
                this.deleteAgentFromPlayerId(player.id);
                return;
            }
        }

        const newAgentInstance = new Agent(agent, player);
        this.agentsFromPlayerId.set(
            newAgentInstance.playerId,
            newAgentInstance
        );
        this.agentsFromAgentId.set(
            newAgentInstance.agentId,
            newAgentInstance
        );
        if (testMode) world.sendMessage(`§c[test] player: ${player.nameTag}, agent: ${agent.nameTag}を追加しました`);
    }

    /**
     * 
     * @param {string} playerId 
     * @returns {Agent | null}
     */
    getAgentFromPlayerId(playerId) {
        if (!this.checkHasAgentFromPlayerId(playerId)) {
            if (testMode) world.sendMessage(`§c[test] playerId: ${playerId} のエージェントが見つかりませんでした`);
            return null;
        }

        if (!this.checkAgentExistsFromPlayerId(playerId)) {
            if (testMode) world.sendMessage(`§c[test] playerId: ${playerId} のデータはありましたがエージェントがデスポーンしています`);
            this.deleteAgentFromPlayerId(playerId);
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
            if (testMode) world.sendMessage(`§c[test] agentId: ${agentId} のエージェントが見つかりませんでした`);
            return null;
        }

        if (!this.checkAgentExistsFromAgentId(agentId)) {
            if (testMode) world.sendMessage(`§c[test] agentId: ${agentId} のデータはありましたがエージェントがデスポーンしています`);
            this.deleteAgentFromAgentId(agentId);
            return null;
        }

        return this.agentsFromAgentId.get(agentId);
    }

    /**
     * 
     * @param {string} playerId 
     */
    deleteAgentFromPlayerId(playerId) {
        const agentInstance = this.agentsFromPlayerId.get(playerId);
        if (!agentInstance) return;
        const agentId = agentInstance.agentId;
        this.agentsFromPlayerId.delete(playerId);
        this.agentsFromAgentId.delete(agentId);
        if (testMode) world.sendMessage(`§c[test] playerId: ${playerId} agentId: ${agentId}を削除しました`);
    }

    /**
     * 
     * @param {string} agentId 
     */
    deleteAgentFromAgentId(agentId) {
        const agentInstance = this.agentsFromAgentId.get(agentId);
        if (!agentInstance) return;
        const playerId = agentInstance.playerId;
        this.agentsFromAgentId.delete(agentId);
        this.agentsFromPlayerId.delete(playerId);
        if (testMode) world.sendMessage(`§c[test] playerId: ${playerId} agentId: ${agentId}を削除しました`);
    }

    /**
     * 
     * @param {string} playerId 
     * @returns {boolean}
     */
    checkHasAgentFromPlayerId(playerId) {
        return this.agentsFromPlayerId.has(playerId) ? true : false;
    }

    /**
     * 
     * @param {string} agentId 
     * @returns {boolean}
     */
    checkHasAgentFromAgentId(agentId) {
        return this.agentsFromAgentId.has(agentId) ? true : false;
    }

    /**
     * 
     * @param {string} playerId 
     * @returns {boolean}
     */
    checkAgentExistsFromPlayerId(playerId) {
        const agentInstance = this.agentsFromPlayerId.get(playerId);
        
        return agentInstance && agentInstance.agent.isValid ? true : false;
    }

    /**
     * 
     * @param {string} agentId 
     * @returns {boolean}
     */
    checkAgentExistsFromAgentId(agentId) {
        const agentInstance = this.agentsFromAgentId.get(agentId);
        
        return agentInstance && agentInstance.agent.isValid ? true : false;
    }
}

export const agentManager = new AgentManager();