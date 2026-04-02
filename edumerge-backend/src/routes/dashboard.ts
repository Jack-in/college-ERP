import { Router } from "express";
import prisma from "../prisma";

const router = Router();

// GET /api/dashboard/stats
router.get("/stats", async (req, res, next) => {
  try {
    // ─── Total Applications & Seat Stats ───────────────────────────
    const allApplications = await prisma.application.findMany({
      include: {
        documents: true,
        feePayment: true,
        programQuota: {
          include: {
            program: {
              include: { branch: true, academicYear: true }
            }
          }
        },
        student: true,
      }
    });

    const totalApplications = allApplications.length;
    const admitted = allApplications.filter(a => a.seatStatus === "confirmed").length;
    const allocated = allApplications.filter(a => a.seatStatus === "allocated").length;
    const cancelled = allApplications.filter(a => a.seatStatus === "cancelled").length;
    const notAllocated = allApplications.filter(a => a.seatStatus === "not_allocated").length;

    // ─── Total Seats from Program Quotas ───────────────────────────
    const allQuotas = await prisma.programQuota.findMany({
      include: { program: { include: { branch: true, academicYear: true } } }
    });
    const totalSeats = allQuotas.reduce((sum, q) => sum + q.totalSeats, 0);
    const remainingSeats = totalSeats - admitted - allocated;

    // ─── Quota-wise Stats ──────────────────────────────────────────
    const quotaGroups: Record<string, { total: number; filled: number; remaining: number }> = {};
    for (const quota of allQuotas) {
      const name = quota.quotaName;
      if (!quotaGroups[name]) {
        quotaGroups[name] = { total: 0, filled: 0, remaining: 0 };
      }
      quotaGroups[name].total += quota.totalSeats;
    }
    for (const app of allApplications) {
      const quotaName = app.programQuota?.quotaName;
      if (quotaName && quotaGroups[quotaName]) {
        if (app.seatStatus === "confirmed" || app.seatStatus === "allocated") {
          quotaGroups[quotaName].filled += 1;
        }
      }
    }
    for (const name in quotaGroups) {
      quotaGroups[name].remaining = quotaGroups[name].total - quotaGroups[name].filled;
    }

    // ─── Pending Documents ─────────────────────────────────────────
    const pendingDocApplicants = allApplications
      .filter(app => {
        const docs = app.documents || [];
        const allVerified = docs.length > 0 && docs.every(d => d.status === "verified");
        return !allVerified && app.seatStatus !== "cancelled";
      })
      .map(app => ({
        applicationId: app.applicationId,
        admissionNo: app.admissionNo,
        name: app.student?.name || "N/A",
        seatStatus: app.seatStatus,
        docCount: app.documents.length,
        pendingCount: app.documents.filter(d => d.status === "pending").length,
        submittedCount: app.documents.filter(d => d.status === "submitted").length,
        verifiedCount: app.documents.filter(d => d.status === "verified").length,
      }));

    // ─── Fee Pending ───────────────────────────────────────────────
    const feePendingList = allApplications
      .filter(app => app.seatStatus !== "cancelled" && !app.feePayment)
      .map(app => ({
        applicationId: app.applicationId,
        admissionNo: app.admissionNo,
        name: app.student?.name || "N/A",
        seatStatus: app.seatStatus,
        quota: app.programQuota?.quotaName || "N/A",
        department: app.programQuota?.program?.branch?.name || "N/A",
        feeAmount: app.programQuota?.feeAmount || 0,
      }));

    res.json({
      overview: {
        totalApplications,
        totalSeats,
        admitted,
        allocated,
        notAllocated,
        cancelled,
        remainingSeats: Math.max(0, remainingSeats),
      },
      quotaStats: Object.entries(quotaGroups).map(([name, stats]) => ({
        quota: name,
        ...stats
      })),
      pendingDocApplicants,
      feePendingList,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
