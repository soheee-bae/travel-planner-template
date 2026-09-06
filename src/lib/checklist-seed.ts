import { createChecklistCategory, createChecklistItem } from "@/features/checklists/api";
import { CHECKLIST_PRESET_CATEGORIES } from "@/mocks/fixtures/checklists";

export async function seedChecklistPresets(tripId: string): Promise<void> {
  for (const [index, preset] of CHECKLIST_PRESET_CATEGORIES.entries()) {
    const category = await createChecklistCategory({
      tripId,
      name: preset.name,
      icon: preset.icon,
      orderIndex: index,
    });
    for (const [itemIndex, title] of preset.items.entries()) {
      await createChecklistItem({
        tripId,
        categoryId: category.id,
        title,
        isChecked: false,
        orderIndex: itemIndex,
      });
    }
  }
}
