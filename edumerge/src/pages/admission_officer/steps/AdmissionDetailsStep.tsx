
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { FormSelect } from "@/components/ui/form-select"
import { FormRadioGroup } from "@/components/ui/form-radio-group"
import { FormInput } from "@/components/ui/form-input"

import { useInstitutions, useQuotas, usePrograms } from "@/api/hooks/useAdmin"
import { toast } from "sonner"

import { admissionDetailsSchema, type AdmissionDetailsValues } from "@/schemas/admissionOfficer"
import { ArrowLeft } from "lucide-react"

export default function AdmissionDetailsStep({
    onSubmit,
    defaultValues,
}: {
    onSubmit: (values: AdmissionDetailsValues) => void
    defaultValues?: Partial<AdmissionDetailsValues>
}) {
    const navigate = useNavigate()
    const { data: institutions = [], isLoading: loadingInsts } = useInstitutions()

    const form = useForm<AdmissionDetailsValues>({
        resolver: zodResolver(admissionDetailsSchema),
        defaultValues: {
            instituteName: "",
            academicYear: "",
            courseType: undefined,
            entryType: undefined,
            quota: undefined,
            ...defaultValues,
        },
    })

    const watchedValues = form.watch()
    const { quota: selectedQuota, instituteName: selectedInst } = watchedValues

    const { data: instPrograms = [], isLoading: loadingInstPrograms } = usePrograms({
        institution: selectedInst || undefined,
    });

    const availableYears = Array.from(new Set(instPrograms.map((p: any) => p.academicYear?.year))).filter(Boolean) as string[];

    const { data: quotas = [] } = useQuotas()

    const handleSubmit = async (values: AdmissionDetailsValues) => {
        const match = instPrograms.find((p: any) =>
            p.academicYear?.year === values.academicYear &&
            p.courseType === values.courseType &&
            p.entryType === values.entryType &&
            p.quotas?.some((q: any) => q.quotaName === values.quota)
        );

        if (!match) {
            toast.error("No available programs match this selection. Please adjust your criteria.");
            return;
        }

        onSubmit(values)
    }

    return (
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="flex flex-row justify-center gap-10">
                <p className="text-xl font-semibold">Admission Details</p>
            </div>

            <div className="grid grid-cols-1 gap-5">
                <FormSelect
                    control={form.control}
                    name="instituteName"
                    label="Institute Name"
                    options={institutions.map(i => i.name)}
                    loading={loadingInsts}
                />
            </div>
            <div className="grid grid-cols-2 gap-10">
                <FormSelect
                    control={form.control}
                    name="academicYear"
                    label="Academic Year"
                    options={availableYears}
                    loading={loadingInstPrograms}
                    disabled={!selectedInst}
                />
                <FormRadioGroup control={form.control} name="courseType" label="Course Type" options={["UG", "PG"]} />
            </div>

            <div className="flex flex-row gap-10">
                <FormRadioGroup control={form.control} name="entryType" label="Entry Type" options={["Regular", "Lateral"]} />
                <FormRadioGroup control={form.control} name="quota" label="Quota" options={quotas.map(q => q.name)} />
            </div>

            {selectedQuota && selectedQuota.toLowerCase() !== "management" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-4">
                    <FormInput control={form.control} name="allotmentNumber" label="Allotment Number" placeholder="e.g. ALLOT-2026-X" />
                </div>
            )}
            <div className="sticky flex justify-between items-center bottom-0 pt-8">
                <button
                    type="button"
                    onClick={() => navigate("/admission-officer")}
                    className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors flex flex-row items-center gap-2"
                >
                    <ArrowLeft className="size-4" />
                    Cancel
                </button>
                <Button type="submit" variant="yellow" className="px-8 h-10 text-sm font-semibold">
                    Save and Proceed
                </Button>
            </div>
        </form>
    )
}
