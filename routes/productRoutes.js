// استيراد express
// express هو framework يساعدنا نبني backend بسهولة
import express from "express";

/*
استيراد الـ controllers الخاصة بالمنتجات

كل controller مسؤول عن عملية معينة:

createProducts
إنشاء منتج

getAllProducts
جلب كل المنتجات

getProductDetail
جلب منتج واحد

updateProductController
تعديل منتج

deleteProductController
حذف منتج
*/
import {
    createProducts,
    deleteProductController,
    getAllProducts,
    getProductDetail,
    updateProductController
}
from "../controls/productController.js";

/*
استيراد middleware خاص بالحماية والصلاحيات

isAuthenticatedUser
يتأكد أن المستخدم مسجل دخول

isAdmin("admin")
يتأكد أن المستخدم أدمن
*/
import {
    isAdmin,
    isAuthenticatedUser
}
from "../util/userAuth.js";

/*
إنشاء Router جديد
الـ Router مسؤول عن تنظيم الـ routes
بدل ما نضع كل routes داخل server.js
نضعها هنا لتنظيم المشروع
*/
const productsRouter = express.Router();
/*
=====================================================
CREATE PRODUCT
=====================================================

POST
يستخدم لإرسال بيانات وإنشاء شيء جديد

الرابط:
 /create-product
*/

productsRouter.post(

    // الرابط
    "/create-product",
    /*
    middleware رقم 1

    يتأكد أن المستخدم مسجل دخول

    إذا لم يكن مسجل دخول:
    يمنعه
    */
    isAuthenticatedUser,
    /*
    middleware رقم 2
    يتأكد أن المستخدم أدمن
    لماذا؟
    لأن إنشاء المنتجات فقط للأدمن
    */
    isAdmin("admin"),
    /*
    controller النهائي
    إذا نجحت كل الشروط السابقة
    يتم تشغيل createProducts
    */
    createProducts
);

/*
=====================================================
GET ALL PRODUCTS
=====================================================
GET
يستخدم لجلب البيانات
*/
productsRouter.get(
    // الرابط
    "/get-all-products",
    /*
    controller جلب المنتجات
    هنا لا يوجد حماية
    لأن أي شخص يستطيع مشاهدة المنتجات
    */
    getAllProducts
);
/*
=====================================================
GET PRODUCT DETAIL
=====================================================
جلب تفاصيل منتج واحد
*/

productsRouter.get(
    /*
    :id
    يسمى route parameter
    يعني id متغير
    مثال:
    /product-detail/123
    123 هو id
    */
    "/product-detail/:id",
    // controller
    getProductDetail
);

/*
=====================================================
UPDATE PRODUCT
=====================================================
PUT
يستخدم للتعديل
*/
productsRouter.put(
    /*
    رابط التعديل
    :id
    id المنتج المراد تعديله
    */
    "/update-product/:id",
    /*
    التأكد أن المستخدم مسجل دخول
    */
    isAuthenticatedUser,
    /*
    التأكد أنه أدمن
    */
    isAdmin("admin"),
    /*
    controller التعديل
    */
    updateProductController
);

/*
=====================================================
DELETE PRODUCT
=====================================================

DELETE
يستخدم للحذف
*/

productsRouter.delete(
    /*
    رابط الحذف
    :id
    id المنتج المراد حذفه
    */
    "/delete-product/:id",
    /*
    حماية:
    لازم يكون مسجل دخول
    */
    isAuthenticatedUser,
    /*
    لازم يكون أدمن
    */
    isAdmin("admin"),
    /*
    controller الحذف
    */
    deleteProductController
);

/*
تصدير الـ router
حتى نستطيع استخدامه داخل server.js
*/
export default productsRouter;

/*
=====================================================
HTTP METHODS
=====================================================

هذه أهم أنواع الطلبات في الـ API
*/
/*
POST
يستخدم لإرسال بيانات جديدة للسيرفر
مثال:
إنشاء منتج جديد
إنشاء مستخدم
*/
 // post ( to set the data in database and save that data in database )
/*
GET

يستخدم لجلب البيانات من قاعدة البيانات

مثال:
عرض المنتجات
عرض المستخدمين
*/
 // get ( to retrieve the data from database )
/*
PUT / PATCH

كلاهما يستخدم للتعديل

PUT:
غالبًا لتعديل كامل البيانات

PATCH:
غالبًا لتعديل جزء من البيانات فقط
*/
 // put / patch
/*
DELETE
لحذف البيانات
مثال:
حذف منتج
حذف مستخدم
*/
 // delete ( to delete something from database)