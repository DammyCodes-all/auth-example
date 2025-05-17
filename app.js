import dotenv from 'dotenv'
dotenv.config()
import express from 'express';
import morgan from 'morgan'
import pg from 'pg'
import bcrypt from 'bcrypt'
import session from 'express-session'
import passport from 'passport'
import LocalStrategy from 'passport-local'

const app = express()
const port = process.env.PORT || 3000
const saltRounds = 10
let IsRegistered;





const db = new pg.Client({
    user : process.env.DB_USER,
    host : process.env.DB_HOST,
    port : process.env.DB_PORT,
    password : process.env.DB_PASSWORD,
    database : process.env.DB_NAME,
})
db.connect()

app.use(morgan('dev'))
app.use(express.urlencoded({extended : true}))
app.use(express.static('public'))
app.use(session({
    secret : process.env.SESSION_SECRET,
    resave : false,
    saveUninitialized : false
}))
app.use(passport.initialize())
app.use(passport.session())



passport.serializeUser((user, done) => {
    if (!user || user.id === undefined) {
        return done(new Error('Missing user ID for serialization'));
    }
    done(null, user.id);
})

passport.deserializeUser(async (id, done) => {
    try {
        const response = await db.query('SELECT * FROM users WHERE id = $1', [id])
        if (response.rows.length === 0) {
            return done(new Error('User not found'))
        }
        const user = response.rows[0]
        done(null, user)
    } catch (error) {
        done(error)
    }
})
passport.use(new LocalStrategy( async (username, password, done) => {
    try {
        const res = await db.query('SELECT * FROM users WHERE email = $1', [username]);
        if (res.rows.length === 0) return done(null, false, { message: 'User not found' });

        const user = res.rows[0];
        const match = await bcrypt.compare(password, user.passwords);
        if (!match) return done(null, false, { message: 'Incorrect password' });

        return done(null, user);
  } catch (err) {
        return done(err);
  }
}));

async function hashPassword(password) {
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        return hashedPassword;
    } catch (error) {
        console.error(error);
        throw new Error(`Error hashing password: ${error.message}`);
    }
}


const createUser = async(req, res, next) => { 
    try {
        if(!req.body.username && !req.body.password){ 
            return res.redirect('/register'); 
        }
        
        const doesUserExist = await checkUser(req.body.username);
        if(!doesUserExist){
            const hashedPassword = await hashPassword(req.body.password);
            const result = await db.query(
                'INSERT INTO users (email, passwords) VALUES ($1, $2) RETURNING *', 
                [req.body.username, hashedPassword]
            );
            
            const newUser = result.rows[0];
            
            req.logIn(newUser, (err) => {
                if (err) return next(err);
                return res.redirect('/secrets');
            });
        } else {
            return res.status(409).send('User already exists. Try logging in.');
        }
    } catch (error) {
        console.log(error);
        return res.redirect('/register');
    }
}
async function checkUser(email) {
    const response = await db.query('SELECT * FROM users WHERE email = $1' ,[email]) 
    return response.rows.length > 0
}

app.get('/' , (req , res)=>{
    res.render('home.ejs')
})
app.get('/login' , (req , res)=>{
    res.render('login.ejs')
})
app.get('/secrets' , (req, res)=>{
    if(!req.isAuthenticated()){
        return res.redirect('/login')
    }else{
        return res.render('secrets.ejs')
    }
})
app.get('/register' , (req , res)=>{
    res.render('register.ejs')
})
app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            console.error('Logout error:', err);
            return res.status(500).send('Error logging out');
        }
        res.redirect('/');
    });
})
app.post('/register' , createUser)
app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) {
            return next(err); 
        }
        if (!user) {
            return res.status(401).render('login.ejs', { 
                error: info.message || 'Authentication failed' 
            });
        }
        req.logIn(user, (err) => {
            if (err) return next(err);
            return res.redirect('/secrets');
        });
    })(req, res, next);
});

app.listen(port, () => {
    console.log(`App Running on http://localhost:${port}`)
})
