import { Controller } from "react-hook-form"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface FormSelectOption {
    value: string
    label: string
}

interface FormSelectProps {
    control: any
    name: string
    label: string
    placeholder?: string
    options: FormSelectOption[] | string[]
    loading?: boolean
    loadingText?: string
    disabled?: boolean
}

export function FormSelect({ control, name, label, placeholder, options, loading, loadingText, disabled }: FormSelectProps) {
    const normalizedOptions: FormSelectOption[] = options.map(opt =>
        typeof opt === "string" ? { value: opt, label: opt } : opt
    )

    return (
        <Controller
            control={control}
            name={name}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="space-y-2">
                    <FieldLabel>{label}</FieldLabel>
                    {loading ? (
                        <div className="flex items-center gap-2 h-9 px-3 border rounded-lg bg-gray-50">
                            <Loader2 className="size-4 animate-spin text-brand-blue" />
                            <span className="text-sm text-brand-muted">{loadingText || `Loading...`}</span>
                        </div>
                    ) : (
                        <Select value={field.value} onValueChange={field.onChange} disabled={disabled}>
                            <SelectTrigger className="w-full h-9" disabled={disabled}>
                                <SelectValue placeholder={placeholder || `Select ${label.toLowerCase()}`} />
                            </SelectTrigger>
                            <SelectContent>
                                {normalizedOptions.map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
            )}
        />
    )
}
