import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { FileText, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import { toast } from "sonner"
import { REQUIRED_DOCS } from "../constants"

export default function DocumentsStep({
    onSubmit,
    onFinishLater,
    defaultStatuses = {},
}: {
    onSubmit: (docStatuses: Record<string, string>) => void
    onFinishLater: (docStatuses: Record<string, string>) => void
    defaultStatuses?: Record<string, string>
}) {
    const [statuses, setStatuses] = useState<Record<string, string>>(
        REQUIRED_DOCS.reduce((acc, doc) => ({
            ...acc,
            [doc.id]: defaultStatuses[doc.id] || "pending"
        }), {})
    )

    const handleChange = (docId: string, value: string) => {
        setStatuses(prev => ({ ...prev, [docId]: value }))
    }

    const handleSubmit = () => {
        const anyUnverified = REQUIRED_DOCS.some(doc => statuses[doc.id] !== "verified");

        if (anyUnverified) {
            toast.error("All documents must be verified before finalizing admission.", {
                description: "Update the status of all documents to 'Verified' to proceed.",
                icon: <AlertCircle className="size-4 text-red-500" />
            });
            return;
        }

        onSubmit(statuses)
    }

    const handleFinishLater = () => {
        onFinishLater(statuses)
    }

    const getStatusStyles = (status: string) => {
        switch (status) {
            case "verified":
                return "border-emerald-300 bg-emerald-50/50"
            case "submitted":
                return "border-blue-300 bg-blue-50/50"
            case "pending":
            default:
                return "border-amber-200 bg-amber-50/50"
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "verified":
                return <CheckCircle2 className="size-5 text-emerald-500" />
            case "submitted":
                return <FileText className="size-5 text-blue-500" />
            case "pending":
            default:
                return <Clock className="size-5 text-amber-500" />
        }
    }

    return (
        <div className="space-y-6 flex flex-col h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {REQUIRED_DOCS.map(doc => {
                    const currentStatus = statuses[doc.id] || "pending"

                    return (
                        <div
                            key={doc.id}
                            className={`relative border-2 rounded-xl p-5 transition-all duration-200 ${getStatusStyles(currentStatus)}`}
                        >
                            <div className="flex items-center gap-3 mb-4">
                                {getStatusIcon(currentStatus)}
                                <Label className="text-sm font-semibold text-brand-text flex-1">
                                    {doc.label} <span className="text-red-500">*</span>
                                </Label>
                            </div>

                            <Select
                                value={currentStatus}
                                onValueChange={(val) => handleChange(doc.id, val)}
                            >
                                <SelectTrigger className="w-full bg-white">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="submitted">Submitted</SelectItem>
                                    <SelectItem value="verified">Verified</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )
                })}
            </div>

            <div className="flex justify-end items-center gap-3 pt-4 mt-auto">
                <button
                    type="button"
                    onClick={handleFinishLater}
                    className="text-sm font-medium text-gray-500 hover:text-[#010098] border border-gray-200 hover:border-[#010098]/30 bg-white px-4 h-10 rounded-md transition-all"
                >
                    Finish Later
                </button>
                <Button onClick={handleSubmit} variant="yellow" className="px-8 h-10 text-sm font-semibold">
                    Complete Final Review
                </Button>
            </div>
        </div>
    )
}
