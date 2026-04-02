import { Router } from "express";
import prisma from "../prisma";

const router = Router();

// GET /api/quotas
// Returns a unique list of all quota names currently used in the system
router.get("/", async (req, res, next) => {
  try {
    const standardQuotas = [
        { id: "KCET", name: "KCET" },
        { id: "COMEDK", name: "COMEDK" },
        { id: "Management", name: "Management" }
    ];
    res.json(standardQuotas);
  } catch (error) {
    next(error);
  }
});

export default router;
