import type { Metadata } from "next";
import Link from "next/link";
import { Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent } from "@/components/ui/card";
import { DemoLoginPanel } from "@/components/auth/demo-login-panel";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Log in",
  description: "Log in to PowerGrid BD, or try the Admin, Customer and Technician demo accounts in one click.",
};

const NOTICES: Record<string, string> = {
  expired: "Your session has expired. Please log in again.",
  "password-changed": "Your password was changed. Log in with your new password.",
};

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : null;
  const reason = typeof params.reason === "string" ? params.reason : null;
  const notice = reason ? NOTICES[reason] : null;

  return (
    <div className="space-y-6">
      <div className="space-y-1 text-center">
        <h1 className="text-3xl font-semibold tracking-tight">Welcome back 👋</h1>
        <p className="text-muted-foreground">Log in to your account</p>
      </div>

      {notice && (
        <Alert>
          <Info />
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardContent>
          <LoginForm next={next} />
        </CardContent>
      </Card>

      <div className="flex items-center gap-3 text-xs font-medium tracking-widest text-muted-foreground uppercase">
        <span className="h-px flex-1 bg-border" />
        or
        <span className="h-px flex-1 bg-border" />
      </div>

      <DemoLoginPanel />

      <p className="text-center text-sm text-muted-foreground">
        New customer?{" "}
        <Link href="/register" className="font-medium text-foreground underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
