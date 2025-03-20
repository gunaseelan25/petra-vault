"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  Form,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { isAddress } from "@/lib/address";

const formSchema = z.object({
  amount: z.coerce
    .number()
    .min(0)
    .refine((val) => val > 0, { message: "Threshold must be greater than 0" }),
  recipient: z
    .string()
    .min(1, "Address is required")
    .refine((val) => isAddress(val), { message: "Invalid Aptos address" }),
});

export type SendCoinsProposalFormValues = z.infer<typeof formSchema>;

interface SendCoinsProposalFormProps {
  onSubmit: (values: SendCoinsProposalFormValues) => void;
}

export default function SendCoinsProposalForm({
  onSubmit,
}: SendCoinsProposalFormProps) {
  const form = useForm<SendCoinsProposalFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { amount: 0, recipient: "" },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="recipient"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Recipient</FormLabel>
              <FormControl>
                <Input placeholder="0x0" {...field} />
              </FormControl>
              <FormDescription>
                This is the address of the recipient.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input type="number" {...field} />
              </FormControl>
              <FormDescription>
                This is the amount of coins you want to send.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Create Proposal</Button>
      </form>
    </Form>
  );
}
