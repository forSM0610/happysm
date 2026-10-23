import { Router, type IRouter } from "express";
import healthRouter from "./health";
import healthProfileRouter from "./healthProfile";

const router: IRouter = Router();

router.use(healthRouter);
router.use(healthProfileRouter);

export default router;
