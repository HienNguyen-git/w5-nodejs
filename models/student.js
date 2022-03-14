const { default: mongoose } = require("mongoose");

const studentSchema = mongoose.Schema({
    username: String,
    password: String,
    fullName: String
})
var Student = mongoose.model('Student', studentSchema)
module.exports = Student