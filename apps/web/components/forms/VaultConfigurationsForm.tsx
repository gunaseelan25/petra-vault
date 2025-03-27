import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Plus, Trash2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useAccount } from '@aptos-labs/react';
import { VaultSignerSchema } from '@/lib/types/signers';
import { AccountAddress } from '@aptos-labs/ts-sdk';
import { useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  signers: z.array(VaultSignerSchema).min(1, {
    message: 'At least one signer is required.'
  }),
  signaturesRequired: z.coerce
    .number()
    .min(1, { message: 'The signatures required must be at least 1.' })
    .max(32, { message: 'The signatures required must be less than 32' })
    .refine((val) => val > 0, {
      message: 'Signatures required must be greater than 0'
    })
});

type FormValues = z.infer<typeof formSchema>;

interface VaultConfigurationsFormProps {
  onSubmit: (values: FormValues) => void;
}

export default function VaultConfigurationsForm({
  onSubmit
}: VaultConfigurationsFormProps) {
  const account = useAccount();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      signers: [
        {
          address: account?.address?.toString() ?? '',
          name: 'Me'
        }
      ],
      signaturesRequired: 1
    }
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'signers'
  });

  useEffect(() => {
    if (account?.address && fields[0] && fields[0]?.address === undefined) {
      fields[0].address = account.address;
      form.setValue('signers', fields);
    }
  }, [account, fields, form]);

  useEffect(() => {
    if (fields.length < form.getValues('signaturesRequired')) {
      form.setValue('signaturesRequired', fields.length);
    }
  }, [fields, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <div>
            <h3 className="font-display tracking-wide font-semibold">Owners</h3>
            <p className="text-muted-foreground text-sm mb-4">
              The owners that can vote, propose, and execute transactions.
            </p>
            <div className="flex flex-col gap-2 mb-2">
              {fields.map((field: { id: string }, index: number) => (
                <motion.div key={field.id} className="flex gap-4 items-start">
                  <FormField
                    control={form.control}
                    name={`signers.${index}.name`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        {index === 0 && <FormLabel>Name</FormLabel>}
                        <FormControl>
                          <Input
                            placeholder="Signer name"
                            data-testid={`owner-name-input-${index}`}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name={`signers.${index}.address`}
                    render={({ field }) => {
                      return (
                        <FormItem className="flex-1">
                          {index === 0 && <FormLabel>Address</FormLabel>}
                          <FormControl>
                            <Input
                              placeholder="0x..."
                              {...field}
                              data-testid={`owner-address-input-${index}`}
                              value={
                                index === 0
                                  ? (account?.address?.toString() ?? '')
                                  : field.value instanceof AccountAddress &&
                                      field.value.equals(AccountAddress.ZERO)
                                    ? ''
                                    : field.value.toString()
                              }
                              readOnly={index === 0}
                              className={
                                index === 0 ? 'bg-muted cursor-not-allowed' : ''
                              }
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      );
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={cn(
                      index === 0 ? 'pointer-events-none' : undefined
                    )}
                    onClick={() => remove(index)}
                  >
                    <Trash2
                      className={cn(
                        'h-4 w-4',
                        index === 0 ? 'hidden' : undefined
                      )}
                    />
                  </Button>
                </motion.div>
              ))}
            </div>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() =>
                append({
                  address: AccountAddress.ZERO,
                  name: ''
                })
              }
              data-testid="onboarding-add-owner-button"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Owner
            </Button>
          </div>
        </div>

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
                    value={field.value.toString()}
                    defaultValue={field.value.toString()}
                  >
                    <FormControl>
                      <SelectTrigger data-testid="signatures-required-select">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Array.from({ length: fields.length }, (_, i) => (
                        <SelectItem
                          key={i}
                          value={(i + 1).toString()}
                          data-testid={`signatures-required-select-item-${i + 1}`}
                        >
                          {i + 1}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button
          type="submit"
          className="w-full"
          data-testid="save-vault-config-button"
        >
          Save Configuration
        </Button>
      </form>
    </Form>
  );
}
