"use client";

import * as React from "react";
import { Label } from "./label";
import { cn } from "@/lib/utils";

interface FormContextValue {
  errors: Record<string, string | undefined>;
}

const FormContext = React.createContext<FormContextValue | undefined>(undefined);

const Form = ({ children, className, ...props }: React.HTMLAttributes<HTMLFormElement>) => {
  const [errors, setErrors] = React.useState<Record<string, string | undefined>>({});

  return (
    <FormContext.Provider value={{ errors }}>
      <form className={cn("space-y-4", className)} {...props}>
        {children}
      </form>
    </FormContext.Provider>
  );
};

const FormItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return <div ref={ref} className={cn("space-y-2", className)} {...props} />;
});
FormItem.displayName = "FormItem";

const FormLabel = React.forwardRef<
  HTMLLabelElement,
  React.LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  return <Label ref={ref} className={className} {...props} />;
});
FormLabel.displayName = "FormLabel";

const FormMessage = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement> & { name?: string }
>(({ className, name, ...props }, ref) => {
  const context = React.useContext(FormContext);
  const error = name && context?.errors[name];

  if (!error) return null;

  return (
    <p
      ref={ref}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {error}
    </p>
  );
});
FormMessage.displayName = "FormMessage";

export { Form, FormItem, FormLabel, FormMessage };

