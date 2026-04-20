import { createAdminClient } from "@/lib/supabase/server";

export async function autoInviteParentFromLead(leadId: string): Promise<void> {
  const adminSupabase = await createAdminClient();

  const { data: lead } = await adminSupabase
    .from("leads")
    .select("parent_email, parent_first_name, parent_last_name, parent_phone")
    .eq("id", leadId)
    .single();

  if (!lead?.parent_email) return;

  await ensureParentProfile({
    email: lead.parent_email,
    firstName: lead.parent_first_name,
    lastName: lead.parent_last_name,
    phone: lead.parent_phone ?? "",
  });
}

export async function ensureParentProfile({
  email,
  firstName,
  lastName,
  phone,
}: {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
}): Promise<string | null> {
  const adminSupabase = await createAdminClient();
  const normalizedEmail = email.toLowerCase().trim();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";

  const { data: existing } = await adminSupabase
    .from("parent_profiles")
    .select("id")
    .eq("email", normalizedEmail)
    .maybeSingle();

  if (existing) return existing.id;

  const { data: inviteData, error: inviteError } =
    await adminSupabase.auth.admin.inviteUserByEmail(normalizedEmail, {
      redirectTo: `${appUrl}/auth/callback?next=/parent`,
      data: { role: "parent", first_name: firstName, last_name: lastName },
    });

  if (inviteError || !inviteData?.user) return null;

  const { data: profile } = await adminSupabase
    .from("parent_profiles")
    .insert({
      user_id: inviteData.user.id,
      first_name: firstName?.trim() ?? "",
      last_name: lastName?.trim() ?? "",
      email: normalizedEmail,
      phone: phone?.trim() ?? "",
    })
    .select("id")
    .single();

  return profile?.id ?? null;
}
