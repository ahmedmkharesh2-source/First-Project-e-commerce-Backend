import express from "express";
import multer from "multer"; // ✅ أضف هذا
import { changeUserRole, deleteUserProfileController, getAllUsersController, loginUserController, logoutUser, resetPasswordController, resetPasswordRequestController, resgisterUserController, updatePasswordController, updateUserProfileController, userProfileController, combindata, getUserRole } from "../controls/userController.js";
import { isAdmin, isAuthenticatedUser } from "../util/userAuth.js";

const userRouter = express.Router();

// ✅ إعداد multer (memory storage عشان نرفع على Cloudinary)
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB حد أقصى
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith("image/")) {
            cb(null, true);
        } else {
            cb(new Error("Only images are allowed"), false);
        }
    }
});

userRouter.post("/register-user", resgisterUserController);
userRouter.post("/login-user", loginUserController);
userRouter.get("/get-all-users", isAuthenticatedUser, isAdmin("admin"), getAllUsersController);
userRouter.get("/user-profile", isAuthenticatedUser, userProfileController);
userRouter.put("/update-profile", isAuthenticatedUser, upload.single("avatar"), updateUserProfileController); // ✅ أضف upload.single
userRouter.delete("/delete-profile", isAuthenticatedUser, deleteUserProfileController);
userRouter.get("/logout", isAuthenticatedUser, logoutUser);
userRouter.post("/reset-password-request", resetPasswordRequestController);
userRouter.post("/reset-password/:token", resetPasswordController);
userRouter.put("/update-password", isAuthenticatedUser, updatePasswordController);
userRouter.get("/combin-data", isAuthenticatedUser, combindata);
userRouter.put("/change-user-role/:id", isAuthenticatedUser, isAdmin("admin"), changeUserRole);

export default userRouter;