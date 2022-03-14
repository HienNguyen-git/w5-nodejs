const app = require('express')()
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const credential = require('./credential')
const mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:24017')


const port = 5551
app.set('view engine', 'handlebars')
app.set('env', 'production')
app.engine('handlebars', expressHandlebars.engine({
    defaultLayout: 'main'
}))
app.use(require('cookie-parser')(credential.cookieSecret))
app.use(require('express-session')())

const studentSchema = mongoose.Schema({
    username: String,
    password: String,
    fullName: String
})

const Student = mongoose.model('Student', studentSchema)

new Student({
    username: 'tronghien',
    password: '123456',
    fullName: "Nguyen Trong Hien"
}).save()



app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

app.use((req, res, next) => {
    res.locals.flash = req.session.flash;
    delete req.session.flash
    next()
})

app.get('/login', (req, res) => {
    console.log('User access login page')
    res.render('login')
})

app.post('/login', (req, res) => {
    console.log("User send login request")
    let error
    const username = req.body.username;
    const pwd = req.body.pwd
    console.log(username, pwd)
    if (!username) {
        error = "Please enter your username"
        res.render('login', { error, isError: true })
    } else if (!pwd) {
        error = "Please enter your password"
        res.render('login', { error, isError: true })
    } else if (("" + pwd).length < 6) {
        error = "Password must at least 6 letter"
        res.render('login', { error, isError: true })
    } else {
        res.render('success')
        // Student.findOne({username:req.body.username,password:req.body.pwd},(err,user)=>{
        //     if(!err) throw new Error('Something went wrong')
        //     res.render('success')
        // })
    }
})

app.use('/', (req, res, next) => {
    res.render('home')
})
app.listen(port, () => {
    console.log('App is running at http://localhost:' + port)
})