import { Router } from "express";
import prisma from "../prisma";

const router = Router();

// POST /api/applications -> Initialize the form stepper
router.post("/", async (req, res, next) => {
  try {
    const applicationId = `APP-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

    const app = await prisma.application.create({
      data: {
        applicationId,
        currentStep: "admission-details"
      }
    });

    res.status(201).json(app);
  } catch (error) {
    next(error);
  }
});

// GET /api/applications -> List with filtering
router.get("/", async (req, res, next) => {
  try {
    const { search, department, quota, academicYear, docStatus, seatStatus } = req.query;

    const where: any = {};

    if (search) {
      where.OR = [
        { applicationId: { contains: search as string } },
        { student: { name: { contains: search as string } } },
        { student: { email: { contains: search as string } } },
      ];
    }

    if (seatStatus) {
      where.seatStatus = seatStatus;
    }

    // Handle nested filters under programQuota
    if (quota || department || academicYear) {
      where.programQuota = {};

      if (quota) {
        where.programQuota.quotaName = quota;
      }

      if (department || academicYear) {
        where.programQuota.program = {};

        if (department) {
          where.programQuota.program.department = {
            name: { contains: department as string }
          };
        }

        if (academicYear) {
          where.programQuota.program.academicYear = {
            year: academicYear
          };
        }
      }
    }

    const applications = await prisma.application.findMany({
      where,
      include: {
        programQuota: {
          include: {
            program: {
              include: { branch: true, academicYear: true, department: true }
            }
          }
        },
        student: true,
        feePayment: true,
        documents: true
      },
      orderBy: { createdAt: 'desc' }
    });

    // Post-filter and attach docStatus
    let results = applications.map((app: any) => {
      const docs = app.documents || [];
      const currentDocStatus =
        docs.length === 0 ? "pending"
          : docs.every((d: any) => d.status === "verified") ? "verified"
            : docs.every((d: any) => d.status === "submitted" || d.status === "verified") ? "submitted"
              : "pending";
      
      return { ...app, docStatus: currentDocStatus };
    });

    if (docStatus) {
      results = results.filter((app: any) => app.docStatus === docStatus);
    }

    res.json(results);
  } catch (error) {
    next(error);
  }
});

// GET /api/applications/:applicationId
router.get("/:applicationId", async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const application = await prisma.application.findUnique({
      where: { applicationId },
      include: {
        programQuota: {
          include: { program: { include: { branch: true, department: true, academicYear: true } } }
        },
        student: true,
        feePayment: true,
        documents: true
      }
    });

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json(application);
  } catch (error) {
    next(error);
  }
});
// PATCH /api/applications/:applicationId/draft -> For intermediate steps
router.patch("/:applicationId/draft", async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const { currentStep, draftData } = req.body;

    const application = await prisma.application.update({
      where: { applicationId },
      data: {
        currentStep,
        draftData: draftData ? JSON.stringify(draftData) : null
      }
    });

    res.json(application);
  } catch (error) {
    next(error);
  }
});
// POST /api/applications/:applicationId/allocate-seat
router.post("/:applicationId/allocate-seat", async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const { programQuotaId, studentDetails } = req.body;

    const application = await prisma.application.findUnique({ where: { applicationId } });
    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    // Guard: Prevent double allocation
    if (application.seatStatus === "allocated" || application.seatStatus === "confirmed") {
      return res.status(400).json({ error: "Seat already allocated" });
    }

    // Transact seat allocation securely
    const result = await prisma.$transaction(async (tx: any) => {
      const quota = await tx.programQuota.findUnique({ where: { id: programQuotaId } });
      if (!quota) throw new Error("Quota not found");

      // Guard: Quota full
      if (quota.occupiedSeats >= quota.totalSeats) {
        throw new Error("Quota full");
      }

      // Bump occupied seats
      await tx.programQuota.update({
        where: { id: programQuotaId },
        data: { occupiedSeats: { increment: 1 } }
      });

      // Create student & assign application seat status
      return tx.application.update({
        where: { applicationId },
        data: {
          seatStatus: "allocated",
          currentStep: "fee-payment",
          programQuota: { connect: { id: programQuotaId } },
          student: {
            create: {
              name: studentDetails.studentName,
              dob: new Date(studentDetails.dob),
              age: parseInt(studentDetails.age),
              sex: studentDetails.sex,
              category: studentDetails.category,
              fatherName: studentDetails.fatherName,
              email: studentDetails.email,
              phone: studentDetails.phone,
              tenthPercentage: parseFloat(studentDetails.tenthPercentage),
              twelfthPercentage: parseFloat(studentDetails.twelfthPercentage)
            }
          }
        },
        include: { programQuota: true, student: true }
      });
    });

    res.json(result);
  } catch (error) {
    if (error instanceof Error) {
      return res.status(400).json({ error: error.message });
    }
    next(error);
  }
});

// PATCH /api/applications/:applicationId/cancel-allocation
router.patch("/:applicationId/cancel-allocation", async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const application = await prisma.application.findUnique({ where: { applicationId } });

    if (!application) return res.status(404).json({ error: "Application not found" });

    // Guard: Can only cancel 'allocated'
    if (application.seatStatus !== "allocated") {
      return res.status(400).json({ error: "Only allocated seats can be cancelled" });
    }

    // Transact cancellation safely
    await prisma.$transaction(async (tx: any) => {
      // Release seat
      await tx.programQuota.update({
        where: { id: application.programQuotaId! },
        data: { occupiedSeats: { decrement: 1 } }
      });

      // Cancel app
      await tx.application.update({
        where: { applicationId },
        data: { seatStatus: "cancelled" }
      });
    });

    res.json({ success: true, message: "Seat cancelled" });
  } catch (error) {
    next(error);
  }
});

// POST /api/applications/:applicationId/fee
router.post("/:applicationId/fee", async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const { amount } = req.body;

    const application = await prisma.application.findUnique({ where: { applicationId } });
    if (!application) return res.status(404).json({ error: "Application not found" });

    // Guard: Prevent double confirmation or paying without allocation
    if (application.seatStatus === "confirmed") {
      return res.status(400).json({ error: "Already confirmed" });
    }
    if (application.seatStatus !== "allocated") {
      return res.status(400).json({ error: "Seat not allocated" });
    }

    const admissionNo = `ADM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const updatedApp = await prisma.application.update({
      where: { applicationId },
      data: {
        admissionNo,
        seatStatus: "confirmed",
        currentStep: "documents",
        feePayment: {
          create: {
            amount: parseFloat(amount),
            paid: true,
            paidAt: new Date()
          }
        }
      },
      include: { feePayment: true }
    });

    res.json(updatedApp);
  } catch (error) {
    next(error);
  }
});

// PATCH /api/applications/:applicationId/documents
router.patch("/:applicationId/documents", async (req, res, next) => {
  try {
    const { applicationId } = req.params;
    const { docStatuses } = req.body; // e.g. { "tenth": "verified", "aadhaar": "pending" }

    // In Prisma, we upsert each document securely via query loop
    const applicationInfo = await prisma.application.findUnique({ where: { applicationId }, select: { id: true } });
    if (!applicationInfo) return res.status(404).json({ error: "Not found" });

    const appId = applicationInfo.id;
    const docKeys = Object.keys(docStatuses);

    // Run parallel upserts for simple status records
    const results = await Promise.all(docKeys.map(docType =>
      prisma.document.upsert({
        where: {
          applicationId_docType: { applicationId: appId, docType }
        },
        update: { status: docStatuses[docType] },
        create: { applicationId: appId, docType, status: docStatuses[docType] }
      })
    ));

    // Only advance to 'success' when ALL documents are verified
    // (Finish Later with partial statuses must NOT advance the step)
    const allVerified = docKeys.every(key => docStatuses[key] === "verified");
    if (allVerified) {
      await prisma.application.update({
        where: { id: appId },
        data: { currentStep: "success" }
      });
    }

    res.json(results);
  } catch (error) {
    next(error);
  }
});

export default router;
