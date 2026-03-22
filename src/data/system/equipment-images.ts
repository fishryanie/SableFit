import manifest from "@/data/system/equipment-image-manifest.json";

export type EquipmentImageAsset = {
  imageUrl: string;
  sourcePath: string;
  status: "PROVIDED" | "DERIVED";
};

type EquipmentImageManifest = Record<string, EquipmentImageAsset>;

const equipmentImageManifest = manifest as EquipmentImageManifest;

export function getFallbackEquipmentImage(slug: string): EquipmentImageAsset {
  return {
    imageUrl: `/workout/equipment/${slug}/primary.png`,
    sourcePath: `/workout/equipment/${slug}/primary.png`,
    status: "DERIVED",
  };
}

export function getEquipmentImage(slug: string): EquipmentImageAsset {
  return equipmentImageManifest[slug] ?? getFallbackEquipmentImage(slug);
}

export function getEquipmentImageManifest() {
  return equipmentImageManifest;
}
