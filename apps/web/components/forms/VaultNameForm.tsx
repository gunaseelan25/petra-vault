"use client";
import { Input } from "../ui/input";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "../ui/button";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "The name must be at least 2 characters.",
  }),
});

interface VaultNameFormProps {
  onSubmit: (values: z.infer<typeof formSchema>) => void;
}

export default function VaultNameForm({ onSubmit }: VaultNameFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "My Petra Vault",
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="My Petra Vault" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <br />
        <Button type="submit" className="w-full">
          Create a New Vault
        </Button>
      </form>
    </Form>
  );
}
