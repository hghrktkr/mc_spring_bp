import { system, world } from "@minecraft/server";
import { MinecraftEntityTypes, MinecraftItemTypes } from "@minecraft/vanilla-data";
import { agentManager } from "./agent/agentManager";

// block components
system.beforeEvents.startup.subscribe((startupEv) => {

    /**
     * ドアの開閉
     */
    startupEv.blockComponentRegistry.registerCustomComponent("edu:door_open", {
        onPlayerInteract(playerInteractEv) {
            const player = playerInteractEv.player;
            const block = playerInteractEv.block;
            const blockId = playerInteractEv.block.typeId;
            const perm = playerInteractEv.block.permutation;

            if (!player) return;
            if (blockId === "edu:portrait_agent") {
                const isOpen = perm.getState("edu:isOpen");
                const direction = perm.getState("minecraft:cardinal_direction");

                if (isOpen === undefined || direction === undefined) return;

                const newPerm = perm.withState("edu:isOpen", !isOpen);
                block.setPermutation(newPerm);
            }
        },
    });
});

// Agentの登録、プレイヤーとの紐づけ
world.afterEvents.entitySpawn.subscribe(ev => {
    const entityType = ev.entity.typeId;

    if (entityType === MinecraftEntityTypes.Agent) {
        const agent = ev.entity;
        const agentName = agent.nameTag;
        const player = world.getAllPlayers()
            .find(p => agentName.includes(p.nameTag));

        if (!player) return;
        
        agentManager.setAgent(agent, player);
    }
});

// AgentがデスポーンしたときMapから削除
world.afterEvents.entityRemove.subscribe(ev => {
    const {removedEntityId, typeId} = ev;

    if (typeId === MinecraftEntityTypes.Agent) {
        agentManager.deleteAgentFromAgentId(removedEntityId);
    }
});

// Agentが追跡するかどうかの切り替え
world.beforeEvents.itemUse.subscribe(ev => {
    const {item, source: player} = ev;

    if (item.typeId === MinecraftItemTypes.Stick) {
        ev.cancel = true;
        const agentInstance = agentManager.getAgentFromPlayerId(player.id);
        if (agentInstance === null) return;

        agentInstance.isFollowing = !agentInstance.isFollowing;
    }
});

// 追跡動作
system.runInterval(() => {
    for (const agent of agentManager.agentsFromPlayerId.values()) {
        if (!agent.agent.isValid || !agent.player.isValid) {
            agentManager.deleteAgentFromAgentId(agent.agentId);
        }
        agent.update();
    }
}, 20 * 2);