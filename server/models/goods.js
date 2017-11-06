/**
 * Created by JcShang on 2017/10/8.
 */

let mongoose = require('mongoose')
let Schema = mongoose.Schema;

var productSchema = new Schema({
  "productId": String,
  "productName": String,
  "salePrice": Number,
  "productImage": String,
  "productUrl": String,
  "productNum": Number,
  "checked": String
});

module.exports = mongoose.model('Goods', productSchema);
