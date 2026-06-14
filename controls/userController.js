import User from "../models/userModel.js"
import { sendToken } from "../util/jwtToken.js";
import { sendEmail } from "../util/sendMail.js";
import crypto from "crypto"
import Product from "../models/productModel.js";
import Order from "../models/orderModel.js";
import { v2 as cloudinary } from "cloudinary";


// ✅ config  هنا
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
// ============================================
// REGISTER
// ============================================
export const resgisterUserController = async (req, res) => {
    try {
             cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        const { name, email, password, avatar } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: "Please fill all fields" });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: "Email already exists" });
        }

        let profileData = {
            public_id: "default_avatar",
            url: "https://via.placeholder.com/150"
        };

        if (avatar && avatar.startsWith("data:image")) {
            const result = await cloudinary.uploader.upload(avatar, { // ✅ بدون .v2
                folder: "users",
                width: 150,
                crop: "scale"
            });
            profileData = {
                public_id: result.public_id,
                url: result.secure_url
            };
        }

        const user = await User.create({ name, email, password, profile: profileData });
        sendToken(user, 200, res);

    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: error.message });
    }
};

// ============================================
// LOGIN
// ============================================
export const loginUserController = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ success: false, message: "Email and password cannot be empty" });
        }

        const user = await User.findOne({ email }).select("+password");
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        let passwordMatched = await user.comparePassword(password);
        if (!passwordMatched) {
            return res.status(400).json({ success: false, message: "Invalid credentials" });
        }

        sendToken(user, 200, res);

    } catch (error) {
        return res.status(500).json({ success: false, error });
    }
};

// ============================================
// GET ALL USERS
// ============================================
export const getAllUsersController = async (req, res) => {
    try {
        const users = await User.find().select("-password -__v");
        
        if (!users || users.length === 0) {
            return res.status(400).json({ success: false, message: "No users found" });
        }

        return res.status(200).json({ success: true, users });
    } catch (error) {
        return res.status(500).json({ success: false, error });
    }
};

// ============================================
// USER PROFILE
// ============================================
export const userProfileController = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password -__v");
        
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({ success: true, user });
    } catch (error) {
        return res.status(500).json({ success: false, error });
    }
};

// ============================================
// GET USER ROLE
// ============================================
export const getUserRole = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("role");
        
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        return res.status(200).json({ success: true, role: user.role });
    } catch (error) {
        return res.status(500).json({ success: false, error });
    }
};

// ============================================
// UPDATE PROFILE
// ============================================
export const updateUserProfileController = async (req, res) => {
    try {
           cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        const { name, email } = req.body;
        const userId = req.user._id;

        if (!name || !email) {
            return res.status(400).json({ success: false, message: "Name and email are required" });
        }

        const currentUser = await User.findById(userId);
        if (!currentUser) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        let updateData = { name: name.trim(), email: email.trim() };

        if (req.file) {
            console.log("✅ صورة جديدة موجودة");

            // ✅ حذف الصورة القديمة فقط لو كانت Cloudinary حقيقية (مش Base64 ومش default)
            const oldPublicId = currentUser.profile?.public_id;
            const oldUrl = currentUser.profile?.url;
            const isRealCloudinaryImage = 
                oldPublicId && 
                oldPublicId !== "default_avatar" && 
                oldPublicId !== "id" && 
                !oldUrl?.startsWith("data:image");

            if (isRealCloudinaryImage) {
                await cloudinary.uploader.destroy(oldPublicId);
            }

            // ✅ رفع الصورة الجديدة
            const uploadResult = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: "avatars", width: 300, height: 300, crop: "fill", quality: 80 },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(req.file.buffer);
            });

            updateData.profile = {
                public_id: uploadResult.public_id,
                url: uploadResult.secure_url
            };
        }

        const user = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select("-password -__v");

        return res.status(200).json({ success: true, message: "Profile updated successfully", user });

    } catch (error) {
        console.log("❌ خطأ:", error);
        return res.status(500).json({ success: false, message: error.message || "Something went wrong" });
    }
};

// ============================================
// DELETE PROFILE
// ============================================
export const deleteUserProfileController = async (req, res) => {
    try {

          cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });
        const userId = req.user._id;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        // ✅ حذف الصورة فقط لو Cloudinary حقيقية
        const oldPublicId = user.profile?.public_id;
        const oldUrl = user.profile?.url;
        const isRealCloudinaryImage = 
            oldPublicId && 
            oldPublicId !== "default_avatar" && 
            oldPublicId !== "id" && 
            !oldUrl?.startsWith("data:image");

        if (isRealCloudinaryImage) {
            await cloudinary.uploader.destroy(oldPublicId); // ✅ بدون .v2
        }

        await User.findByIdAndDelete(userId);

        return res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, error });
    }
};

// ============================================
// LOGOUT
// ============================================
export const logoutUser = async (req, res) => {
    try {
        res.cookie("token", null, {
            expires: new Date(Date.now()),
            httpOnly: true
        });

        return res.status(200).json({ success: true, message: "User logged out successfully" });
    } catch (error) {
        return res.status(500).json({ success: false, error });
    }
};

// ============================================
// RESET PASSWORD REQUEST
// ============================================
export const resetPasswordRequestController = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        let resetToken = user.resetPassword();
        await user.save({ validateBeforeSave: false });

        const resetPasswordUrl = `http://localhost:5173/reset-password/${resetToken}`;
        const message = `Click to reset: ${resetPasswordUrl}`;

        await sendEmail({ email: user.email, subject: "Reset Password", message });

        res.status(200).json({ success: true, message: `Email sent to ${user.email}` });

    } catch (error) {
        return res.status(500).json({ success: false, error });
    }
};

// ============================================
// RESET PASSWORD
// ============================================
export const resetPasswordController = async (req, res) => {
    try {
        const resetPasswordToken = crypto
            .createHash("sha256")
            .update(req.params.token)
            .digest("hex");

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ success: false, message: "Invalid or expired token" });
        }

        const { password, confirmPassword } = req.body;
        if (password !== confirmPassword) {
            return res.status(400).json({ success: false, message: "Passwords don't match" });
        }

        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save();
        sendToken(user, 200, res);
        
    } catch (error) {
        return res.status(500).json({ success: false, error });
    }
};

// ============================================
// UPDATE PASSWORD
// ============================================
export const updatePasswordController = async (req, res) => {
    try {
        const { oldPassword, newPassword, confirmNewPassword } = req.body;
        const user = await User.findById(req.user._id).select("+password");
        
        const isPasswordMatched = await user.comparePassword(oldPassword);
        if (!isPasswordMatched) {
            return res.status(400).json({ success: false, message: "Old password is incorrect" });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ success: false, message: "Passwords don't match" });
        }

        user.password = newPassword;
        await user.save();
        sendToken(user, 200, res);
        
    } catch (error) {
        return res.status(500).json({ success: false, error });
    }
};

// ============================================
// COMBINED DATA
// ============================================
export const combindata = async (req, res) => {
    try {
        const [usersCount, productsCount, orders] = await Promise.all([
            User.countDocuments(),
            Product.countDocuments(),
            Order.find().select("totalPrice")
        ]);

        const totalRevenue = orders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

        return res.status(200).json({
            success: true,
            users: usersCount,
            products: productsCount,
            orders: orders.length,
            totalRevenue
        });
    } catch (error) {
        return res.status(500).json({ success: false, error });
    }
};

// ============================================
// CHANGE USER ROLE
// ============================================
export const changeUserRole = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const { role } = req.body;
        if (!role) {
            return res.status(400).json({ success: false, message: "Role is required" });
        }

        user.role = role;
        await user.save();

        return res.status(200).json({ success: true, message: `Role updated to ${role}`, user });
    } catch (error) {
        return res.status(500).json({ success: false, error });
    }
};