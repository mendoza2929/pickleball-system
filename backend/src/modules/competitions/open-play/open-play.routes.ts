import { Router } from "express";

import {
  createNextMatch,
} from "./open-play.controller";

const router = Router();


// ==================================================
// CREATE NEXT OPEN PLAY MATCH
// ==================================================

router.post(
  "/sessions/:sessionId/next-match",
  createNextMatch
);


export default router;