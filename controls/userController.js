    import User from "../models/userModel.js"
    import { sendToken } from "../util/jwtToken.js";
    import { sendEmail } from "../util/sendMail.js";
    import crypto from "crypto"
    import Product from "../models/productModel.js";
    import Order from "../models/orderModel.js";


    export const resgisterUserController = async (req, res) => {
        try {
            const { name, email, password } = req.body;
            const user = await User.create({
                name,
                email,
                password,
                profile: {
                    public_id: "id",
                    url: "url"
                }
            })

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: "user not created successfully"
                })
            }

            sendToken(user, 200, res)
        } catch (error) {
            return res.status(500).json({
                success: false,
                error
            })
        }
    }


    export const loginUserController = async (req, res) => {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: "Email and password cannot be empty"
                })
            };

            const user = await User.findOne({ email }).select("+password");
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: "User not found"
                })
            }

            let passwordMatched = await user.comparePassword(password)

            if (!passwordMatched) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid credentials"
                })
            }

            sendToken(user, 200, res)

        } catch (error) {
            return res.status(500).json({
                success: false,
                error
            })
        }
    }

    // get all users
    export const getAllUsersController = async (req, res) => {
        try {
            const users = await User.find();
            if (!users) {
                return res.status(400).json({
                    success: false,
                    message: "No users found"
                })
            }

            return res.status(200).json({
                success: true,
                users
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                error
            })
        }
    }

    export const userProfileController = async (req, res) => {
        try {
            const user = await User.findById(req.user._id);
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: "User not found"
                })
            }

            return res.status(200).json({
                success: true,
                user
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                error
            })
        }
    }

   export const getUserRole = async (req, res) => {
        try {
            const user = await User.findById(req.user._id);
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: "User not found"
                })
            }

            return res.status(200).json({
                success: true,
                role: user.role
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                error
            })
        }
    }
    //------------

    export const updateUserProfileController = async (req, res) => {
        try {

            // هنا تم التعديل على الكود بحيث يتم تحديث بيانات المستخدم الذي قام بتسجيل الدخول وليس أي مستخدم آخر عن طريق استخدام req.user._id بدلاً من req.params.id
            let user = await User.findByIdAndUpdate(req.user._id, req.body, {
                new: true,
                runValidators: true
            })
            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: "User not found"
                })
            }

            return res.status(200).json({
                success: true,
                message: "User updated successfully",
                user
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                error
            })
        }

    }

    export const deleteUserProfileController = async (req, res) => {
        try {
            // let user = await User.findById(req.params.id);
            // if(!user){
            //     return res.status(400).json({
            //         success : false,
            //         message : "user not found"
            //     })
            // }

            // user = await User.findByIdAndDelete(req.params.id);
            let user = await User.findByIdAndDelete(req.user._id);

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: "user not found"
                })
            }
            return res.status(200).json({
                success: true,
                message: "user deleted successfully"
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                error
            })
        }
    }

    export const logoutUser = async (req, res) => {
        try {
            res.cookie("token", null, {
                expires: new Date(Date.now()),
                httpOnly: true
            })

            return res.status(200).json({
                success: true,
                message: "User loggedout successfully"
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                error
            })
        }
    }

    export const resetPasswordRequestController = async (req, res) => {
        try {
            const { email } = req.body;
            const user = await User.findOne({ email });

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: "User not found"
                })
            }

            let resetToken = user.resetPassword();
            console.log(resetToken);
            await user.save({ validateBeforeSave: false })

            const resetPasswordUrl = `http://localhost:5173/reset-password/${resetToken}`
            const message = `if you want to reset your password click on above link ${resetPasswordUrl}`;

            console.log(resetPasswordUrl);
            console.log(message);

            await sendEmail({
                email: user.email,
                subject: "Reset Password Request",
                message
            })

            res.status(200).json({
                success: true,
                message: `Email sent successfully to ${user.email}`
            })

        } catch (error) {
            return res.status(500).json({
                success: false,
                error
            })
        }
    }

    export const resetPasswordController = async (req, res) => {
        try {
            console.log(req.params.token);
            const resetPasswordToken = crypto.createHash("sha256").update(req.params.token).digest("hex");

            const user = await User.findOne({
                resetPasswordToken,
                resetPasswordExpire: { $gt: Date.now() }
            });

            if (!user) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid token or its been expired"
                })
            }

            const { password, confirmPassword } = req.body;
            if (password !== confirmPassword) {
                return res.status(400).json({
                    success: false,
                    message: "Password doesnt match to each other"
                })
            }

            user.password = password;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;

            await user.save();
            sendToken(user, 200, res)
        } catch (error) {
            return res.status(500).json({
                success: false,
                error
            })
        }
    }

    export const updatePasswordController = async (req, res) => {
        try {
            console.log("in try block");

            const { oldPassword, newPassword, confirmNewPassword } = req.body;
            const user = await User.findById(req.user._id).select("+password");
            const isPasswordMatched = await user.comparePassword(oldPassword);

            if (!isPasswordMatched) {
                return res.status(400).json({
                    success: false,
                    message: "Old password is incorrect"
                })
            }

            if (newPassword !== confirmNewPassword) {
                return res.status(400).json({
                    success: false,
                    message: "Password doesnt match to each other"
                })
            }

            user.password = newPassword;
            await user.save();
            sendToken(user, 200, res)
        } catch (error) {
            console.log(error);

            return res.status(500).json({
                success: false,
                error
            })
        }
    }

  export  const combindata = async (req, res) => {
        try {
            const users = await User.find();
            const products = await Product.find();
            const orders = await Order.find();
            let total = 0;
            orders.forEach(order => {
                total += order.totalPrice;
            }); 
            return res.status(200).json({
                success: true,
                users: users.length,
                products: products.length,
                orders: orders.length,
                total
            })
        } catch (error) {
            return res.status(500).json({
                success: false,
                error
            })
        }   
          
    }

    // post and put
