"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

/** Shows a one-off toast, then strips the triggering query param from the URL. */
export function WelcomeToast({ message }: { message: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const shown = useRef(false);

  useEffect(() => {
    if (shown.current) return;
    shown.current = true;
    toast.success(message);
    router.replace(pathname, { scroll: false });
  }, [message, pathname, router]);

  return null;
}
