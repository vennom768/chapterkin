"use client";

import { deleteChild } from "@/lib/actions/children";
import { Button } from "@/components/ui/button";

export function DeleteChildButton({
  childId,
  name,
}: {
  childId: string;
  name: string;
}) {
  return (
    <Button
      variant="danger"
      type="button"
      onClick={async () => {
        const confirmed = window.confirm(
          `Remove ${name} from the family? Their stories will be removed too.`,
        );
        if (!confirmed) return;
        await deleteChild(childId);
      }}
    >
      Delete profile
    </Button>
  );
}
