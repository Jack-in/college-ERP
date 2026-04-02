import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"

import { ArrowLeft, Copy, Check } from "lucide-react"

export default function SuccessStep({
    admissionNo,
}: {
    admissionNo: string
}) {
    const navigate = useNavigate()
    const [copiedField, setCopiedField] = useState<string | null>(null)

    const handleCopy = (value: string, field: string) => {
        navigator.clipboard.writeText(value)
        setCopiedField(field)
        setTimeout(() => setCopiedField(null), 2000)
    }

    return (
        <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-brand-text">Admission Successful!</h2>
                <p className="text-brand-muted">The student has been successfully admitted. Seat confirmed.</p>
            </div>

            <div className="bg-gradient-to-br from-[#010098] to-[#000070] text-white rounded-2xl p-5 w-full max-w-sm shadow-xl">
                <p className="text-xs font-medium uppercase tracking-wider text-blue-200 mb-1">Admission Number</p>
                <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold tracking-wider">{admissionNo}</span>
                    <button
                        onClick={() => handleCopy(admissionNo, "adm")}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                    >
                        {copiedField === "adm" ? <Check className="size-4" /> : <Copy className="size-4" />}
                    </button>
                </div>
                {copiedField === "adm" && (
                    <p className="text-xs text-blue-200 mt-2 animate-[fadeIn_0.2s_ease-in]">
                        Copied to clipboard!
                    </p>
                )}
            </div>

            <Button
                onClick={() => navigate("/admission-officer")}
                variant="outline"
                className="px-8 h-10 mt-4"
            >
                <ArrowLeft className="size-4 mr-2" />
                Back to Dashboard
            </Button>
        </div>
    )
}
