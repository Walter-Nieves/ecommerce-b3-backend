import { Router } from "express";
import { getAllTag } from "../controllers/tag.controller";

const router = Router();

router.get("/all", getAllTag);
// router.get("/all-deleted", );
// router.get("/:id", );

// router.post("/", );

// router.put("/:id", );

// router.delete("/force/:id", );
// router.delete("/:id", );

// router.patch("/restore/:id", );


// router.get("/all-deleted", (req, res) => {
//     res.send("all deleted");
// });

// router.get("/:id", (req, res) => {
//     res.send("get by id");
// });

// router.post("/", (req, res) => {
//     res.send("create tag");
// });

// router.put("/:id", (req, res) => {
//     res.send("update tag");
// });

// router.delete("/force/:id", (req, res) => {
//     res.send("force delete");
// });

// router.delete("/:id", (req, res) => {
//     res.send("soft delete");
// });

// router.patch("/restore/:id", (req, res) => {
//     res.send("restore tag");
// });

export default router;