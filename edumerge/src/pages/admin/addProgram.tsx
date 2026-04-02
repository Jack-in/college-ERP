import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { addProgramSchema, type AddProgramValues } from "@/schemas/admin";

import PageContainer from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Field,
    FieldError,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field";
import { FormInput } from "@/components/ui/form-input";
import { FormCreatableSelect } from "@/components/ui/form-creatable-select";
import { FormRadioGroup } from "@/components/ui/form-radio-group";

import {
    useInstitutions,
    useAllAcademicYears,
    useCampuses,
    useAllDepartments,
    useAllBranches,
    useCreateProgram,
} from "@/api/hooks/useAdmin";
import { toast } from "sonner";



const AddProgram = () => {
    const navigate = useNavigate();

    const form = useForm<AddProgramValues>({
        resolver: zodResolver(addProgramSchema) as any,
        defaultValues: {
            institution: "",
            academicYear: "",
            campus: "",
            department: "",
            branch: "",
            courseType: "UG",
            entryType: "Regular",
            quotas: [],
            seats: {},
            fees: {},
        },
    });

    const institution = form.watch("institution");

    const { data: institutionsData = [] } = useInstitutions();
    const selectedInstId = institutionsData.find(i => i.name === institution)?.id ?? null;
    const { data: academicYearsData = [] } = useAllAcademicYears();
    const { data: campusesData = [] } = useCampuses(selectedInstId);
    const { data: departmentsData = [] } = useAllDepartments();
    const { data: branchesData = [] } = useAllBranches();

    const createProgram = useCreateProgram();
    const selectedModes = form.watch("quotas");
    const seats = form.watch("seats");

    const isMountedInstitution = useRef(false);
    useEffect(() => {
        if (!isMountedInstitution.current) { isMountedInstitution.current = true; return; }
        form.setValue("campus", "");
    }, [institution]);



    const totalSeats = selectedModes.reduce((sum, mode) => {
        return sum + (Number(seats?.[mode]) || 0);
    }, 0);

    const onSubmit = async (values: AddProgramValues) => {
        try {
            await createProgram.mutateAsync({
                institutionName: values.institution,
                academicYear: values.academicYear,
                campusName: values.campus,
                departmentName: values.department,
                branchName: values.branch,
                courseType: values.courseType,
                entryType: values.entryType,
                quotas: values.quotas.map(mode => ({
                    quotaName: mode,
                    totalSeats: Number(values.seats[mode]) || 0,
                    feeAmount: Number(values.fees[mode]) || 0,
                })),
            } as any);
            toast.success("Program created successfully");
            navigate("/admin");
        } catch (error: any) {
            const apiError = error?.response?.data;
            toast.error(apiError?.message || apiError?.error || "Failed to create program");
        }
    };

    const footer = (
        <div className="flex justify-end gap-3 w-full">
            <Button variant="outline" onClick={() => navigate("/admin")}>
                Cancel
            </Button>
            <Button variant="yellow" type="submit" form="add-program-form">
                Save Program
            </Button>
        </div>
    );

    return (
        <PageContainer title="Add New Program" footerComponent={footer}>
            <form
                id="add-program-form"
                onSubmit={form.handleSubmit(onSubmit)}
                className="grid grid-cols-1 md:grid-cols-5 gap-6 pt-2"
            >
                <FormCreatableSelect
                    control={form.control}
                    name="institution"
                    label="Institution"
                    options={institutionsData.map(i => i.name)}
                />
                <FormCreatableSelect
                    control={form.control}
                    name="academicYear"
                    label="Academic Year"
                    options={academicYearsData.map(a => a.year)}
                />
                <FormCreatableSelect
                    control={form.control}
                    name="campus"
                    label="Campus"
                    options={campusesData.map(c => c.name)}
                    disabled={!institution}
                />
                <FormCreatableSelect
                    control={form.control}
                    name="department"
                    label="Department"
                    options={departmentsData.map(d => d.name)}
                />
                <FormCreatableSelect
                    control={form.control}
                    name="branch"
                    label="Branch"
                    options={branchesData.map(b => b.name)}
                />

                <div className="col-span-5 flex flex-row gap-10">
                    <FormRadioGroup
                        control={form.control}
                        name="courseType"
                        label="Course Type"
                        options={[
                            { label: "UG", value: "UG" },
                            { label: "PG", value: "PG" }
                        ]}
                    />

                    <FormRadioGroup
                        control={form.control}
                        name="entryType"
                        label="Entry Type"
                        options={[
                            { label: "Regular", value: "Regular" },
                            { label: "Lateral", value: "Lateral" }
                        ]}
                    />

                    <Controller
                        name="quotas"
                        control={form.control}
                        render={({ field, fieldState }) => (
                            <Field className="space-y-3">
                                <FieldLabel>Quota</FieldLabel>

                                <FieldGroup className="flex flex-row gap-6">
                                    {["KCET", "COMEDK", "Management"].map((mode) => (
                                        <FieldLabel key={mode} className="flex items-center gap-2">
                                            <Checkbox
                                                checked={field.value.includes(mode)}
                                                onCheckedChange={(checked: boolean) => {
                                                    let newValue;

                                                    if (checked) {
                                                        newValue = [...field.value, mode];
                                                    } else {
                                                        newValue = field.value.filter(
                                                            (v: string) => v !== mode
                                                        );

                                                        const currentSeats = form.getValues("seats");
                                                        delete currentSeats[mode];
                                                        form.setValue("seats", currentSeats);

                                                        const currentFees = form.getValues("fees");
                                                        delete currentFees[mode];
                                                        form.setValue("fees", currentFees);
                                                    }

                                                    field.onChange(newValue);
                                                }}
                                            />
                                            <span>{mode}</span>
                                        </FieldLabel>
                                    ))}
                                </FieldGroup>

                                {fieldState.invalid && (
                                    <FieldError errors={[fieldState.error]} />
                                )}
                            </Field>
                        )}
                    />
                </div>

                {selectedModes.length > 0 && (
                    <div className="col-span-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-4">
                        {selectedModes.map((mode) => (
                            <div key={mode} className="flex flex-row items-center gap-4 p-4 rounded-xl border border-gray-200 bg-gray-50/50">
                                <h4 className="font-semibold text-brand-text mb-1">{mode}:</h4>
                                <FormInput
                                    control={form.control}
                                    name={`seats.${mode}`}
                                    label="Total Seats"
                                    type="number"
                                    placeholder="e.g. 60"
                                />
                                <FormInput
                                    control={form.control}
                                    name={`fees.${mode}`}
                                    label="Tuition Fee (₹)"
                                    type="number"
                                    placeholder="e.g. 150000"
                                />
                            </div>
                        ))}
                    </div>
                )}

                {selectedModes.length > 0 && (
                    <div className="col-span-5 flex justify-end font-semibold">
                        Total Seats: {totalSeats}
                    </div>
                )}
            </form>
        </PageContainer>
    );
};

export default AddProgram;