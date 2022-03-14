const { default: mongoose } = require("mongoose");

const studentSchema = mongoose.Schema({
    username: String,
    password: String,
    fullName: String
})

module.exports = mongoose.model('Student', studentSchema)