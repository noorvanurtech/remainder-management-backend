import express from "express";
import {
  createUser,
  getAllUsers,
  createSuperAdmin,
  getUserStats,
  getUserActivity,
  updateUser,
  updateProfile,
  getUserById,
  getMe,
  deleteUser,
} from "../controllers/userController";
import { protect, authorize } from "../middleware/auth.middleware";
import { ROLES } from "../constants/index";

const router = express.Router();

// Public route for creating Super Admin (Protect with secret key in body)
router.post("/super-admin", createSuperAdmin);

// Admin & Workshop Routes
router.use(protect);    // 

router.get("/me", getMe);
router.patch("/profile", updateProfile);

// Only Admin and Super Admin can see stats/activity
router.get("/stats", authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), getUserStats);
router.get(
  "/activity",
  authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN),
  getUserActivity,
);

router.patch("/:id", updateUser); // Generic update endpoint
router.delete("/:id", authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), deleteUser);

router
  .route("/")
  .get(getAllUsers)
  .post(authorize(ROLES.ADMIN, ROLES.SUPER_ADMIN), createUser);

router.get("/details/:id", getUserById);

export default router;
