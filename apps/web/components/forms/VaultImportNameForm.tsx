'use client';
import { Input } from '../ui/input';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Button } from '../ui/button';
import { PropsWithChildren } from 'react';
import { VaultNameSchema } from '@/lib/types/vaults';

const formSchema = z.object({
  address: z.string(),
  name: VaultNameSchema
});

interface VaultImportNameFormProps extends PropsWithChildren {
  address: string;
  onSubmit: (values: z.infer<typeof formSchema>) => void;
}

export default function VaultImportNameForm({
  address,
  onSubmit,
  children
}: VaultImportNameFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address,
      name: 'My Petra Vault'
    }
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="address"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Vault Address</FormLabel>
              <FormControl>
                <Input
                  placeholder="0x1234567890abcdef"
                  disabled
                  readOnly
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <br />
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
        {children}
        <br />
        <Button type="submit" className="w-full">
          Import Vault
        </Button>
      </form>
    </Form>
  );
}
