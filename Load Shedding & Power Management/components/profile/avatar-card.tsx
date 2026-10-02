"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";
import { ImageUpload } from "@/components/forms/image-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldError } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { UserAvatar } from "@/components/shared/user-avatar";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { uploadWithProgress } from "@/lib/api/client";
import { ROLE_LABEL } from "@/lib/auth/roles";
import { formatDate } from "@/lib/format";
import { imageFileRule } from "@/lib/validations/common";
import { useSessionStore } from "@/stores/session-store";
import type { UserProfile } from "@/types/domain";

/** Profile photo with preview and upload progress (stored on Cloudinary by the API). */
export function AvatarCard({ user }: { user: UserProfile }) {
  const router = useRouter();
  const patchUser = useSessionStore((state) => state.patchUser);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const upload = useApiMutation<{ avatarUrl: string | null }, File>({
    mutationFn: async (image) => {
      const body = new FormData();
      body.set("avatar", image);
      setProgress(0);
      const result = await uploadWithProgress<{ avatarUrl: string | null }>("/users/me/avatar", body, {
        method: "PATCH",
        onProgress: setProgress,
      });
      return result.data;
    },
    successMessage: "Profile photo updated",
    onSuccess: (result) => {
      patchUser({ avatarUrl: result.avatarUrl });
      setFile(null);
      setProgress(null);
      router.refresh();
    },
    onError: () => setProgress(null),
  });

  const choose = (next: File | null) => {
    setFile(next);
    if (!next) {
      setError(null);
      return;
    }
    const parsed = imageFileRule.safeParse(next);
    setError(parsed.success ? null : parsed.error.issues[0]?.message ?? "Invalid image");
  };

  return (
    <Card>
      <CardHeader className="items-center text-center">
        <UserAvatar name={user.name} src={user.avatarUrl} size={88} className="mx-auto ring-4 ring-background" />
        <CardTitle className="mt-2">{user.name}</CardTitle>
        <CardDescription>
          {ROLE_LABEL[user.role]} · member since {formatDate(user.createdAt)}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <ImageUpload value={file} onChange={choose} progress={progress} invalid={Boolean(error)} disabled={upload.isPending} label="Choose a new photo" />
        {error && <FieldError>{error}</FieldError>}
      </CardContent>
      {file && (
        <CardFooter className="justify-end">
          <Button onClick={() => file && upload.mutate(file)} disabled={Boolean(error) || upload.isPending}>
            {upload.isPending ? <Spinner /> : <Upload />} Upload photo
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
