const app = require('express')()
const expressHandlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const credential = require('./credential')
var mongoose = require('mongoose')

mongoose.connect('mongodb://localhost:27017/student', { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
    if (!err) console.log('Connect to database successful!')
    else console.error('Fail to connect database')
})


const port = 5551
app.set('view engine', 'handlebars')
app.set('env', 'production')
app.engine('handlebars', expressHandlebars.engine({
    defaultLayout: 'main'
}))
app.use(require('cookie-parser')(credential.cookieSecret))
app.use(require('express-session')())

var Student = require('./models/student')
const { render } = require('express/lib/response')

Student.find((err, std) => {
    console.log('Checking data....')
    if (std.length) return
    console.log('Initialize data')
    new Student({
        username: 'student',
        password: '123456',
        fullName: 'Student'
    }).save()
})


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
    const username = ""+req.body.username.trim();
    const pwd = ""+req.body.pwd.trim()
    if (!username) {
        error = "Please enter your username"
        
        req.session.flash = {
            type:"danger",
            intro:"Missing some input data",
            message: "Please check again!"
        }

        return res.redirect(303,'/login')

        // return res.render('login', { error, isError: true })
    } else if (!pwd) {
        error = "Please enter your password"
        
        req.session.flash = {
            type:"danger",
            intro:"Missing some input data",
            message: "Please check again!"
        }

        return res.redirect(303,'/login')

        // return res.render('login', { error, isError: true })
    } else if (pwd.length < 6) {

        
        req.session.flash = {
            type:"danger",
            intro:"Your password wrong",
            message: "Password must at least 6 letter!"
        }
        return res.redirect(303,'/login')


        // error = "Password must at least 6 letter"
        // return res.render('login', { error, isError: true })
    } else {
        Student.findOne({ username: req.body.username, password: req.body.pwd }, (err, user) => {
            if(!user||err){
                req.session.flash = {
                    type:"danger",
                    intro:"Login error",
                    message: "Your account is not exist!"
                }
                res.redirect(303,'/login')
                // return res.render('login', { error: 'Your account is not exist', isError: true })
            }
            else {
                req.session.flash = {
                    type:"success",
                    intro:"Login alert",
                    message: "Login successful!"
                }
                res.redirect('/get-students')
                // console.log(user)
                // res.status(200).redirect('/get-students')
            }

        })
    }
})

app.get('/add', (req, res) => { res.render('add') })
app.post('/add', (req, res) => {
    const username = req.body.username;
    const fullName = req.body.fullName
    if (!username) {
        error = "Please enter your username"
        
        req.session.flash = {
            type:"danger",
            intro:"Missing some input data",
            message: "Please check again!"
        }

        return res.render('add', { error, isError: true })
    } else if (!fullName) {
        error = "Please enter your full name"
        
        req.session.flash = {
            type:"danger",
            intro:"Missing some input data",
            message: "Please check again!"
        }

        return res.render('add', { error, isError: true })
    } else {
        const newStd = {
            username, password: username, fullName
        }
        const data = new Student(newStd)
        data.save()
        res.status(303).redirect('/get-students')
    }
})

app.get('/get-students', (req, res) => {
    Student.find((err, students) => {
        console.log(students)
        const context = {
            students: students.map(function (std) {
                return {
                    id: std.id,
                    username: std.username,
                    fullName: std.fullName
                }
            })
        }
        res.render('get-students', context);
    });
})

app.post('/update', (req, res) => {
    const username = "" + req.body.username.trim();
    const fullName = "" + req.body.fullName.trim()
    if (!username) {
        error = "Username can not empty"
        
        req.session.flash = {
            type:"danger",
            intro:"Missing some input data",
            message: "Please check again!"
        }

        return res.render(`update`, { username: username, fullName: fullName, error, isError: true })
    } else if (!fullName) {
        error = "Full name can not empty"
        
        req.session.flash = {
            type:"danger",
            intro:"Missing some input data",
            message: "Please check again!"
        }

        return res.render(`update`, { username: username, fullName: fullName, error, isError: true })
    } else {
        Student.findOne({ username: username }, (err, student) => {
            if (!err) {
                student.username = username
                student.fullName = fullName
                student.save()
                res.status(200).redirect('get-students')
            } else {
        
                req.session.flash = {
                    type:"danger",
                    intro:"Missing some input data",
                    message: "Please check again!"
                }
        
                console.error(`Update student username=${username} fail`)
            }
        })
    }
})

app.get('/update/:username', (req, res) => {
    const username = "" + req.params.username.trim()
    console.log(username)
    Student.findOne({ username: username }, (err, student) => {
        if (!err) {
            res.render('update', { username: student.username, fullName: student.fullName })
        } else {
        
            req.session.flash = {
                type:"danger",
                intro:"Missing some input data",
                message: "Please check again!"
            }
    
            console.error(`Get student username=${username} fail`)
        }
    })
})


app.get('/delete/:id', (req, res) => {
    var id = req.params.id;
    Student.findByIdAndDelete(id).exec();
    res.status(200).redirect('/get-students');
})

app.get('/404', (req, res) => { res.render('404') })

app.use('/', (req, res) => {
    res.render('home')
})

app.listen(port, () => {
    console.log('App is running at http://localhost:' + port)
})