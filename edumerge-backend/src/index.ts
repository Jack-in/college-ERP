import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import hierarchyRouter from "./routes/hierarchy";
import programsRouter from "./routes/programs";
import applicationsRouter from "./routes/applications";
import dashboardRouter from "./routes/dashboard";
import quotasRouter from "./routes/quotas";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Admin Hierarchy (Cascading dropdowns)
app.use("/api/institutions", hierarchyRouter);
app.use("/api/academic-years", hierarchyRouter);
app.use("/api/campuses", hierarchyRouter);
app.use("/api/departments", hierarchyRouter);
app.use("/api/branches", hierarchyRouter);

// Core features
app.use("/api/programs", programsRouter);
app.use("/api/applications", applicationsRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/quotas", quotasRouter);

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Error handling middleware overrides default express handler
app.use(errorHandler);

app.listen(port, () => {
  console.log(`🚀 edumerge-backend listening on port ${port}`);
});
