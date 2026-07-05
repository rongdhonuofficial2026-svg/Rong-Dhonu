import { cn } from "@/lib/utils"

interface SectionHeadingProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  alignment?: "left" | "center" | "right"
}

export function SectionHeading({
  title,
  subtitle,
  alignment = "center",
  className,
  ...props
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col mb-12",
        alignment === "center" && "items-center text-center",
        alignment === "left" && "items-start text-left",
        alignment === "right" && "items-end text-right",
        className
      )}
      {...props}
    >
      <h2 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-foreground">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-4 max-w-2xl text-lg text-muted-foreground font-sans">
          {subtitle}
        </p>
      )}
      <div className={cn("mt-6 h-1 w-24 bg-accent", alignment === "center" && "mx-auto")} />
    </div>
  )
}
