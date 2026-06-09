// هذه الدالة مسؤولة عن انشاء وارسال jwt token للمستخدم

export const sendToken = (user, statusCode, res) => {

    // هنا نستدعي الدالة الموجودة داخل model
    // حتى يتم انشاء jwt token
    const token = user.getJWToken();



    // هنا وضعنا اعدادات الكوكيز
    const options = {

        // مدة انتهاء الكوكيز بعد 7 ايام
        expires: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
        ),



        // هذا الخيار يمنع الوصول للكوكيز من الجافاسكربت
        // ويزيد الحماية ضد الهجمات
        httpOnly: true,



        // هذا الخيار مهم جدا عند العمل بين
        // frontend و backend على localhost
        sameSite: "lax",



        // secure يعني يعمل فقط مع https
        // بما اننا نعمل على localhost نخليه false
        secure: false,
    };





    // هنا نرسل response للمستخدم
    // مع تخزين التوكن داخل الكوكيز
    res
        .status(statusCode)

        // هنا يتم حفظ التوكن داخل cookies
        .cookie("token", token, options)

        // هنا نرسل البيانات ك json
        .json({

            success: true,

            // ارسال التوكن
            token,

            // ارسال بيانات المستخدم
            user,
        });
};