
const mongoose = require("mongoose");

const productTranscationSchema = new mongoose.Schema({
   id:{type:Number,required:true,unique:true},
   title:{type:String,required:true},
   price:{type:Number,required:true},
   description:{type:String,required:true},
   category:{type:String},
   image:{type:String},
   sold:{type:Boolean,required:true},
   dateOfSale:{type:Date,required:true}
});


module.exports = mongoose.model("Product", productTranscationSchema);