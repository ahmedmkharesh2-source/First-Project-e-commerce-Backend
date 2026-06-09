// استيراد مكتبة mongoose
// mongoose هي التي تربط Node.js مع MongoDB
import mongoose from "mongoose";



/*
==================================================
Schema
==================================================

الـ Schema معناها:
شكل البيانات داخل قاعدة البيانات

يعني نحن هنا نقول لـ MongoDB:

المنتج لازم يحتوي على:
- title
- description
- price
- images
- reviews
...إلخ

وكأننا نرسم "قالب" للمنتج
*/

const productSchema = new mongoose.Schema(

  // هنا تبدأ خصائص المنتج
  {

    title: {
      type: String,
      
      required: [true, "Title is required"],
    
      maxLength: [100, "Title must be under 100 characters"],
    },

    description: {
      type: String,
      required: [true, "Description is required"],
    },

    price: {
      type: Number,

      required: [true, "Price is required"],

      max: [999999, "Price must be under 6 digits"],
    },

    category: {

      type: String,

      required: [true, "Category is required"],
    },

    ratings: {

      // التقييم رقم
      type: Number,
      default: 0,
    },
    /*
    images عبارة عن Array
    لماذا Array ؟
    لأن المنتج يمكن يحتوي على أكثر من صورة
    مثال:
    [
      image1,
      image2,
      image3
    ]
    */
    images: [
      {
        /*
        public_id
        هذا يأتي غالبًا من cloudinary
        وهو id خاص بالصورة
        حتى نستطيع حذفها أو تعديلها لاحقًا
        */
        public_id: {
          type: String,
          required: true,
        },
        url: {
          type: String,
          required: true,
        },
      },
    ],
    //---  الكمية
    stock: {
      type: Number,
      required: [true, "Stock is required"],
      maxLength: [5, "Stock must be under 5 digits"],

      default: 1,
    },
//المراجعات
    numOfReviews: { 
      type: Number,
      default: 0,
    },
    /*
    reviews عبارة عن Array
    لماذا؟
    لأن المنتج يمكن أن يحتوي على
    مراجعات كثيرة من المستخدمين
    */

    reviews: [

      {
        name: {
          type: String,
          required: true,
        },

        comment: {
          type: String,
          required: true,
        },
        rating: {
          type: Number,
          required: true,
        },
      },
    ],

    user: {
      /*
      ObjectId
      يعني هنا نخزن id خاص بمستخدم
      لماذا؟
      حتى نعرف:
      من الشخص الذي أنشأ المنتج
      */
      type: mongoose.Schema.ObjectId,
      /*
      ref: "User"
      معناها:
      هذا الـ id مرتبط بموديل اسمه User
      أي يوجد علاقة بين:
      Product
      و
      User
      وهذا يسمى:
      Relationship
      مثل:
      المنتج يتبع لأي مستخدم؟
      */
      ref: "User"
    }
  },

  {
    /*
    timestamps: true
    يقوم mongoose بإنشاء:
    createdAt
    updatedAt
    تلقائيًا
    لماذا هذا مهم؟
    حتى تعرف:
    - متى تم إنشاء المنتج
    - متى تم تعديله
    */
    timestamps: true,
  }
);

/*
==================================================
MODEL
==================================================

هنا ننشئ Model اسمه Product
الـ Model هو الذي نتعامل معه في الـ controller
مثل:
Product.create()
Product.find()
بدون model لا نستطيع التعامل مع MongoDB
*/
const Product = mongoose.model("Product", productSchema);

export default Product;