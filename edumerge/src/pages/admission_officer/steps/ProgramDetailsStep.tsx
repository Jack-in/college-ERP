
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { FormSelect } from "@/components/ui/form-select"

import { Users, AlertTriangle, ArrowRight, ArrowLeft } from "lucide-react"
import { usePrograms } from "@/api/hooks/useAdmin"

import { programDetailsSchema, type ProgramDetailsValues } from "@/schemas/admissionOfficer"

export default function ProgramDetailsStep({
    onSubmit,
    defaultValues,
    admissionDetails,
}: {
    onSubmit: (values: ProgramDetailsValues) => void
    defaultValues?: Partial<ProgramDetailsValues>
    admissionDetails: { instituteName: string; academicYear: string; courseType: string; entryType: string; quota: string }
}) {
    const navigate = useNavigate()

    const form = useForm<ProgramDetailsValues>({
        resolver: zodResolver(programDetailsSchema),
        defaultValues: {
            campus: "",
            department: "",
            branch: "",
            ...defaultValues,
        },
    })


    const campus = form.watch("campus")
    const department = form.watch("department")
    const branch = form.watch("branch")

    const { data: allPrograms = [], isLoading: loadingPrograms } = usePrograms({
        institution: admissionDetails.instituteName,
        academicYear: admissionDetails.academicYear,
        courseType: admissionDetails.courseType,
        entryType: admissionDetails.entryType,
        quota: admissionDetails.quota
    })

    const availableCampuses = Array.from(new Set(allPrograms.map(p => p.campus?.name))).filter(Boolean) as string[];
    
    const availableDepartments = Array.from(new Set(allPrograms
        .filter(p => !campus || p.campus?.name === campus)
        .map(p => p.department?.name)
    )).filter(Boolean) as string[];
    
    const availableBranches = Array.from(new Set(allPrograms
        .filter(p => (!campus || p.campus?.name === campus) && (!department || p.department?.name === department))
        .map(p => p.branch?.name)
    )).filter(Boolean) as string[];

    const selectedProgram = allPrograms.find(p => 
        p.campus?.name === campus &&
        p.department?.name === department &&
        p.branch?.name === branch
    )
    const selectedQuota = selectedProgram?.quotas?.find(q => q.quotaName === admissionDetails.quota)

    const seatInfo = selectedQuota ? {
        totalSeats: selectedQuota.totalSeats,
        availableSeats: selectedQuota.totalSeats - selectedQuota.occupiedSeats
    } : null

    const noSeats = seatInfo !== null && seatInfo.availableSeats <= 0

    const handleFormSubmit = (values: ProgramDetailsValues) => {
        onSubmit({
            ...values,
            programQuotaId: selectedQuota?.id
        })
    }

    return (
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
            <div className="flex flex-row justify-center gap-10">
                <p className="text-xl font-semibold">Program Details</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <FormSelect
                    control={form.control}
                    name="campus"
                    label="Campus"
                    options={availableCampuses}
                    loading={loadingPrograms}
                />
                <FormSelect
                    control={form.control}
                    name="department"
                    label="Department"
                    options={availableDepartments}
                    loading={loadingPrograms}
                    disabled={!campus}
                />
                <FormSelect
                    control={form.control}
                    name="branch"
                    label="Branch"
                    options={availableBranches}
                    loading={loadingPrograms}
                    disabled={!department}
                />
            </div>

            {branch && (
                <div className={`rounded-xl border-2 p-5 transition-all duration-300 ${loadingPrograms
                    ? "border-gray-200 bg-gray-50"
                    : noSeats
                        ? "border-red-200 bg-red-50"
                        : "border-emerald-200 bg-emerald-50"
                    }`}>
                    {loadingPrograms ? (
                        <div className="flex items-center gap-3">
                            <span className="text-sm text-brand-muted italic">Fetching seat availability...</span>
                        </div>
                    ) : seatInfo ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                {noSeats ? (
                                    <AlertTriangle className="size-5 text-red-500" />
                                ) : (
                                    <Users className="size-5 text-emerald-600" />
                                )}
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-muted">
                                    Seat Availability — {branch} ({admissionDetails.quota})
                                </h3>
                            </div>

                            <div className="flex items-end gap-8">
                                <div>
                                    <p className="text-xs text-brand-muted">Total Seats</p>
                                    <p className="text-2xl font-bold text-brand-text">{seatInfo.totalSeats}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-brand-muted">Available Seats</p>
                                    <p className={`text-2xl font-bold ${noSeats ? "text-red-500" : "text-emerald-600"}`}>
                                        {seatInfo.availableSeats}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-xs text-brand-muted">Occupied</p>
                                    <p className="text-2xl font-bold text-amber-500">
                                        {seatInfo.totalSeats - seatInfo.availableSeats}
                                    </p>
                                </div>
                            </div>

                            {noSeats && (
                                <p className="text-sm text-red-600 font-medium mt-2">
                                    No seats available for this branch. Please select a different branch.
                                </p>
                            )}
                        </div>
                    ) : (
                        <p className="text-sm text-red-500 italic">No program configuration found for this selection.</p>
                    )}
                </div>
            )}

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
                    type="submit"
                    variant="yellow"
                    className="px-8 h-10 text-sm font-semibold"
                    disabled={noSeats || !branch || !selectedQuota}
                >
                    Proceed
                    <ArrowRight className="size-4 ml-2" />
                </Button>
            </div>
        </form>
    )
}
