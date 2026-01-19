import { system, world } from "@minecraft/server";
import { agentManager } from "./agent/agentManager";
import { testMode } from "./settings/testMode";

// block components
system.beforeEvents.startup.subscribe((startupEv) => {
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

    if (entityType === "minecraft:agent") {
        if (testMode) world.sendMessage(`§6[test] Agent ${ev.entity.id}が検出されました`);
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

    if (typeId === "minecraft:agent") {
        agentManager.deleteAgentFromAgentId(removedEntityId);
    }
});

// Agentが追跡するかどうかの切り替え
world.beforeEvents.itemUse.subscribe(ev => {
    const {itemStack, source: player} = ev;
    if (testMode) world.sendMessage('§6[test] アイテムが使用されました');

    if (itemStack.typeId === "minecraft:stick") {
        if (testMode) world.sendMessage('§6[test] 棒が使用されました');
        ev.cancel = true;
        const agentInstance = agentManager.getAgentFromPlayerId(player.id);
        if (agentInstance === null) return;
        
        agentInstance.isFollowing = !agentInstance.isFollowing;
        if (testMode) world.sendMessage(`§6[test] Agent ${agentInstance.agent.nameTag}の追跡が${agentInstance.isFollowing}に設定されました`);
    }
});

// 追跡動作
system.runInterval(() => {
    agentManager.updateFollowing();
}, 5);