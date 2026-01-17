import { system, world } from "@minecraft/server";
import { MinecraftEntityTypes, MinecraftItemTypes } from "@minecraft/vanilla-data";
import { AgentMove } from "./agent/agentMove";
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

    if (entityType = MinecraftEntityTypes.Agent) {
        const agent = ev.entity;
        const agentName = agent.nameTag;
        const player = world.getAllPlayers()
            .filter(p => agentName.includes(p.nameTag));

        if (!player) return;
        
        agentManager.setAgent(agent, player);
        const agentInstance = agentManager.getAgentFromPlayerId(player.id);

        system.runInterval(() => {
            agentInstance.update();
        }, 20)
    }
});

world.afterEvents.entityRemove.subscribe(ev => {
    const {removedEntityId, typeId} = ev;

    if (typeId === MinecraftEntityTypes.Agent) {
        
    }
});

world.beforeEvents.itemUse.subscribe(ev => {
    const {item, source: player} = ev;

    if (item.typeId === MinecraftItemTypes.Stick) {
        ev.cancel = true;
        const hasAgent = agentManager.checkHasAgentFromPlayerId(player.id);
        
        if (!hasAgent) return;
        
        const agentMove = agentManager.getAgentFromPlayerId(player.id);

        agentMove.isFollowing = !agentMove.isFollowing;
    }
});