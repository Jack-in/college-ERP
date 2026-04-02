import * as z from "zod"

export const addProgramBaseSchema = z.object({
    institution: z.string().min(1, "Institution is required"),
    academicYear: z.string().min(1, "Academic Year is required"),
    campus: z.string().min(1, "Campus is required"),
    department: z.string().min(1, "Department is required"),
    branch: z.string().min(1, "Branch is required"),
    courseType: z.enum(["UG", "PG"]),
    entryType: z.enum(["Regular", "Lateral"]),
    quotas: z.array(z.string()),
    seats: z.record(z.string(), z.coerce.number().optional()),
    fees: z.record(z.string(), z.coerce.number().optional()),
})

export const addProgramSchema = addProgramBaseSchema.superRefine((data, ctx) => {
    if (data.quotas.length === 0) {
        ctx.addIssue({ path: ["quotas"], message: "Select at least one quota", code: "custom" })
    }
    data.quotas.forEach((mode) => {
        const value = data.seats?.[mode]
        if (!value || value <= 0) {
            ctx.addIssue({ path: ["seats", mode], message: `${mode} seats must be greater than 0`, code: "custom" })
        }
        const feeValue = data.fees?.[mode]
        if (!feeValue || feeValue <= 0) {
            ctx.addIssue({ path: ["fees", mode], message: `${mode} fee must be greater than 0`, code: "custom" })
        }
    })
})

export type AddProgramValues = z.infer<typeof addProgramBaseSchema>
