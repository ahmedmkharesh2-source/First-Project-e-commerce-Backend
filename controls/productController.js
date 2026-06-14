// استيراد موديل المنتجات من MongoDB
// هذا الموديل يحتوي شكل بيانات المنتج
import Product from "../models/productModel.js";


// استيراد الكلاس الخاص بالبحث والفلترة والتقسيم
import ApiFeatures from "../util/ApiFeatures.js";
import { v2 as cloudinary } from "cloudinary";



/*
=========================================
CREATE PRODUCT
إنشاء منتج جديد
=========================================
*/

// إنشاء controller خاص بإضافة منتج
export const createProducts = async (req, res) => {

    try {

        // هيّئ Cloudinary في كل استدعاء للتأكد من أن متغيرات البيئة محمّلة
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        // إذا جاءت صور بصيغة Base64 من الفرونت، نرفعها أولًا إلى Cloudinary
        const { images } = req.body;
        let uploadedImages = [];
        
        if (images && Array.isArray(images) && images.length > 0) {
            for (const image of images) {
                const uploaded = await cloudinary.uploader.upload(image, {
                    folder: "products",
                    width: 800,
                    crop: "scale",
                });
                uploadedImages.push({ 
                    public_id: uploaded.public_id, 
                    url: uploaded.secure_url 
                });
            }
        }

        // إنشاء منتج جديد داخل قاعدة البيانات
        // نضمّن مصفوفة الصور التي أنشأناها أعلاه
        const productData = { ...req.body, images: uploadedImages };
        const product = await Product.create(productData);


        // إذا لم يتم إنشاء المنتج
        if (!product) {

            // إرجاع رسالة خطأ
            return res.status(404).json({

                success: false,

                message: "Product not created"

            });
        }


        // إذا تم الإنشاء بنجاح
        return res.status(201).json({

            // success = true يعني العملية نجحت
            success: true,

            // رسالة نجاح
            message: "product created successfully",

            // إرجاع بيانات المنتج
            product

        });

    } catch (error) {

        // طباعة الخطأ في console
        console.log(error);


        // إذا حدث خطأ في السيرفر
        return res.status(500).json({

            success: false,

            error

        });
    }
};




/*
=========================================
GET ALL PRODUCTS
جلب جميع المنتجات
=========================================
*/

export const getAllProducts = async (req, res) => {

    try {

        /*
        Product.find()
        تعني:
        اجلب جميع المنتجات من قاعدة البيانات
        */

        /*
        ApiFeatures
        كلاس يساعدنا على:
        - البحث
        - الفلترة
        - تقسيم الصفحات pagination
        */

        const apiFunctionality = new ApiFeatures(

            // جلب المنتجات
            Product.find(),

            // البيانات القادمة من الرابط query
            req.query

        )

        // البحث
        .search()

        // الفلترة
        .filter()

        // pagination
        // .pagination();


        // تنفيذ الـ query
        const products = await apiFunctionality.query;


        // إذا لم يجد منتجات
        if (!products) {

            return res.status(404).json({

                success: false,

                message: "products not found"

            });
        }


        // إرجاع المنتجات
        return res.status(200).json({

            success: true,

            products

        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            error

        });
    }
};





/*
=========================================
GET SINGLE PRODUCT
جلب منتج واحد بالتفصيل
=========================================
*/

export const getProductDetail = async (req, res) => {

    try {

        /*
        req.params.id
        يعني:
        id القادم من الرابط

        مثال:
        /product/123

        123 = id
        */

        const product = await Product.findById(req.params.id);


        // إذا المنتج غير موجود
        if (!product) {

            return res.status(404).json({

                success: false,

                message: "product not found"

            });
        }


        // إذا المنتج موجود
        return res.status(200).json({

            success: true,

            product

        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            error

        });
    }
};






/*
=========================================
UPDATE PRODUCT
تعديل المنتج
=========================================
*/

export const updateProductController = async (req, res) => {

    try {

        // هيّئ Cloudinary في كل استدعاء للتأكد من أن متغيرات البيئة محمّلة
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
        });

        /*
        البحث عن المنتج أولًا
        */
        let product = await Product.findById(req.params.id);
        // إذا المنتج غير موجود
        if (!product) {

            return res.status(400).json({

                success: false,

                message: "Product not found"

            });
        }

        // معالجة الصور الجديدة إن وجدت
        const { newImages, keepExistingImages } = req.body;
        let finalImages = [];

        // إذا أراد المستخدم الاحتفاظ بالصور الموجودة
        if (keepExistingImages && product.images && product.images.length > 0) {
            finalImages = product.images;
        }

        // رفع الصور الجديدة إلى Cloudinary إن وجدت
        if (newImages && Array.isArray(newImages) && newImages.length > 0) {
            for (const image of newImages) {
                const uploaded = await cloudinary.uploader.upload(image, {
                    folder: "products",
                    width: 800,
                    crop: "scale",
                });
                finalImages.push({
                    public_id: uploaded.public_id,
                    url: uploaded.secure_url
                });
            }
        }

        // تحضير بيانات التحديث
        const updateData = { ...req.body };
        if (finalImages.length > 0) {
            updateData.images = finalImages;
        }
        delete updateData.newImages;
        delete updateData.keepExistingImages;

        /*
        findByIdAndUpdate
        تعني:
        ابحث عن المنتج ثم عدله
        */

        product = await Product.findByIdAndUpdate(

            // id المنتج
            req.params.id,

            // البيانات الجديدة القادمة من الـ frontend
            updateData,

            {
                /*
                new: true
                يعني:
                أرجع البيانات الجديدة بعد التعديل
                بدل القديمة
                */
                new: true,


                /*
                runValidators
                يشغل validation الموجود في model
                */
                runValidators: true
            }
        );


        // رسالة نجاح
        return res.status(200).json({

            success: true,

            message: "product updated successfully",

            product

        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            error

        });
    }
};

/*
=========================================
DELETE PRODUCT
حذف المنتج
=========================================
*/

export const deleteProductController = async (req, res) => {

    try {

        // البحث عن المنتج
        let product = await Product.findById(req.params.id);


        // إذا المنتج غير موجود
        if (!product) {

            return res.status(400).json({

                success: false,

                message: "Product not found"

            });
        }


        /*
        findByIdAndDelete
        حذف المنتج باستخدام id
        */
        product = await Product.findByIdAndDelete(req.params.id);


        // رسالة نجاح
        return res.status(200).json({

            success: true,

            message: "Product deleted successfully"

        });

    } catch (error) {

        return res.status(500).json({

            success: false,

            error

        });
    }
};