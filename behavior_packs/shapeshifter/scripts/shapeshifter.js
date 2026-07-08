import { world, system } from "@minecraft/server";
import { ActionFormData } from "@minecraft/server-ui";

class ShapeshiftManager {
  constructor() {
    this.playerForms = new Map();
    this.setupEventListeners();
  }

  setupEventListeners() {
    // Listen for player attacks
    world.afterEvents.playerInteractWithEntity.subscribe((event) => {
      this.handlePlayerInteraction(event.player, event.target);
    });

    world.afterEvents.playerBreakBlock.subscribe((event) => {
      this.handleBlockBreak(event.player, event.block);
    });
  }

  handlePlayerInteraction(player, target) {
    // Check if player is crouching
    if (!player.isSneaking) return;

    // Store the form for this player
    const currentForm = this.playerForms.get(player.name) || "human";
    
    if (currentForm === "human" && target) {
      // Transform into entity
      this.transformIntoEntity(player, target);
    } else if (currentForm.startsWith("entity:")) {
      // Revert to human
      this.revertToHuman(player);
    }
  }

  handleBlockBreak(player, block) {
    // Check if player is crouching
    if (!player.isSneaking) return;

    const currentForm = this.playerForms.get(player.name) || "human";
    
    if (currentForm === "human") {
      // Transform into block
      this.transformIntoBlock(player, block);
    } else if (currentForm.startsWith("block:")) {
      // Revert to human
      this.revertToHuman(player);
    }
  }

  transformIntoBlock(player, block) {
    const blockType = block.typeId;
    
    // Prevent transforming into certain blocks
    const blacklist = ["minecraft:bedrock", "minecraft:air", "minecraft:void_air"];
    if (blacklist.includes(blockType)) {
      player.sendMessage("§c[Shapeshifter] You cannot shapeshift into this block!");
      return;
    }

    this.playerForms.set(player.name, `block:${blockType}`);
    player.sendMessage(`§a[Shapeshifter] Transformed into ${blockType}!`);
    
    // Apply visual effects
    this.applyBlockTransformEffects(player, blockType);
  }

  transformIntoEntity(player, entity) {
    const entityType = entity.typeId;
    
    // Prevent transforming into certain entities
    const blacklist = ["minecraft:player"];
    if (blacklist.includes(entityType)) {
      player.sendMessage("§c[Shapeshifter] You cannot shapeshift into this entity!");
      return;
    }

    this.playerForms.set(player.name, `entity:${entityType}`);
    player.sendMessage(`§a[Shapeshifter] Transformed into ${entityType}!`);
    
    // Apply visual effects
    this.applyEntityTransformEffects(player, entityType);
  }

  revertToHuman(player) {
    this.playerForms.set(player.name, "human");
    player.sendMessage("§a[Shapeshifter] Reverted to human form!");
    
    // Remove effects
    player.removeEffect("invisibility");
    player.removeEffect("slowness");
  }

  applyBlockTransformEffects(player, blockType) {
    // Make player invisible to show the block
    player.addEffect("invisibility", 999999, { amplifier: 0, showParticles: false });
    
    // Add slowness to represent being a block
    player.addEffect("slowness", 999999, { amplifier: 1, showParticles: false });
  }

  applyEntityTransformEffects(player, entityType) {
    // Make player invisible
    player.addEffect("invisibility", 999999, { amplifier: 0, showParticles: false });
  }

  getCurrentForm(player) {
    return this.playerForms.get(player.name) || "human";
  }
}

// Initialize the manager
const shapeshiftManager = new ShapeshiftManager();

// Export for other scripts
export { shapeshiftManager };
