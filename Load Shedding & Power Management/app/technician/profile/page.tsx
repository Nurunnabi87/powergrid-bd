import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AvatarCard } from "@/components/profile/avatar-card";
import { ChangePasswordForm } from "@/components/profile/change-password-form";
import { ProfileDetailsForm } from "@/components/profile/profile-details-form";
import { PageHeader } from "@/components/shared/page-header";
import { AvailabilityCard } from "@/components/technician/availability-card";
import { getSession } from "@/lib/auth/session";

export const metadata: Metadata = { title: "Profile & availability" };

export default async function TechnicianProfilePage() {
  const user = await getSession();
  if (!user) redirect("/login");

  return (
    <>
      <PageHeader
        title="Profile & availability"
        description="Set whether you can take new jobs, and keep your contact details up to date for dispatch."
      />
      <div className="grid gap-6 lg:grid-cols-[20rem_1fr]">
        <div className="space-y-6">
          <AvatarCard user={user} />
        </div>
        <div className="space-y-6">
          {user.technicianProfile && <AvailabilityCard profile={user.technicianProfile} />}
          <ProfileDetailsForm user={user} />
          <ChangePasswordForm />
        </div>
      </div>
    </>
  );
}
