import express from "express";
import {
  registerUser,
  findUserById,
  findUserProfile,
  deleteUser,
  getUsers
} from "../controllers/user";

const router = express.Router();

router.route("/api/users").post(registerUser);
router.route("/api/userslist/").get(getUsers);

router
  .route("/api/users/:userId")
  .get(findUserById)
  .delete(deleteUser);

router.param("userId", findUserById);

export default router;
