import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AvatarCard } from "@/components/profile/avatar-card";
import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { ProfileDetailsForm } from "@/components/profile/profile-details-form";
import { PageHeader } from "@/components/shared/page-header";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Profile & settings" };

export default async function CustomerProfilePage() {
  // Shares the layout's cached /users/me request.
  const user = await getSession();
  if (!user) redirect("/login");

  return (
    <>
      <PageHeader title="Profile & settings" description="Keep your contact details current and your account secure." />
      <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
        <div className="space-y-6">
          <AvatarCard user={user} />
        </div>
        <div className="space-y-6">
          <ProfileDetailsForm user={user} />
          <ChangePasswordForm />
        </div>
      </div>
    </>
  );
}
