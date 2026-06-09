import express from "express";
import { deleteUserProfileController,getAllUsersController, loginUserController, logoutUser, resetPasswordController, resetPasswordRequestController, resgisterUserController, updatePasswordController, updateUserProfileController, userProfileController,combindata,getUserRole } from "../controls/userController.js";
import { isAdmin, isAuthenticatedUser } from "../util/userAuth.js";
const userRouter = express.Router();

userRouter.post("/register-user", resgisterUserController);
userRouter.post("/login-user", loginUserController);
userRouter.get("/get-all-users", isAuthenticatedUser,isAdmin("admin"),  getAllUsersController);
userRouter.get("/user-profile", isAuthenticatedUser, userProfileController);
userRouter.put("/update-profile", isAuthenticatedUser, updateUserProfileController);
userRouter.delete("/delete-profile", isAuthenticatedUser, deleteUserProfileController);
userRouter.get("/logout",isAuthenticatedUser,logoutUser);
userRouter.post("/reset-password-request", resetPasswordRequestController);
userRouter.post("/reset-password/:token", resetPasswordController);
userRouter.put("/update-password",isAuthenticatedUser, updatePasswordController)
userRouter.get("/combin-data" ,isAuthenticatedUser, combindata)
 
export default userRouter

    