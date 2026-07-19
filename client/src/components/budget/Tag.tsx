// client/src/components/budget/Tag.tsx
// Ported/adapted from needim/gider.im-pwa (tag.tsx). Small colored pill for tags/groups.
import * as React from "react";
import { cn } from "@/lib/utils";

interface TagProps {
  name: string;
  color?: string; // hex or tailwind-ish token
  className?: string;
}

// Map a stored color (hex) to a soft background + readable text.
function tagClasses(color?: string) {
  if (!color) return "bg-muted text-muted-foreground";
  return "";
}

export function Tag({ name, color, className }: TagProps) {
  const style = color
    ? ({ backgroundColor: `${color}22`, color } as React.CSSProperties)
    : undefined;
  return (
    <span
      style={style}
      className={cn(
        "inline-flex max-w-full items-center truncate rounded-full px-2 py-0.5 text-[11px] font-medium",
        tagClasses(color),
        className
      )}
    >
      {name}
    </span>
  );
}
