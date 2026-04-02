import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react"
export default function FeePaymentStep({
    quota,
    amount,
    onSubmit,
}: {
    quota: string
    amount?: number
    onSubmit: () => void
}) {
    const navigate = useNavigate()
    const [processing, setProcessing] = useState(false)
    const [feeAmount, setFeeAmount] = useState<number | null>(amount || null)

    useEffect(() => {
        if (amount) {
            setFeeAmount(amount);
        }
    }, [amount])

    const handlePay = async () => {
        if (!feeAmount) return

        setProcessing(true)
        try {
            await new Promise(res => setTimeout(res, 1500))
            onSubmit()
        } finally {
            setProcessing(false)
        }
    }

    if (feeAmount === null) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-brand-muted gap-3">
                <Loader2 className="size-6 animate-spin text-brand-blue" />
                <span className="text-sm">Calculating fee ...</span>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-row justify-center gap-10">
                <p className="text-xl font-semibold">Fee Payment</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-semibold text-brand-muted uppercase tracking-wider">Fee Summary</h3>
                <div className="flex items-end justify-between">
                    <div>
                        <p className="text-sm text-brand-muted">Quota</p>
                        <p className="text-lg font-bold text-brand-text capitalize">{quota}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-brand-muted">Total Fee</p>
                        <p className="text-3xl font-bold text-[#010098]">
                            ₹{feeAmount.toLocaleString("en-IN")}
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center pt-4">
                <button
                    type="button"
                    onClick={() => navigate("/admission-officer")}
                    className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors flex flex-row items-center gap-2"
                >
                    <ArrowLeft className="size-4" />
                    Cancel
                </button>
                <Button
                    onClick={handlePay}
                    variant="yellow"
                    className="px-8 h-10 text-sm font-semibold"
                    disabled={processing}
                >
                    {processing ? (
                        <>
                            <Loader2 className="size-4 animate-spin mr-2" />
                            Processing Payment...
                        </>
                    ) : (
                        `Pay ₹${feeAmount.toLocaleString("en-IN")} & Proceed`
                    )}
                    <ArrowRight className="size-4 ml-2" />
                </Button>
            </div>
        </div>
    )
}
