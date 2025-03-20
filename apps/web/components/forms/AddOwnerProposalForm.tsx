"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
  Form,
} from "../ui/form";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { isAddress } from "@/lib/address";
import { Separator } from "../ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectValue,
  SelectTrigger,
} from "../ui/select";

const formSchema = z.object({
  address: z
    .string()
    .min(1, "Address is required")
    .refine((val) => isAddress(val), { message: "Invalid Aptos address" }),
  name: z.string().min(1, "Name is required"),
  signaturesRequired: z.coerce
    .number()
    .min(1, "Signatures required must be greater than 0"),
});

export type AddOwnerProposalFormValues = z.infer<typeof formSchema>;

interface AddOwnerProposalFormProps {
  onSubmit: (values: AddOwnerProposalFormValues) => void;
  vaultAddress: string;
  owners: string[];
  signaturesRequired: number;
}

export default function AddOwnerProposalForm({
  onSubmit,
  owners,
  signaturesRequired,
  vaultAddress,
}: AddOwnerProposalFormProps) {
  const formSchemaWithOwners = formSchema.refine(
    (data) => ![...owners, vaultAddress].includes(data.address),
    { message: "Address is already an owner", path: ["address"] }
  );

  const form = useForm<AddOwnerProposalFormValues>({
    resolver: zodResolver(formSchemaWithOwners),
    defaultValues: {
      address: "",
      name: "",
      signaturesRequired,
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 w-full">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  className="w-full"
                  placeholder={`Owner ${owners.length + 1}`}
                  type="text"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel>Address</FormLabel>
              <FormControl>
                <Input className="w-full" placeholder="0x..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        <div>
          <h3 className="font-display tracking-wide font-semibold">
            Signatures Required
          </h3>
          <p className="text-muted-foreground text-sm">
            The number of signatures required to execute a transaction.
          </p>
          <div className="flex items-center mt-4 gap-2">
            <FormField
              control={form.control}
              name="signaturesRequired"
              render={({ field }) => (
                <FormItem>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a verified email to display" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Array.from({ length: owners.length + 1 }, (_, i) => (
                        <SelectItem key={i} value={(i + 1).toString()}>
                          {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <span className="text-muted-foreground font-display text-sm">
              signatures required out of {owners.length + 1}
            </span>
          </div>
        </div>

        <Button type="submit">Draft Proposal</Button>
      </form>
    </Form>
  );
}
