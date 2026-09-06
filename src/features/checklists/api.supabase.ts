import { createClient } from "@/lib/supabase/client";
import { asRequiredNumber, throwIfError, throwIfWriteError } from "@/lib/supabase/throw";
import type {
  ChecklistCategory,
  ChecklistItem,
  CreateChecklistCategoryInput,
  CreateChecklistItemInput,
  UpdateChecklistItemInput,
} from "@/mocks/fixtures/checklists";

interface CategoryRow {
  id: string;
  trip_id: string;
  name: string;
  icon: string;
  order_index: number | string;
}

interface ItemRow {
  id: string;
  category_id: string;
  trip_id: string;
  title: string;
  is_checked: boolean;
  notes: string | null;
  order_index: number | string;
}

function toCategory(row: CategoryRow): ChecklistCategory {
  return {
    id: row.id,
    tripId: row.trip_id,
    name: row.name,
    icon: row.icon,
    orderIndex: asRequiredNumber(row.order_index),
  };
}

function toItem(row: ItemRow): ChecklistItem {
  return {
    id: row.id,
    categoryId: row.category_id,
    tripId: row.trip_id,
    title: row.title,
    isChecked: row.is_checked,
    notes: row.notes ?? undefined,
    orderIndex: asRequiredNumber(row.order_index),
  };
}

export async function fetchChecklistCategories(tripId: string): Promise<ChecklistCategory[]> {
  const supabase = createClient();
  const result = await supabase
    .from("checklist_categories")
    .select("*")
    .eq("trip_id", tripId)
    .order("order_index");
  return throwIfError(result).map(toCategory);
}

export async function createChecklistCategory(
  input: CreateChecklistCategoryInput,
): Promise<ChecklistCategory> {
  const supabase = createClient();
  const result = await supabase
    .from("checklist_categories")
    .insert({
      trip_id: input.tripId,
      name: input.name,
      icon: input.icon,
      order_index: input.orderIndex,
    })
    .select("*")
    .single();
  return toCategory(throwIfError(result));
}

export async function deleteChecklistCategory(tripId: string, id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("checklist_categories")
    .delete()
    .eq("trip_id", tripId)
    .eq("id", id);
  throwIfWriteError(error);
}

export async function fetchChecklistItems(tripId: string): Promise<ChecklistItem[]> {
  const supabase = createClient();
  const result = await supabase
    .from("checklist_items")
    .select("*")
    .eq("trip_id", tripId)
    .order("order_index");
  return throwIfError(result).map(toItem);
}

export async function createChecklistItem(input: CreateChecklistItemInput): Promise<ChecklistItem> {
  const supabase = createClient();
  const result = await supabase
    .from("checklist_items")
    .insert({
      category_id: input.categoryId,
      trip_id: input.tripId,
      title: input.title,
      is_checked: input.isChecked,
      notes: input.notes ?? null,
      order_index: input.orderIndex,
    })
    .select("*")
    .single();
  return toItem(throwIfError(result));
}

export async function updateChecklistItem(
  tripId: string,
  id: string,
  patch: UpdateChecklistItemInput,
): Promise<ChecklistItem> {
  const supabase = createClient();
  const row: Record<string, unknown> = {};
  if (patch.title !== undefined) row.title = patch.title;
  if (patch.isChecked !== undefined) row.is_checked = patch.isChecked;
  if (patch.notes !== undefined) row.notes = patch.notes ?? null;
  if (patch.orderIndex !== undefined) row.order_index = patch.orderIndex;
  const result = await supabase
    .from("checklist_items")
    .update(row)
    .eq("trip_id", tripId)
    .eq("id", id)
    .select("*")
    .single();
  return toItem(throwIfError(result));
}

export async function deleteChecklistItem(tripId: string, id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase
    .from("checklist_items")
    .delete()
    .eq("trip_id", tripId)
    .eq("id", id);
  throwIfWriteError(error);
}
