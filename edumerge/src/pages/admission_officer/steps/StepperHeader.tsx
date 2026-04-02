import { Building2, GraduationCap, User, CreditCard, FileText, CheckCircle, Check } from "lucide-react"
import { steps } from "../constants"

const STEP_ICONS = [Building2, GraduationCap, User, CreditCard, FileText, CheckCircle]

export default function StepperHeader({ currentIndex }: { currentIndex: number }) {
    return (
        <div className="w-full mb-4">
            <div className="flex items-center justify-between relative">
                {steps.map((step, i) => {
                    const Icon = STEP_ICONS[i]
                    const isCompleted = i < currentIndex
                    const isCurrent = i === currentIndex

                    return (
                        <div key={step.id} className="flex flex-col items-center relative flex-1">
                            {i > 0 && (
                                <div
                                    className={`absolute top-5 right-1/2 w-full h-0.5 -translate-y-1/2 transition-colors duration-500 z-10 ${isCompleted ? "bg-emerald-500" : isCurrent ? "bg-[#010098]" : "bg-gray-200"
                                        }`}
                                    style={{ left: "-50%" }}
                                />
                            )}

                            <div
                                className={`relative z-20 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-500 shadow-sm ${isCompleted
                                    ? "bg-emerald-500 text-white shadow-emerald-200 shadow-md"
                                    : isCurrent
                                        ? "bg-[#010098] text-white shadow-blue-200 shadow-lg ring-4 ring-blue-100"
                                        : "bg-gray-100 text-gray-400 border-2 border-gray-200"
                                    }`}
                            >
                                {isCompleted ? (
                                    <Check className="size-5" />
                                ) : (
                                    <Icon className="size-5" />
                                )}
                            </div>

                            <span
                                className={`mt-2 text-xs font-semibold tracking-wide text-center transition-colors duration-300 ${isCompleted
                                    ? "text-emerald-600"
                                    : isCurrent
                                        ? "text-[#010098]"
                                        : "text-gray-400"
                                    }`}
                            >
                                {step.title}
                            </span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
