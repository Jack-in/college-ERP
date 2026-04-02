import { type ColumnDef } from "@tanstack/react-table"

export type AdminRecord = {
  id: string
  institution: string
  campus: string
  department: string
  program: string
  academicYear: string
  courseType: string
  entryType: string
  quota: string
}

export const adminColumns: ColumnDef<AdminRecord>[] = [
  {
    header: "#",
    cell: ({ row }) => <span className="font-medium text-gray-500">{row.index + 1}</span>,
  },
  {
    accessorKey: "institution",
    header: "Institution",
  },
  {
    accessorKey: "campus",
    header: "Campus",
  },
  {
    accessorKey: "department",
    header: "Department",
  },
  {
    accessorKey: "program",
    header: "Program",
  },
  {
    accessorKey: "academicYear",
    header: "Academic Year",
  },
  {
    accessorKey: "courseType",
    header: "Course Type",
  },
  {
    accessorKey: "entryType",
    header: "Entry Type",
  },
  {
    accessorKey: "quota",
    header: "Quota",
  },
]

export type AdmissionOfficerRecord = {
  id: string
  applicationId: string
  admissionNo: string | null
  name: string
  email: string
  phone: string
  department: string
  academicYear: string
  quota: string
  docStatus: "pending" | "submitted" | "verified"
  seatStatus: "not_allocated" | "allocated" | "confirmed" | "cancelled"
}

export const admissionOfficerColumns: ColumnDef<AdmissionOfficerRecord>[] = [
  {
    header: "#",
    cell: ({ row }) => <span className="font-medium text-gray-500">{row.index + 1}</span>,
  },
  {
    accessorKey: "applicationId",
    header: "Application No",
  },
  {
    accessorKey: "admissionNo",
    header: "Admission No",
  },
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "department",
    header: "Department",
  },
  {
    accessorKey: "academicYear",
    header: "Academic Year",
  },
  {
    accessorKey: "quota",
    header: "Quota",
  },
  {
    accessorKey: "docStatus",
    header: "Doc Status",
    cell: ({ row }) => {
      const status = row.original.docStatus
      const config = {
        pending: { dot: "bg-amber-400", text: "text-amber-700", bg: "bg-amber-50", label: "Pending" },
        submitted: { dot: "bg-blue-500", text: "text-blue-700", bg: "bg-blue-50", label: "Submitted" },
        verified: { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", label: "Verified" },
      }
      const { dot, text, bg, label } = config[status];
      return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${bg} ${text}`}>
          <span className={`size-1.5 rounded-full ${dot}`} />
          {label}
        </span>
      )
    }
  },
  {
    accessorKey: "seatStatus",
    header: "Seat Status",
    cell: ({ row, table }) => {
      const status = row.original.seatStatus
      const handleCancel = () => {
        const meta = table.options.meta as { onCancelAllocation?: (id: string) => void }
        if (meta?.onCancelAllocation) meta.onCancelAllocation(row.original.id)
      }

      const config = {
        not_allocated: { dot: "bg-gray-400", text: "text-gray-600", bg: "bg-gray-100", label: "Not Allocated" },
        allocated: { dot: "bg-[#010098]", text: "text-[#010098]", bg: "bg-blue-50", label: "Allocated" },
        confirmed: { dot: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", label: "Confirmed" },
        cancelled: { dot: "bg-red-500", text: "text-red-600", bg: "bg-red-50", label: "Cancelled" },
      }
      const { dot, text, bg, label } = config[status];

      return (
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${bg} ${text}`}>
            <span className={`size-1.5 rounded-full ${dot}`} />
            {label}
          </span>
          {status === "allocated" && (
            <button
              onClick={handleCancel}
              className="text-[10px] font-semibold text-red-500 hover:text-red-700 underline underline-offset-2 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      )
    }
  },
  {
    header: "Actions",
    cell: ({ row, table }) => {
      const seatStatus = row.original.seatStatus
      const docStatus = row.original.docStatus
      const handleResume = () => {
        const meta = table.options.meta as { navigateToNextStepper?: (id: string) => void }
        if (meta?.navigateToNextStepper) meta.navigateToNextStepper(row.original.id)
      }

      const isComplete = docStatus === "verified" && seatStatus === "confirmed";
      const isCancelled = seatStatus === "cancelled";

      if (isComplete || isCancelled) return null;

      return (
        <button
          onClick={handleResume}
          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#010098] hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full transition-all"
        >
          Resume →
        </button>
      )
    }
  }
]
