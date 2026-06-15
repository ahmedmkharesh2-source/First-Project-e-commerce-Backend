export const sendToken = (user, statusCode, res) => {

    const token = user.getJWToken();

    const options = {
        expires: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
        ),
        httpOnly: true,
        sameSite: "none",  // ✅ مهم للدومينات المختلفة
        secure: true,      // ✅ مهم مع https
    };

    res
        .status(statusCode)
        .cookie("token", token, options)
        .json({
            success: true,
            token,
            user,
        });
};