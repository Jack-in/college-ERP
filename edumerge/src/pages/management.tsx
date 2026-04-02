import { useDashboardStats } from "@/api/hooks/useManagement"
import PageContainer from "@/components/layout/page-container"
import {
    Users, CheckCircle2, Clock, XCircle, BarChart3,
    FileWarning, CreditCard, TrendingUp, Loader2
} from "lucide-react"

function StatCard({
    label, value, sub, icon: Icon, color, bg,
}: {
    label: string
    value: number | string
    sub?: string
    icon: React.ElementType
    color: string
    bg: string
}) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
            <div className={`${bg} p-3 rounded-xl shrink-0`}>
                <Icon className={`size-5 ${color}`} />
            </div>
            <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500 truncate">{label}</p>
                <p className="text-2xl font-bold text-gray-900 mt-0.5">{value}</p>
                {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
            </div>
        </div>
    )
}

export default function ManagementDashboard() {
    const { data, isLoading } = useDashboardStats()

    const ov = data?.overview

    return (
        <PageContainer
            title="Management Dashboard"
            subtitle="Live seat filling & admission status"
            src={<BarChart3 className="size-6 text-[#010098]" />}
        >
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-3">
                    <Loader2 className="size-8 animate-spin text-[#010098]" />
                    <p className="text-sm text-gray-500">Loading dashboard data...</p>
                </div>
            ) : (
                <div className="space-y-8">

                    <section>
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Overview</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
                            <StatCard
                                label="Total Applications"
                                value={ov?.totalApplications ?? 0}
                                icon={Users}
                                color="text-[#010098]"
                                bg="bg-blue-50"
                            />
                            <StatCard
                                label="Total Seats"
                                value={ov?.totalSeats ?? 0}
                                sub="across all programs & quotas"
                                icon={TrendingUp}
                                color="text-violet-600"
                                bg="bg-violet-50"
                            />
                            <StatCard
                                label="Confirmed Admissions"
                                value={ov?.admitted ?? 0}
                                sub={`${ov?.totalSeats ? Math.round(((ov.admitted) / ov.totalSeats) * 100) : 0}% of total seats`}
                                icon={CheckCircle2}
                                color="text-emerald-600"
                                bg="bg-emerald-50"
                            />
                            <StatCard
                                label="Seats Remaining"
                                value={ov?.remainingSeats ?? 0}
                                sub="not yet confirmed"
                                icon={Clock}
                                color="text-amber-600"
                                bg="bg-amber-50"
                            />
                            <StatCard
                                label="Seat Allocated"
                                value={ov?.allocated ?? 0}
                                sub="payment pending"
                                icon={CreditCard}
                                color="text-blue-500"
                                bg="bg-blue-50"
                            />
                            <StatCard
                                label="Not Yet Allocated"
                                value={ov?.notAllocated ?? 0}
                                icon={Clock}
                                color="text-gray-500"
                                bg="bg-gray-100"
                            />
                            <StatCard
                                label="Cancelled"
                                value={ov?.cancelled ?? 0}
                                icon={XCircle}
                                color="text-red-500"
                                bg="bg-red-50"
                            />
                            <StatCard
                                label="Docs Pending"
                                value={data?.pendingDocApplicants?.length ?? 0}
                                sub="not fully verified"
                                icon={FileWarning}
                                color="text-orange-500"
                                bg="bg-orange-50"
                            />
                        </div>
                    </section>

                    <section>
                        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Quota-wise Seat Utilization</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                            {data?.quotaStats?.length === 0 && (
                                <p className="text-sm text-gray-400 col-span-full">No quota data available.</p>
                            )}
                            {data?.quotaStats?.map(q => {
                                const pct = q.total > 0 ? Math.min(100, Math.round((q.filled / q.total) * 100)) : 0
                                return (
                                    <div key={q.quota} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md transition-shadow">
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-sm font-bold text-gray-800">{q.quota}</span>
                                            <span className="text-xs font-semibold text-[#010098] bg-blue-50 px-2 py-0.5 rounded-full">{pct}% filled</span>
                                        </div>
                                        <div className="grid grid-cols-3 gap-3 mb-4">
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-gray-900">{q.total}</p>
                                                <p className="text-[10px] text-gray-400 font-medium uppercase mt-0.5">Total</p>
                                            </div>
                                            <div className="text-center border-x border-gray-100">
                                                <p className="text-2xl font-bold text-emerald-600">{q.filled}</p>
                                                <p className="text-[10px] text-gray-400 font-medium uppercase mt-0.5">Filled</p>
                                            </div>
                                            <div className="text-center">
                                                <p className="text-2xl font-bold text-amber-600">{q.remaining}</p>
                                                <p className="text-[10px] text-gray-400 font-medium uppercase mt-0.5">Remaining</p>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </section>


                </div>
            )}
        </PageContainer>
    )
}
