import * as z from "zod"

export const admissionDetailsSchema = z.object({
    instituteName: z.string().min(1, "Institute is required"),
    academicYear: z.string().min(1, "Academic year is required"),
    courseType: z.enum(["UG", "PG"], { message: "Select course type" }),
    entryType: z.enum(["Regular", "Lateral"], { message: "Select entry type" }),
    quota: z.string().min(1, "Select quota"),
    allotmentNumber: z.string().optional()
}).refine(data => {
    if (data.quota && data.quota.toLowerCase() !== "management") {
        return !!data.allotmentNumber && data.allotmentNumber.trim().length > 0;
    }
    return true;
}, {
    message: "Allotment number is required",
    path: ["allotmentNumber"]
})

export type AdmissionDetailsValues = z.infer<typeof admissionDetailsSchema>

export const programDetailsSchema = z.object({
    campus: z.string().min(1, "Campus is required"),
    department: z.string().min(1, "Department is required"),
    branch: z.string().min(1, "Branch is required"),
})

export type ProgramDetailsValues = z.infer<typeof programDetailsSchema> & { programQuotaId?: number }

export const studentDetailsSchema = z.object({
    studentName: z.string().min(1, "Name is required"),
    age: z.coerce.number().min(15, "Min age 15").max(40, "Max age 40"),
    sex: z.enum(["Male", "Female", "Other"], { message: "Select sex" }),
    category: z.string().min(1, "Category is required"),
    dob: z.string().min(1, "Date of birth is required"),
    fatherName: z.string().min(1, "Father's name is required"),
    email: z.string().email("Invalid email address"),
    phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits"),
    tenthPercentage: z.coerce.number().min(0, "Min 0%").max(100, "Max 100%"),
    twelfthPercentage: z.coerce.number().min(0, "Min 0%").max(100, "Max 100%"),
    programQuotaId: z.number().optional(),
})

export type StudentDetailsValues = z.infer<typeof studentDetailsSchema>
