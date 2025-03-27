import { Input } from './ui/input';
import { Button } from './ui/button';
import { useState } from 'react';
import { FormMessage } from './ui/form';
import { PlusIcon, Cross1Icon } from '@radix-ui/react-icons';

interface ArrayInputProps {
  value?: string[];
  onChange: (value: string[]) => void;
}

export default function FormArrayInput({
  value,
  onChange,
  ...props
}: ArrayInputProps) {
  const [values, setValues] = useState<string[]>(value ?? []);

  const handleChange = (index: number, value: string) => {
    const newValues = [...values];
    newValues[index] = value;
    setValues(newValues);
    onChange(newValues);
  };

  const handleDelete = (index: number) => {
    const newValues = [...values];
    newValues.splice(index, 1);
    setValues(newValues);
    onChange(newValues);
  };

  return (
    <div {...props}>
      <div className="grid gap-2">
        {values?.map((value, index) => (
          <div key={index}>
            <div className="flex gap-2">
              <Input
                value={value}
                onChange={(e) => handleChange(index, e.target.value)}
                data-testid={`array-input-${index}`}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleDelete(index)}
              >
                <Cross1Icon className="w-4 h-4" />
              </Button>
            </div>
            <FormMessage arrayFieldIndex={index} className="mt-2" />
          </div>
        ))}
      </div>
      <div className="flex gap-2 mt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => setValues([...values, ''])}
          data-testid="add-array-input"
        >
          <PlusIcon className="w-4 h-4" />
          Add Argument
        </Button>
      </div>
    </div>
  );
}
