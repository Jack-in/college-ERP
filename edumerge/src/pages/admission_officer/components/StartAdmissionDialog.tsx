import { useState } from "react"
import { useNavigate } from "react-router-dom"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { UserPlus } from "lucide-react"

interface StartAdmissionDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function StartAdmissionDialog({ open, onOpenChange }: StartAdmissionDialogProps) {
    const navigate = useNavigate()
    const [applicationId, setApplicationId] = useState("")

    const handleApplicationLookup = () => {
        if (!applicationId.trim()) return
        navigate(`/admission-officer/add-admission?applicationId=${encodeURIComponent(applicationId.trim())}`)
        onOpenChange(false)
        setApplicationId("")
    }

    const handleNewAdmission = () => {
        navigate('/admission-officer/add-admission')
        onOpenChange(false)
        setApplicationId("")
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-brand-blue text-lg">
                        Resume or Start Application
                    </DialogTitle>
                    <DialogDescription>
                        Do you already have an application ID? Enter it below to resume.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 pt-2">
                    <div className="space-y-2">
                        <Label htmlFor="application-id" className="text-sm font-medium text-brand-text">
                            Application ID
                        </Label>
                        <div className="flex gap-2">
                            <Input
                                id="application-id"
                                placeholder="Enter application ID..."
                                value={applicationId}
                                onChange={(e) => setApplicationId(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") handleApplicationLookup()
                                }}
                                className="flex-1"
                            />
                            <Button
                                onClick={handleApplicationLookup}
                                disabled={!applicationId.trim()}
                                className="bg-brand-blue text-white hover:bg-brand-blueHover"
                            >
                                Resume
                            </Button>
                        </div>
                    </div>

                    <div className="relative py-2">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-3 text-brand-muted">or</span>
                        </div>
                    </div>

                    <Button
                        variant="default"
                        className="w-full border-brand-orange bg-brand-orange text-white"
                        onClick={handleNewAdmission}
                    >
                        <UserPlus className="size-4 mr-2" />
                        Start New Application
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}
