import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import { Button } from "@/components/ui/button"
import { FormInput } from "@/components/ui/form-input"
import { FormSelect } from "@/components/ui/form-select"

import { studentDetailsSchema, type StudentDetailsValues } from "@/schemas/admissionOfficer"
import { CATEGORIES } from "../constants"
import { ArrowLeft, ArrowRight } from "lucide-react"

export default function StudentDetailsStep({
    onSubmit,
    defaultValues,
}: {
    onSubmit: (values: StudentDetailsValues) => void
    defaultValues?: Partial<StudentDetailsValues>
}) {
    const navigate = useNavigate()
    const form = useForm<StudentDetailsValues>({
        resolver: zodResolver(studentDetailsSchema) as any,
        defaultValues: {
            studentName: "",
            age: undefined,
            sex: undefined,
            category: "",
            dob: "",
            fatherName: "",
            email: "",
            phone: "",
            tenthPercentage: undefined,
            twelfthPercentage: undefined,
            ...defaultValues,
        },
    })

    return (
        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6">
            <div className="flex flex-row justify-center gap-10">
                <p className="text-xl font-semibold">Student Details</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <FormInput control={form.control} name="studentName" label="Full Name" type="text" />
                <div className="flex flex-row md:col-span-2 gap-5">
                    <FormInput control={form.control} name="dob" label="Date of Birth" type="date" />
                    <FormInput control={form.control} name="age" label="Age" type="number" />
                    <FormSelect
                        control={form.control}
                        name="sex"
                        label="Sex"
                        options={["Male", "Female", "Other"]}
                    />

                </div>

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <FormInput control={form.control} name="fatherName" label="Father's Name" type="text" />
                <FormInput control={form.control} name="email" label="Email Address" type="email" />
                <FormInput control={form.control} name="phone" label="Phone Number" type="tel" />

            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <FormInput control={form.control} name="tenthPercentage" label="10th Percentage (%)" type="number" />
                <FormInput control={form.control} name="twelfthPercentage" label="12th Percentage (%)" type="number" />
                <FormSelect
                    control={form.control}
                    name="category"
                    label="Category"
                    options={CATEGORIES}
                />
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
                <Button type="submit" variant="yellow" className="px-8 h-10 text-sm font-semibold">
                    Confirm Seat Allocation & Proceed
                    <ArrowRight className="size-4 ml-2" />
                </Button>
            </div>
        </form>
    )
}
