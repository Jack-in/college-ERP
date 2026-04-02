import { useState, useEffect, useCallback, useRef } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import PageContainer from "@/components/layout/page-container"
import { Card, CardContent } from "@/components/ui/card"

import {
    useStepper,
    type AdmissionDetailsValues,
    type ProgramDetailsValues,
    type StudentDetailsValues,
} from "./constants"

import {
    useApplication,
    useCreateApplication,
    useUpdateDraft,
    useAllocateSeat,
    useRecordFee,
    useUpdateDocuments
} from "@/api/hooks/useAdmission"

import StepperHeader from "./steps/StepperHeader"
import AdmissionDetailsStep from "./steps/AdmissionDetailsStep"
import ProgramDetailsStep from "./steps/ProgramDetailsStep"
import StudentDetailsStep from "./steps/StudentDetailsStep"
import FeePaymentStep from "./steps/FeePaymentStep"
import DocumentsStep from "./steps/DocumentsStep"
import SuccessStep from "./steps/SuccessStep"

export default function AddAdmission() {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const applicationIdParam = searchParams.get("applicationId")

    const stepper = useStepper({
        initialStep: "admission-details",
    })

    const [applicationId, setApplicationId] = useState<string>(applicationIdParam || "")
    const [admissionNo, setAdmissionNo] = useState<string>("")
    const [savedData, setSavedData] = useState<Record<string, any>>({})
    const isNavigatingAway = useRef(false)

    const { data: appData, isLoading: fetchingApp } = useApplication(applicationId);

    const createMutation = useCreateApplication();
    const updateDraftMutation = useUpdateDraft();
    const allocateMutation = useAllocateSeat(applicationId);
    const feeMutation = useRecordFee(applicationId);
    const docsMutation = useUpdateDocuments(applicationId);

    useEffect(() => {
        if (applicationId && searchParams.get("applicationId") !== applicationId) {
            setSearchParams({ applicationId }, { replace: true })
        }
    }, [applicationId, searchParams, setSearchParams])

    useEffect(() => {
        if (isNavigatingAway.current) return;

        if (appData) {
            setApplicationId(appData.applicationId);
            setAdmissionNo(appData.admissionNo || "");
            const parsedDraft = appData.draftData ? JSON.parse(appData.draftData) : {};
            setSavedData(parsedDraft);

            if (appData.currentStep && appData.currentStep !== stepper.state.current.data.id) {
                stepper.navigation.goTo(appData.currentStep as any);
            }
        }
    }, [appData]);


    const handleAdmissionDetailsSubmit = useCallback(async (values: AdmissionDetailsValues) => {
        let appId = applicationId;

        if (!appId) {
            const newApp = await createMutation.mutateAsync();
            appId = newApp.applicationId;
            setApplicationId(appId);
        }

        const data = { ...savedData, admissionDetails: values };
        setSavedData(data);

        await updateDraftMutation.mutateAsync({
            applicationId: appId,
            currentStep: "program-details",
            draftData: data
        });

        stepper.navigation.next();
    }, [applicationId, savedData, stepper, createMutation, updateDraftMutation]);

    const handleProgramDetailsSubmit = useCallback(async (values: ProgramDetailsValues) => {
        const data = { ...savedData, programDetails: values };
        setSavedData(data);

        await updateDraftMutation.mutateAsync({
            applicationId,
            currentStep: "student-details",
            draftData: data
        });

        stepper.navigation.next();
    }, [applicationId, savedData, stepper, updateDraftMutation]);

    const handleStudentDetailsSubmit = useCallback(async (values: StudentDetailsValues) => {
        const data: Record<string, any> = { ...savedData, studentDetails: values }

        const programQuotaId = (savedData.programDetails as ProgramDetailsValues)?.programQuotaId;

        if (!programQuotaId) {
            toast.error("Program quota selection missing. Please go back.");
            return;
        }

        await allocateMutation.mutateAsync({
            programQuotaId,
            studentDetails: {
                studentName: values.studentName,
                dob: values.dob,
                age: String(values.age),
                sex: values.sex,
                category: values.category,
                fatherName: values.fatherName,
                email: values.email,
                phone: values.phone,
                tenthPercentage: String(values.tenthPercentage),
                twelfthPercentage: String(values.twelfthPercentage)
            }
        });

        setSavedData({ ...data, seatStatus: "allocated" });
        stepper.navigation.next();
    }, [applicationId, savedData, stepper, allocateMutation]);

    const handleFeePaymentSubmit = useCallback(async () => {
        const amount = appData?.programQuota?.feeAmount || savedData.feeAmount || 0;
        const res = await feeMutation.mutateAsync({ amount });
        setAdmissionNo(res.admissionNo || "");
        stepper.navigation.next();
    }, [applicationId, savedData, appData, stepper, feeMutation]);

    const handleDocumentsSubmit = useCallback(async (docStatuses: Record<string, any>) => {
        await docsMutation.mutateAsync(docStatuses);
        stepper.navigation.next();
    }, [applicationId, stepper, docsMutation]);

    const handleFinishLaterDocs = useCallback(async (docStatuses: Record<string, any>) => {
        await docsMutation.mutateAsync(docStatuses);
        isNavigatingAway.current = true;
        toast.info("Progress saved successfully.");
        navigate("/admission-officer");
    }, [docsMutation, navigate]);

    const currentStepId = stepper.state.current.data.id
    const isResume = !!applicationIdParam
    const seatStatus = appData?.seatStatus || savedData.seatStatus || "not_allocated"

    const getTitle = () => {
        if (isResume) {
            return `Resume Application`
        }
        return "New Admission"
    }

    const getSubtitle = () => {
        if (currentStepId === "admission-details" && !applicationId) {
            return "Status: New"
        }

        const parts: string[] = []

        if (applicationId) {
            parts.push(`Application ID: ${applicationId}`)
        }

        if (admissionNo) {
            parts.push(`Admission No: ${admissionNo}`)
        }

        if (seatStatus === "confirmed") {
            parts.push("Status: Seat Confirmed ✓")
        } else if (seatStatus === "allocated") {
            parts.push("Status: Seat Allocated")
        } else {
            parts.push("Status: Not Allocated")
        }

        return parts.join(" | ")
    }

    if (fetchingApp && applicationId) {
        return (
            <PageContainer title="Resume Application" subtitle="Loading application data...">
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="size-8 animate-spin text-brand-blue" />
                    <p className="text-sm text-brand-muted">Fetching application progress...</p>
                </div>
            </PageContainer>
        )
    }

    return (
        <PageContainer
            title={getTitle()}
            subtitle={getSubtitle()}
            cardClassName="flex flex-col"
        >
            <StepperHeader currentIndex={stepper.state.current.index} />

            <Card className="flex-1 flex flex-col max-w-[800px] mx-auto w-full rounded-xl border-gray-200 ">
                <CardContent className="pt-2 flex-1 flex flex-col mx-4">
                    <div className="flex-1">
                        {stepper.flow.switch({
                            "admission-details": () => (
                                <AdmissionDetailsStep
                                    onSubmit={handleAdmissionDetailsSubmit}
                                    defaultValues={savedData.admissionDetails}
                                />
                            ),
                            "program-details": () => (
                                <ProgramDetailsStep
                                    onSubmit={handleProgramDetailsSubmit}
                                    defaultValues={savedData.programDetails}
                                    admissionDetails={savedData.admissionDetails || {}}
                                />
                            ),
                            "student-details": () => (
                                <StudentDetailsStep
                                    onSubmit={handleStudentDetailsSubmit}
                                    defaultValues={savedData.studentDetails}
                                />
                            ),
                            "fee-payment": () => (
                                <FeePaymentStep
                                    quota={savedData.admissionDetails?.quota || "KCET"}
                                    amount={appData?.programQuota?.feeAmount}
                                    onSubmit={handleFeePaymentSubmit}
                                />
                            ),
                            "documents": () => (
                                <DocumentsStep
                                    onSubmit={handleDocumentsSubmit}
                                    onFinishLater={handleFinishLaterDocs}
                                    defaultStatuses={
                                        appData?.documents?.reduce((acc: Record<string, string>, doc: any) => {
                                            acc[doc.docType] = doc.status;
                                            return acc;
                                        }, {}) || {}
                                    }
                                />
                            ),
                            "success": () => (
                                <SuccessStep
                                    admissionNo={admissionNo}
                                />
                            ),
                        })}
                    </div>
                </CardContent>
            </Card>
        </PageContainer>
    )
}
