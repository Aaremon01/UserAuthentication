const mysql = require("mysql");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const path = require('path');

const { promisify } = require("util");

const db = mysql.createConnection({
    // host: process.env.HOST,
    // user: process.env.DATABASE_USER,
    // password: process.env.PASSWORD,
    // database: process.env.DATABASE
    host: "localhost",
    user:"root", 
    password: null,
    database:"project"
});
exports.login = async (req, res) => {
    const tempDir= __dirname.toString().substring(0, __dirname.toString().length - 11)

    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).sendFile(path.join(tempDir, '/public/studentlogin.html'), {
                message: "Please Provide an email and password"
            })
        }
        console.log("Reach "+email+" "+password)
        db.query('SELECT * FROM students WHERE email = ?', [email], async (err, results) => {
            console.log(results[0].password);
            const temp=await bcrypt.compare(password, results[0].password)
            console.log(temp)
            if (!results || !await bcrypt.compare(password, results[0].password)) {
                res.status(401).sendFile(path.join(tempDir , '/public/studentlogin.html'), {
                    message: 'Email or Password is incorrect'
                })
            } else {
                console.log(results)
                const id = results[0].student_id;
                console.log("ID:"+id)
                const secret = 'mysecretKey'

                const token = jwt.sign({ id },secret, {
                    expiresIn: 3600
                    
                });

                console.log("the token is " + token);

                const cookieOptions = {
                    expires: new Date(
                        Date.now() + 3600 * 1000
                    ),
                    httpOnly: true
                }
                console.log("Reach 1")
                res.cookie('userSave', token, cookieOptions);
                console.log("Reach 2")
                res.status(200).redirect("/profile");
            }
        })
    } catch (err) {
        console.log(err);
    }
}
exports.register = (req, res, err) => {
    console.log(req.body);
    const { username, email, password, passwordConfirm } = req.body;
    console.log( { username, email, password, passwordConfirm })
    console.log(__dirname)

const tempDir= __dirname.toString().substring(0, __dirname.toString().length - 11)
console.log(tempDir)
    db.query('SELECT username from students WHERE username = ?', [username], async (err, results) => {
        if (err) {
            console.log(err);
        } else {
            if (results.length > 0) {
                return res.sendFile(tempDir + "/public/studentregister.html", {
                    message: 'The username is already in use'
                }
            )}
 } })
    db.query('SELECT email from students WHERE email = ?', [email], async (err, results) => {
        if (err) {
            console.log(err);
        } else {
            if (results.length > 0) {
                return res.sendFile(path.join( tempDir, '/public/studentregister.html'), {
                    message: 'The email is already in use'
                })
            } else if (password != passwordConfirm) {
                return res.sendFile(path.join(tempDir , '/public/studentregister.html'), {
                    message: 'Password dont match'
                });
            }
        }

        let hashedPassword = await bcrypt.hash(password, 8);
        console.log(hashedPassword);

        db.query('INSERT INTO students SET ?', { username: username, email: email, password: hashedPassword }, (err, results) => {
            if (err) {
                console.log(err);
            } else {
                return res.sendFile(path.join(tempDir , '/public/studentregister.html'), {
                    message: 'User registered'
                });
            }
        })
    })
    // if(err){
    //     throw err;
    // }
    
}

exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies.userSave) {
        try {
            const secret = 'mysecretKey'
            // 1. Verify the token
            const decoded = await promisify(jwt.verify)(req.cookies.userSave,
                secret
            );
            console.log(decoded);

            // 2. Check if the user still exist
            db.query('SELECT * FROM students WHERE student_id = ?', [decoded.id], (err, results) => {
                console.log(results);
                if (!results) {
                    return next();
                }
                req.user = results[0];
                console.log("Request: ")
                console.log(req.user)
                return next();
            });
        } catch (err) {
            console.log(err)
            return next();
        }
    } else {
        next();
    }
}
exports.logout = (req, res) => {
    res.cookie('userSave', 'logout', {
        expires: new Date(Date.now() + 2 * 1000),
        httpOnly: true
    });
    res.status(200).redirect("/");
}