import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"
import PageContainer from "@/components/layout/page-container"
import { DataTable } from "@/components/ui/data-table"
import { admissionOfficerColumns, type AdmissionOfficerRecord } from "../columns"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuCheckboxItem,
    DropdownMenuTrigger,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
} from "@/components/ui/dropdown-menu"
import { ChevronDown, PlusIcon } from "lucide-react"
import { useApplications, useCancelAllocation } from "@/api/hooks/useAdmission"
import { useAllAcademicYears, useAllDepartments, useQuotas } from "@/api/hooks/useAdmin"
import { StartAdmissionDialog } from "./components/StartAdmissionDialog"

const FilterDropdown = ({ title, value, options, onChange }: { title: string, value: string, options: { id: string, name: string }[], onChange: (v: string) => void }) => {
    const selectedName = value && value !== "all" ? options.find(o => o.id === value)?.name : title;
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full h-10 flex flex-row justify-between border-gray-200 font-normal truncate" >
                    {selectedName || title}
                    <ChevronDown className="h-4 w-4 opacity-50 shrink-0" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
                <DropdownMenuRadioGroup value={value || "all"} onValueChange={onChange}>
                    <DropdownMenuRadioItem value="all">All {title}s</DropdownMenuRadioItem>
                    {options.map(opts => (
                        <DropdownMenuRadioItem key={opts.id} value={opts.id}>{opts.name}</DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

const AdmissionOfficer = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedQuery, setDebouncedQuery] = useState("")
    const [activeCategories, setActiveCategories] = useState<string[]>([])
    const [dialogOpen, setDialogOpen] = useState(false)
    const [filters, setFilters] = useState({
        department: "",
        academicYear: "",
        quota: "",
        docStatus: "",
        seatStatus: ""
    })

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(searchQuery)
        }, 300)
        return () => clearTimeout(handler)
    }, [searchQuery])

    const { data: deptData = [] } = useAllDepartments();
    const { data: yearData = [] } = useAllAcademicYears();
    const { data: quotas = [] } = useQuotas();

    const departments = deptData.map(d => ({ id: d.id.toString(), name: d.name }))
    const academicYears = yearData.map(y => ({ id: y.id.toString(), name: y.year }))

    const filterCategories = [
        {
            id: "department",
            name: "Department",
            options: departments
        },
        {
            id: "academicYear",
            name: "Academic Year",
            options: academicYears
        },
        {
            id: "quota",
            name: "Quota",
            options: quotas
        },
        {
            id: "docStatus",
            name: "Doc Status",
            options: [
                { id: "pending", name: "Pending" },
                { id: "submitted", name: "Submitted" },
                { id: "verified", name: "Verified" }
            ]
        },
        {
            id: "seatStatus",
            name: "Seat Status",
            options: [
                { id: "not_allocated", name: "Not Allocated" },
                { id: "allocated", name: "Allocated" },
                { id: "confirmed", name: "Confirmed" },
                { id: "cancelled", name: "Cancelled" }
            ]
        },
    ]

    const { data: applications = [], isLoading, refetch } = useApplications({
        search: debouncedQuery,
        department: filters.department ? departments.find(o => o.id === filters.department)?.name : undefined,
        academicYear: filters.academicYear ? academicYears.find(o => o.id === filters.academicYear)?.name : undefined,
        quota: filters.quota || undefined,
        docStatus: filters.docStatus || undefined,
        seatStatus: filters.seatStatus || undefined
    });
    const cancelMutation = useCancelAllocation();

    const mappedData: AdmissionOfficerRecord[] = (applications as any[]).map(app => {
        return {
            id: app.applicationId,
            applicationId: app.applicationId,
            admissionNo: app.admissionNo || "-",
            name: app.student?.name || "-",
            email: app.student?.email || "-",
            phone: app.student?.phone || "-",
            department: app.programQuota?.program?.department?.name || "-",
            academicYear: app.programQuota?.program?.academicYear?.year || "-",
            quota: app.programQuota?.quotaName || "-",
            docStatus: (app.docStatus || "pending") as any,
            seatStatus: app.seatStatus as any,
        }
    });

    const handleFilterChange = (key: keyof typeof filters, value: string) => {
        setFilters(prev => ({ ...prev, [key]: value === "all" ? "" : value }))
    }

    const toggleCategory = (categoryId: string) => {
        setActiveCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(c => c !== categoryId)
                : [...prev, categoryId]
        )
    }

    const clearFilters = () => {
        setSearchQuery("")
        setActiveCategories([])
        setFilters({ department: "", academicYear: "", quota: "", docStatus: "", seatStatus: "" })
    }

    const handleCancelAllocation = async (id: string) => {
        try {
            await toast.promise(cancelMutation.mutateAsync(id), {
                loading: 'Cancelling...',
                success: 'Seat allocation cancelled',
                error: 'Failed to cancel allocation'
            });
            refetch();
        } catch (e) { }
    }

    const handleNavigateToNextStepper = (id: string) => {
        navigate(`/admission-officer/add-admission?applicationId=${encodeURIComponent(id)}`)
    }

    return (
        <PageContainer
            title="Admission Officer"
            subtitle="Manage admissions"
            endActionComponent={
                <Button variant="yellow" onClick={() => setDialogOpen(true)}>
                    <PlusIcon />
                    Add Admission
                </Button>
            }
        >
            <div className="space-y-4 bg-white">
                <div className="flex flex-wrap gap-4 items-center">
                    <Input
                        placeholder="Search student, app number..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="max-w-xs h-10 border-gray-200"
                    />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-[180px] h-10 flex flex-row justify-between border-gray-200 font-normal">
                                <span className="truncate">
                                    {activeCategories.length > 0 ? `${activeCategories.length} Filters Selected` : "Add Filters"}
                                </span>
                                <ChevronDown className="h-4 w-4 ml-2 shrink-0 opacity-50" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[180px]">
                            {filterCategories.map(cat => (
                                <DropdownMenuCheckboxItem
                                    key={cat.id}
                                    checked={activeCategories.includes(cat.id)}
                                    onCheckedChange={() => toggleCategory(cat.id)}
                                >
                                    {cat.name}
                                </DropdownMenuCheckboxItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {activeCategories.map(catId => {
                        const cat = filterCategories.find(c => c.id === catId);
                        if (!cat) return null;
                        return (
                            <div className="w-[200px]" key={cat.id}>
                                <FilterDropdown
                                    title={cat.name}
                                    value={filters[catId as keyof typeof filters]}
                                    options={cat.options}
                                    onChange={(v) => handleFilterChange(catId as keyof typeof filters, v)}
                                />
                            </div>
                        );
                    })}

                    {(activeCategories.length > 0 || searchQuery) && (
                        <Button variant="ghost" onClick={clearFilters} className="text-brand-muted hover:text-brand-text h-10 px-3">
                            Clear Filters
                        </Button>
                    )}
                </div>
            </div>

            <DataTable
                columns={admissionOfficerColumns}
                data={mappedData}
                loading={isLoading}
                meta={{
                    onCancelAllocation: handleCancelAllocation,
                    navigateToNextStepper: handleNavigateToNextStepper
                }}
            />

            <StartAdmissionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
        </PageContainer>
    )
}

export default AdmissionOfficer