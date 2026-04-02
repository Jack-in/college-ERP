import { Controller } from "react-hook-form"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface FormRadioGroupProps {
    control: any
    name: string
    label: string
    options: { value: string; label: string }[] | string[]
}

export function FormRadioGroup({ control, name, label, options }: FormRadioGroupProps) {
    const normalizedOptions = options.map(opt =>
        typeof opt === "string" ? { value: opt, label: opt } : opt
    )

    return (
        <Controller
            control={control}
            name={name}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="space-y-3">
                    <FieldLabel>{label}</FieldLabel>
                    <RadioGroup value={field.value} onValueChange={field.onChange} className="flex gap-6">
                        {normalizedOptions.map(opt => (
                            <FieldLabel key={opt.value} className="flex items-center gap-2">
                                <RadioGroupItem value={opt.value} />
                                <span>{opt.label}</span>
                            </FieldLabel>
                        ))}
                    </RadioGroup>
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
            )}
        />
    )
}
