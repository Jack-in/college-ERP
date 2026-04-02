import { useState, useRef, useEffect } from "react"
import { Controller } from "react-hook-form"
import { Field, FieldLabel, FieldError } from "@/components/ui/field"
import { Loader2, ChevronDown, Plus, Check } from "lucide-react"

interface FormCreatableSelectProps {
    control: any
    name: string
    label: string
    placeholder?: string
    options: string[]
    loading?: boolean
    loadingText?: string
    disabled?: boolean
    onCreateOption?: (value: string) => void
}

export function FormCreatableSelect({
    control,
    name,
    label,
    placeholder,
    options,
    loading,
    loadingText,
    disabled,
    onCreateOption,
}: FormCreatableSelectProps) {
    const [open, setOpen] = useState(false)
    const [search, setSearch] = useState("")
    const containerRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handler)
        return () => document.removeEventListener("mousedown", handler)
    }, [])

    const filtered = options.filter(opt =>
        opt.toLowerCase().includes(search.toLowerCase())
    )

    const showCreate = search.trim() && !options.some(o => o.toLowerCase() === search.toLowerCase().trim())

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
                            <span className="text-sm text-brand-muted">{loadingText || "Loading..."}</span>
                        </div>
                    ) : (
                        <div ref={containerRef} className="relative">
                            <div
                                className={`flex items-center h-9 w-full rounded-lg border px-3 transition-colors ${disabled
                                        ? "bg-gray-100 cursor-not-allowed opacity-60"
                                        : "bg-white cursor-pointer hover:border-gray-400"
                                    } ${open ? "border-brand-blue ring-2 ring-blue-100" : "border-gray-200"}`}
                                onClick={() => {
                                    if (!disabled) {
                                        setOpen(true)
                                        setSearch("")
                                        setTimeout(() => inputRef.current?.focus(), 0)
                                    }
                                }}
                            >
                                {open ? (
                                    <input
                                        ref={inputRef}
                                        className="flex-1 text-sm outline-none bg-transparent"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder={placeholder || `Search or create ${label.toLowerCase()}...`}
                                    />
                                ) : (
                                    <span className={`flex-1 text-sm truncate ${field.value ? "text-brand-text" : "text-gray-400"}`}>
                                        {field.value || placeholder || `Select ${label.toLowerCase()}`}
                                    </span>
                                )}
                                <ChevronDown className={`size-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
                            </div>

                            {open && (
                                <div className="absolute z-50 top-full mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                                    {filtered.length === 0 && !showCreate && (
                                        <div className="px-3 py-2 text-sm text-gray-400">No options found</div>
                                    )}

                                    {filtered.map(opt => (
                                        <div
                                            key={opt}
                                            className={`flex items-center justify-between px-3 py-2 text-sm cursor-pointer transition-colors ${field.value === opt
                                                    ? "bg-blue-50 text-brand-blue font-medium"
                                                    : "hover:bg-gray-50 text-brand-text"
                                                }`}
                                            onClick={() => {
                                                field.onChange(opt)
                                                setOpen(false)
                                                setSearch("")
                                            }}
                                        >
                                            {opt}
                                            {field.value === opt && <Check className="size-4 text-brand-blue" />}
                                        </div>
                                    ))}

                                    {showCreate && (
                                        <div
                                            className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer text-emerald-600 font-medium hover:bg-emerald-50 border-t border-gray-100"
                                            onClick={() => {
                                                const trimmed = search.trim()
                                                field.onChange(trimmed)
                                                onCreateOption?.(trimmed)
                                                setOpen(false)
                                                setSearch("")
                                            }}
                                        >
                                            <Plus className="size-4" />
                                            Create "{search.trim()}"
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
            )}
        />
    )
}
