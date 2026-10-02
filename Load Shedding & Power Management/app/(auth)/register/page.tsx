import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata: Metadata = {
  title: "Create an account",
  description:
    "Register as a PowerGrid BD customer to see your area's load-shedding schedule, report outages and pay your electricity bills.",
};

export default function RegisterPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Create your account</h1>
        <p className="text-muted-foreground">
          Customer accounts see their schedules, report outages and pay bills.
        </p>
      </div>

      <Card>
        <CardContent>
          <RegisterForm />
        </CardContent>
      </Card>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-foreground underline-offset-4 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
