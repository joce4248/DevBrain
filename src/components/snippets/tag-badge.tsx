import { Badge } from "@/components/ui/badge";
import type { Tag } from "@/types";

export function TagBadge({ tag }: { tag: Tag }) {
  return (
    <Badge
      variant="outline"
      className="text-[10px]"
      style={{
        borderColor: tag.color,
        color: tag.color,
      }}
    >
      {tag.name}
    </Badge>
  );
}
