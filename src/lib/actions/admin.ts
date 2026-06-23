"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSuperAdmin } from "@/lib/security/admin-access";
import { writeAuditLog } from "@/lib/admin/audit";
import { cancelSubscriptionForAccountDeletion } from "@/lib/billing";

async function requireSuperAdminAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !isSuperAdmin(user)) {
    throw new Error("Forbidden");
  }

  return user;
}

export async function suspendRestaurant(
  restaurantId: string,
  reason?: string
): Promise<{ error?: string }> {
  const actor = await requireSuperAdminAction();
  const admin = createAdminClient();

  const { error } = await admin
    .from("restaurants")
    .update({
      is_suspended: true,
      suspended_at: new Date().toISOString(),
      suspended_reason: reason?.trim() || "Suspended by platform admin",
    })
    .eq("id", restaurantId);

  if (error) return { error: error.message };

  await writeAuditLog({
    actorId: actor.id,
    actorEmail: actor.email,
    action: "restaurant.suspend",
    entityType: "restaurant",
    entityId: restaurantId,
    metadata: { reason },
  });

  revalidatePath("/admin/restaurants");
  revalidatePath(`/admin/restaurants/${restaurantId}`);
  return {};
}

export async function unsuspendRestaurant(
  restaurantId: string
): Promise<{ error?: string }> {
  const actor = await requireSuperAdminAction();
  const admin = createAdminClient();

  const { error } = await admin
    .from("restaurants")
    .update({
      is_suspended: false,
      suspended_at: null,
      suspended_reason: null,
    })
    .eq("id", restaurantId);

  if (error) return { error: error.message };

  await writeAuditLog({
    actorId: actor.id,
    actorEmail: actor.email,
    action: "restaurant.unsuspend",
    entityType: "restaurant",
    entityId: restaurantId,
  });

  revalidatePath("/admin/restaurants");
  revalidatePath(`/admin/restaurants/${restaurantId}`);
  return {};
}

export async function deleteRestaurantAsAdmin(
  restaurantId: string
): Promise<{ error?: string }> {
  const actor = await requireSuperAdminAction();
  const admin = createAdminClient();

  const { data: restaurant } = await admin
    .from("restaurants")
    .select("owner_id, name")
    .eq("id", restaurantId)
    .maybeSingle();

  if (!restaurant) return { error: "Restaurant not found" };

  const cancelResult = await cancelSubscriptionForAccountDeletion(restaurantId);
  if (!cancelResult.success) {
    return {
      error:
        cancelResult.error ??
        "Could not cancel subscription before deletion",
    };
  }

  const { error } = await admin.auth.admin.deleteUser(restaurant.owner_id);
  if (error) return { error: error.message };

  await writeAuditLog({
    actorId: actor.id,
    actorEmail: actor.email,
    action: "restaurant.delete",
    entityType: "restaurant",
    entityId: restaurantId,
    metadata: { name: restaurant.name, ownerId: restaurant.owner_id },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/restaurants");
  return {};
}

export async function impersonateRestaurantOwner(
  restaurantId: string
): Promise<{ error?: string; url?: string }> {
  const actor = await requireSuperAdminAction();
  const admin = createAdminClient();

  const { data: restaurant } = await admin
    .from("restaurants")
    .select("owner_id, name")
    .eq("id", restaurantId)
    .maybeSingle();

  if (!restaurant) return { error: "Restaurant not found" };

  const { data: owner, error: ownerError } =
    await admin.auth.admin.getUserById(restaurant.owner_id);

  if (ownerError || !owner.user.email) {
    return { error: "Owner account not found" };
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const { data: linkData, error: linkError } =
    await admin.auth.admin.generateLink({
      type: "magiclink",
      email: owner.user.email,
      options: {
        redirectTo: `${appUrl}/auth/callback`,
      },
    });

  if (linkError || !linkData.properties?.action_link) {
    return { error: linkError?.message ?? "Could not generate login link" };
  }

  await writeAuditLog({
    actorId: actor.id,
    actorEmail: actor.email,
    action: "restaurant.impersonate",
    entityType: "restaurant",
    entityId: restaurantId,
    metadata: { ownerEmail: owner.user.email },
  });

  return { url: linkData.properties.action_link };
}

export async function updateSupportRequestStatus(
  requestId: string,
  status: "open" | "in_progress" | "resolved" | "closed",
  adminNotes?: string
): Promise<{ error?: string }> {
  const actor = await requireSuperAdminAction();
  const admin = createAdminClient();

  const { error } = await admin
    .from("support_requests")
    .update({
      status,
      admin_notes: adminNotes?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", requestId);

  if (error) return { error: error.message };

  await writeAuditLog({
    actorId: actor.id,
    actorEmail: actor.email,
    action: "support.update_status",
    entityType: "support_request",
    entityId: requestId,
    metadata: { status },
  });

  revalidatePath("/admin/support");
  return {};
}

export async function logoutToAdmin() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
