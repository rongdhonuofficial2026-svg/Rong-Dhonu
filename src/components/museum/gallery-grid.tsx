import { cn } from "@/lib/utils"

interface GalleryGridProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  columns?: "2" | "3" | "4"
}

export function GalleryGrid({
  children,
  columns = "3",
  className,
  ...props
}: GalleryGridProps) {
  return (
    <div
      className={cn(
        "columns-1 gap-6 sm:columns-2 space-y-6",
        columns === "3" && "lg:columns-3",
        columns === "4" && "lg:columns-3 xl:columns-4",
        className
      )}
      {...props}
    >
      {/* 
        Wrap child items with <div className="break-inside-avoid mb-6"> 
        to prevent them from being split across columns 
      */}
      {children}
    </div>
  )
}
