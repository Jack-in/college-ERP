import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import PageContainer from "@/components/layout/page-container"
import { DataTable } from "@/components/ui/data-table"
import { adminColumns, type AdminRecord } from "../columns"
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
import { ChevronDown, PlusIcon, Loader2 } from "lucide-react"
import {
    usePrograms,
    useInstitutions,
    useAllDepartments,
    useAllBranches,
    useAllAcademicYears,
    useQuotas
} from "@/api/hooks/useAdmin"



const FilterDropdown = ({ title, value, options, onChange }: { title: string, value: string, options: { id: string, name: string }[], onChange: (v: string) => void }) => {
    const selectedName = value && value !== "all" ? options.find(o => o.id === value)?.name : title;
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="w-full flex flex-row justify-between font-normal truncate" >
                    {selectedName || title}
                    <ChevronDown className="h-4 w-4" />
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

const Admin = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedQuery, setDebouncedQuery] = useState("")
    const [activeCategories, setActiveCategories] = useState<string[]>([])
    const [filters, setFilters] = useState({
        institution: "",
        department: "",
        program: "",
        academicYear: "",
        courseType: "",
        entryType: "",
        quota: ""
    })

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(searchQuery)
        }, 300)
        return () => clearTimeout(handler)
    }, [searchQuery])

    const { data: filteredPrograms = [], isLoading, isError } = usePrograms({ ...filters, search: debouncedQuery });
    const { data: quotas = [] } = useQuotas();

    const { data: institutions = [] } = useInstitutions();
    const { data: departments = [] } = useAllDepartments();
    const { data: branches = [] } = useAllBranches();
    const { data: years = [] } = useAllAcademicYears();

    const dynamicFilterCategories = [
        { id: "institution", name: "Institution", options: institutions.map(i => ({ id: i.name, name: i.name })) },
        { id: "department", name: "Department", options: departments.map(d => ({ id: d.name, name: d.name })) },
        { id: "program", name: "Program", options: branches.map(b => ({ id: b.name, name: b.name })) },
        { id: "academicYear", name: "Academic Year", options: years.map(y => ({ id: y.year, name: y.year })) },
        {
            id: "courseType", name: "Course Type", options: [
                { id: "UG", name: "UG" },
                { id: "PG", name: "PG" }
            ]
        },
        {
            id: "entryType", name: "Entry Type", options: [
                { id: "Regular", name: "Regular" },
                { id: "Lateral", name: "Lateral" }
            ]
        },
        { id: "quota", name: "Quota", options: quotas },
    ];

    const tableData: AdminRecord[] = filteredPrograms.map((p: any) => ({
        id: String(p.id),
        institution: p.campus?.institution?.name || "-",
        campus: p.campus?.name || "-",
        department: p.department?.name || "-",
        program: p.branch?.name || "-",
        academicYear: p.academicYear?.year || "-",
        courseType: p.courseType,
        entryType: p.entryType,
        quota: p.quotas.map((q: any) => `${q.quotaName} (${q.totalSeats})`).join(", ")
    }));

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
        setFilters({
            institution: "", department: "", program: "",
            academicYear: "", courseType: "", entryType: "", quota: ""
        })
    }

    return (
        <PageContainer title="Administrator" subtitle="Manage programs and admissions" endActionComponent={<Button variant="yellow" onClick={() => navigate('/admin/add-program')}>{<PlusIcon />}Add Program</Button>} >
            <div className="space-y-4 bg-white">
                <div className="flex flex-wrap gap-4 items-center">
                    <Input
                        placeholder="Search programs, departments..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="max-w-xs"
                    />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="w-[200px] flex flex-row justify-between font-normal truncate">
                                {activeCategories.length > 0 ? `${activeCategories.length} Filters Selected` : "Add Filters..."}
                                <ChevronDown className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[200px]">
                            {dynamicFilterCategories.map(cat => (
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
                        const cat = dynamicFilterCategories.find(c => c.id === catId);
                        if (!cat) return null;
                        return (
                            <div className="w-[250px]" key={cat.id}>
                                <FilterDropdown
                                    title={cat.name}
                                    value={filters[cat.id as keyof typeof filters]}
                                    options={cat.options}
                                    onChange={(v) => handleFilterChange(cat.id as keyof typeof filters, v)}
                                />
                            </div>
                        );
                    })}

                    <Button variant="ghost" onClick={clearFilters}>
                        Clear Filters
                    </Button>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center p-20 gap-4">
                    <Loader2 className="size-8 animate-spin text-brand-blue" />
                    <p className="text-brand-muted animate-pulse">Loading backend records...</p>
                </div>
            ) : isError ? (
                <div className="p-10 text-center text-red-500 border border-red-100 rounded-xl bg-red-50/50">
                    Failed to fetch programs. Please check your backend connection.
                </div>
            ) : (
                <DataTable columns={adminColumns} data={tableData} />
            )}
        </PageContainer>
    )
}

export default Admin