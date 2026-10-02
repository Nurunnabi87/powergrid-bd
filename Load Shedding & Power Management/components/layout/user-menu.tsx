"use client";

import { useTransition } from "react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import { Globe, LogOut, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/shared/user-avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSession } from "@/hooks/use-session";
import { logoutAction } from "@/lib/auth/actions";
import { ROLE_LABEL } from "@/lib/auth/roles";
import { useSessionStore } from "@/stores/session-store";

const PROFILE_HREF = { ADMIN: null, CUSTOMER: "/dashboard/profile", TECHNICIAN: "/technician/profile" } as const;

export function UserMenu() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [isPending, startTransition] = useTransition();

  if (!user) return null;

  const profileHref = PROFILE_HREF[user.role];

  const logout = () =>
    startTransition(async () => {
      // Drop every cached query so the next user never sees this one's data.
      queryClient.clear();
      useSessionStore.getState().setUser(null);
      await logoutAction();
    });

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-9 gap-2 rounded-full px-1 sm:pr-3" aria-label="Account menu">
          <UserAvatar name={user.name} src={user.avatarUrl} size={28} />
          <span className="hidden max-w-32 truncate text-sm font-medium sm:inline">{user.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuLabel className="space-y-0.5">
          <p className="truncate font-medium">{user.name}</p>
          <p className="truncate text-xs font-normal text-muted-foreground">{user.email}</p>
          <p className="text-xs font-normal text-muted-foreground">{ROLE_LABEL[user.role]} account</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          {profileHref && (
            <DropdownMenuItem asChild>
              <Link href={profileHref}>
                <UserRound /> Profile
              </Link>
            </DropdownMenuItem>
          )}
          <DropdownMenuItem asChild>
            <Link href="/">
              <Globe /> Public website
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" disabled={isPending} onSelect={logout}>
          <LogOut /> {isPending ? "Logging out…" : "Log out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
