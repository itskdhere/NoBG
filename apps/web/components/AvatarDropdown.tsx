"use client";

import { authClient } from "@/lib/auth-client";
import { Button } from "@workspace/ui/components/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { LoaderIcon, LogOutIcon, Settings, UserRound } from "lucide-react";

export function AvatarDropdown({
  session,
}: {
  session: NonNullable<ReturnType<typeof authClient.useSession>["data"]>;
}) {
  async function handleSignOut() {
    await authClient.signOut();
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full cursor-pointer"
        >
          <Avatar>
            <AvatarImage src={session.user.image!} alt="shadcn" />
            <AvatarFallback>
              <LoaderIcon
                role="status"
                aria-label="Loading"
                className="size-4 animate-spin"
              />
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-fit">
        <DropdownMenuLabel>
          <p className="text-md font-semibold">{session.user.name}</p>
          <p className="text-md opacity-70">{session.user.email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <UserRound />
            Account
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings />
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onSelect={handleSignOut}>
          <LogOutIcon className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
