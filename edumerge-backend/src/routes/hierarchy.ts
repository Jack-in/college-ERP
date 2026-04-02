import { Router } from "express";
import prisma from "../prisma";

const router = Router();

// GET /api/institutions
router.get("/", async (req, res, next) => {
  try {
    const data = await prisma.institution.findMany({ select: { id: true, name: true } });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// POST /api/institutions
router.post("/", async (req, res, next) => {
  try {
    const { name } = req.body;
    const data = await prisma.institution.create({ data: { name } });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// GET /api/campuses (All)
router.get("/all/campuses", async (req, res, next) => {
  try {
    const data = await prisma.campus.findMany({ select: { id: true, name: true } });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// GET /api/departments (All)
router.get("/all/departments", async (req, res, next) => {
  try {
    const data = await prisma.department.findMany({ select: { id: true, name: true } });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// GET /api/branches (All)
router.get("/all/branches", async (req, res, next) => {
  try {
    const data = await prisma.branch.findMany({ select: { id: true, name: true } });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// GET /api/academic-years (All)
router.get("/all/academic-years", async (req, res, next) => {
  try {
    const data = await prisma.academicYear.findMany({ select: { id: true, year: true } });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// POST /api/academic-years
router.post("/academic-years", async (req, res, next) => {
  try {
    const { year } = req.body;
    const data = await prisma.academicYear.create({
      data: { year }
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// GET /api/institutions/:id/campuses
router.get("/:id/campuses", async (req, res, next) => {
  try {
    const institutionId = parseInt(req.params.id);
    const data = await prisma.campus.findMany({
      where: { institutionId },
      select: { id: true, name: true }
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// POST /api/campuses
router.post("/campuses", async (req, res, next) => {
  try {
    const { name, institutionId } = req.body;
    const data = await prisma.campus.create({
      data: { name, institutionId: parseInt(institutionId) }
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// POST /api/departments
router.post("/departments", async (req, res, next) => {
  try {
    const { name } = req.body;
    const data = await prisma.department.create({
      data: { name }
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// POST /api/branches
router.post("/branches", async (req, res, next) => {
  try {
    const { name } = req.body;
    const data = await prisma.branch.create({
      data: { name }
    });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// GET /api/campuses (All)
router.get("/all/campuses", async (req, res, next) => {
  try {
    const data = await prisma.campus.findMany({ select: { id: true, name: true } });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// GET /api/departments (All)
router.get("/all/departments", async (req, res, next) => {
  try {
    const data = await prisma.department.findMany({ select: { id: true, name: true } });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// GET /api/branches (All)
router.get("/all/branches", async (req, res, next) => {
  try {
    const data = await prisma.branch.findMany({ select: { id: true, name: true } });
    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
