import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FieldLabelProps {
  htmlFor?: string;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
  className?: string;
}

/** Consistent form label with required/optional indicators. */
export function FieldLabel({
  htmlFor,
  required,
  optional,
  children,
  className,
}: FieldLabelProps) {
  return (
    <Label htmlFor={htmlFor} className={cn(className)}>
      {children}
      {required && (
        <span className="ml-0.5 text-destructive" aria-hidden="true">
          *
        </span>
      )}
      {optional && !required && (
        <span className="ml-1 text-xs font-normal text-muted-foreground">
          (optional)
        </span>
      )}
    </Label>
  );
}

interface FieldErrorProps {
  id?: string;
  message?: string | null;
}

export function FieldError({ id, message }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-sm text-destructive">
      {message}
    </p>
  );
}
