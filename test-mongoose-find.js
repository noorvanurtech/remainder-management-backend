const mongoose = require('mongoose');
const { Schema } = mongoose;
const ProductSchema = new Schema({ name: String });
const Product = mongoose.model('Product', ProductSchema);

const q = Product.find({ status: 'ACTIVE' });
q.find({ $or: [{ name: /Jeep/i }] });
q.find({});
console.log(q.getFilter());
