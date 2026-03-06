import { system, world } from "@minecraft/server";
import { agentManager } from "./agent/agentManager";
import { testMode } from "./settings/testMode";
import { setCameraForMiniPlayer, stopCameraForMiniPlayer } from "./utils/camera";

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


world.beforeEvents.itemUse.subscribe(ev => {
    const {itemStack, source: player} = ev;
    if (testMode) world.sendMessage('§6[test] アイテムが使用されました');

    // Agentが追跡するかどうかの切り替え
    if (itemStack.typeId === "minecraft:stick") {
        if (testMode) world.sendMessage('§6[test] 棒が使用されました');
        ev.cancel = true;
        const agentInstance = agentManager.getAgentFromPlayerId(player.id);
        if (agentInstance === null) return;
        
        agentInstance.isFollowing = !agentInstance.isFollowing;
        if (testMode) world.sendMessage(`§6[test] Agent ${agentInstance.agent.nameTag}の追跡が${agentInstance.isFollowing}に設定されました`);
    }

    if (itemStack.typeId === "minecraft:blaze_rod") {
        if (testMode) world.sendMessage('§6[test] ブレイズロッドが使用されました');
        ev.cancel = true;
        setCameraForMiniPlayer(player);
    }

    if (itemStack.typeId === "minecraft:end_rod") {
        if (testMode) world.sendMessage('§6[test] エンドロッドが使用されました');
        ev.cancel = true;
        stopCameraForMiniPlayer(player);
    }
});

// 追跡動作
system.runInterval(() => {
    agentManager.updateFollowing();
}, 5);

world.beforeEvents.itemUse.subscribe((ev) => {
  const usedItemId = ev.itemStack.typeId;
  const player = ev.source;

  system.runTimeout(() => {
    if (player && usedItemId === "minecraft:iron_sword") {
      if (testMode) player.sendMessage("§6[test] 鉄の剣が使用");

      const playerLoc = player.location;
      player.sendMessage(playerLoc.x);

      placeFilledCircle(
        {
          x: Math.floor(playerLoc.x),
          y: Math.floor(playerLoc.y),
          z: Math.floor(playerLoc.z),
        },
        10,
        "minecraft:stone",
      );
    }
  });
  player.sendMessage("テスト");
});

/**
 * 塗りつぶした円を配置
 */
export function placeFilledCircle(center, radius, blockType) {
  const dimension = world.getDimension("overworld");

  // 半径の範囲内の全ての点をチェック
  for (let x = -radius; x <= radius; x++) {
    for (let z = -radius; z <= radius; z++) {
      // 円の方程式: x² + z² <= r²
      if (x * x + z * z <= radius * radius) {
        dimension.setBlockType(
          {
            x: Math.floor(center.x + x),
            y: center.y,
            z: Math.floor(center.z + z),
          },
          blockType,
        );
      }
    }
  }
}
