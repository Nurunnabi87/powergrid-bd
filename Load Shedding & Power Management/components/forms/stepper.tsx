import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StepDef {
  title: string;
  description?: string;
}

/** Horizontal progress indicator for multi-step (wizard) forms. */
export function Stepper({ steps, current }: { steps: StepDef[]; current: number }) {
  return (
    <ol className="flex items-start gap-2" aria-label="Form progress">
      {steps.map((step, index) => {
        const done = index < current;
        const active = index === current;
        return (
          <li key={step.title} className="flex flex-1 flex-col gap-2" aria-current={active ? "step" : undefined}>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold",
                  done && "border-primary bg-primary text-primary-foreground",
                  active && "border-primary text-foreground ring-4 ring-primary/20",
                  !done && !active && "border-border text-muted-foreground"
                )}
              >
                {done ? <Check className="size-4" aria-hidden /> : index + 1}
              </span>
              {index < steps.length - 1 && (
                <span aria-hidden className={cn("h-0.5 flex-1 rounded-full", done ? "bg-primary" : "bg-border")} />
              )}
            </div>
            <div className="hidden sm:block">
              <p className={cn("text-sm font-medium", !active && !done && "text-muted-foreground")}>{step.title}</p>
              {step.description && <p className="text-xs text-muted-foreground">{step.description}</p>}
            </div>
            <span className="sr-only">
              Step {index + 1} of {steps.length}: {step.title}
              {done ? " (completed)" : active ? " (current)" : ""}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
