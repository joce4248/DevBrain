import { Badge } from "@/components/ui/badge";
import { LANGUAGE_DISPLAY_NAMES } from "@/lib/constants";

export function LanguageBadge({ language }: { language: string }) {
  return (
    <Badge variant="secondary" className="font-mono text-[10px]">
      {LANGUAGE_DISPLAY_NAMES[language] || language}
    </Badge>
  );
}
