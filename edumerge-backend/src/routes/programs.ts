import { Router } from "express";
import prisma from "../prisma";

const router = Router();

// GET /api/programs
router.get("/", async (req, res, next) => {
  try {
    const { 
      institution, campus, department, program, 
      academicYear, courseType, entryType, quota,
      search
    } = req.query;

    const where: any = {};

    if (search) {
      where.OR = [
        { branch: { name: { contains: search as string } } },
        { department: { name: { contains: search as string } } },
        { campus: { name: { contains: search as string } } },
        { campus: { institution: { name: { contains: search as string } } } },
      ];
    }

    if (institution) where.campus = { institution: { name: institution as string } };
    if (campus) where.campus = { ...where.campus, name: campus as string };
    if (department) where.department = { name: department as string };
    if (program) where.branch = { name: program as string };
    
    if (academicYear) where.academicYear = { year: academicYear as string };
    if (courseType) where.courseType = courseType as string;
    if (entryType) where.entryType = entryType as string;
    
    if (quota) {
      where.quotas = {
        some: { quotaName: quota as string }
      };
    }

    const programs = await prisma.program.findMany({
      where,
      include: {
        quotas: true,
        campus: { include: { institution: true } },
        department: true,
        branch: true,
        academicYear: true
      }
    });
    res.json(programs);
  } catch (error) {
    next(error);
  }
});

// POST /api/programs
// Accepts names directly — finds or creates each hierarchy entity in a single transaction.
router.post("/", async (req, res, next) => {
  try {
    const {
      institutionName,
      academicYear,
      campusName,
      departmentName,
      branchName,
      courseType,
      entryType,
      quotas, // [{ quotaName, totalSeats, feeAmount }]
    } = req.body;

    const program = await prisma.$transaction(async (tx: any) => {
      // 1. Institution — find or create
      const institution = await tx.institution.upsert({
        where: { name: institutionName },
        update: {},
        create: { name: institutionName },
      });

      // 2. Academic Year — find or create globally
      const ay = await tx.academicYear.upsert({
        where: { year: academicYear },
        update: {},
        create: { year: academicYear },
      });

      // 3. Campus — find or create under that institution
      const campus = await tx.campus.upsert({
        where: { institutionId_name: { institutionId: institution.id, name: campusName } },
        update: {},
        create: { name: campusName, institutionId: institution.id },
      });

      // 4. Department — find or create globally
      const department = await tx.department.upsert({
        where: { name: departmentName },
        update: {},
        create: { name: departmentName },
      });

      // 5. Branch — find or create globally
      const branch = await tx.branch.upsert({
        where: { name: branchName },
        update: {},
        create: { name: branchName },
      });

      // 6. Create the program with quotas
      return tx.program.create({
        data: {
          campusId: campus.id,
          departmentId: department.id,
          branchId: branch.id,
          academicYearId: ay.id,
          courseType,
          entryType,
          quotas: {
            create: quotas.map((q: any) => ({
              quotaName: q.quotaName,
              totalSeats: q.totalSeats,
              feeAmount: q.feeAmount,
            })),
          },
        },
        include: { quotas: true },
      });
    });

    res.status(201).json(program);
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(409).json({
        error: "Duplicate Program",
        message: "A program with this configuration (Same Branch, Academic Year, Course & Entry Type) already exists.",
      });
    }
    next(error);
  }
});

// GET /api/programs/:id
router.get("/:id", async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const program = await prisma.program.findUnique({
      where: { id },
      include: { quotas: true }
    });
    
    if (!program) {
      return res.status(404).json({ error: "Program not found" });
    }
    
    res.json(program);
  } catch (error) {
    next(error);
  }
});

export default router;
