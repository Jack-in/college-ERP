import { defineStepper } from "@stepperize/react"

export const CATEGORIES = ["General (GM)", "Scheduled Caste (SC)", "Scheduled Tribe (ST)", "OBC", "OBC (Creamy Layer)", "EWS"]

export const REQUIRED_DOCS = [
    { id: "tenth", label: "10th Certificate" },
    { id: "twelfth", label: "12th Certificate / Diploma" },
    { id: "aadhaar", label: "Aadhaar Card" },
    { id: "pan", label: "PAN Card" },
]

export const { useStepper, steps } = defineStepper(
    { id: "admission-details", title: "Admission Details" },
    { id: "program-details", title: "Program Details" },
    { id: "student-details", title: "Student Details" },
    { id: "fee-payment", title: "Fee Payment" },
    { id: "documents", title: "Documents" },
    { id: "success", title: "Admitted" },
)

export type { AdmissionDetailsValues } from "@/schemas/admissionOfficer"
export type { ProgramDetailsValues } from "@/schemas/admissionOfficer"
export type { StudentDetailsValues } from "@/schemas/admissionOfficer"
