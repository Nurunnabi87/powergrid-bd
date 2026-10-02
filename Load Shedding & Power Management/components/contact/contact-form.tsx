"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck, Send } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { FormField } from "@/components/forms/form-field";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useApiMutation } from "@/hooks/use-api-mutation";
import { api } from "@/lib/api/client";
import { contactSchema, type ContactValues } from "@/lib/validations/contact";

export function ContactForm() {
  const [reference, setReference] = useState<string | null>(null);

  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", subject: "", message: "" },
    mode: "onTouched",
  });

  const send = useApiMutation<{ data: { id: string } }, ContactValues, ContactValues>({
    mutationFn: ({ phone, ...values }) =>
      api.post<{ id: string }>("/public/contact", { ...values, ...(phone ? { phone } : {}) }),
    setError: form.setError,
    successMessage: "Message sent — we'll be in touch soon",
    onSuccess: (result) => {
      setReference(result.data.id);
      form.reset();
    },
  });

  const message = useWatch({ control: form.control, name: "message" });

  if (reference) {
    return (
      <div role="status" className="flex flex-col items-center gap-4 py-10 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-success/12 text-success">
          <CircleCheck className="size-7" aria-hidden />
        </span>
        <div className="space-y-1">
          <h3 className="text-xl font-semibold">Thanks, your message is on its way</h3>
          <p className="text-muted-foreground">A confirmation has been sent to your email. Our team replies within one working day.</p>
          <p className="font-mono text-xs text-muted-foreground">Reference: {reference}</p>
        </div>
        <Button variant="outline" onClick={() => setReference(null)}>
          Send another message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={form.handleSubmit((values) => send.mutate(values))} noValidate>
      <FieldGroup>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField control={form.control} name="name" label="Your name">
            {({ field, id, aria }) => <Input id={id} autoComplete="name" {...field} {...aria} />}
          </FormField>
          <FormField control={form.control} name="email" label="Email">
            {({ field, id, aria }) => <Input id={id} type="email" autoComplete="email" {...field} {...aria} />}
          </FormField>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <FormField control={form.control} name="phone" label="Mobile (optional)">
            {({ field, id, aria }) => (
              <Input id={id} type="tel" inputMode="numeric" placeholder="017XXXXXXXX" {...field} {...aria} />
            )}
          </FormField>
          <FormField control={form.control} name="subject" label="Subject">
            {({ field, id, aria }) => <Input id={id} placeholder="e.g. Billing query for meter MTR-100001" {...field} {...aria} />}
          </FormField>
        </div>
        <FormField
          control={form.control}
          name="message"
          label="Message"
          description={`${message.length}/2000 characters`}
        >
          {({ field, id, aria }) => <Textarea id={id} rows={6} {...field} {...aria} />}
        </FormField>
        <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={send.isPending}>
          {send.isPending ? <Spinner /> : <Send />}
          {send.isPending ? "Sending…" : "Send message"}
        </Button>
      </FieldGroup>
    </form>
  );
}
