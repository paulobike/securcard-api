const http = require('http'),
express    = require('express'),
env        = require('./env')(),
app        = express(),
authRoutes = require('./routers/auth'),
profileRoutes = require('./routers/profile'),
cardRoutes = require('./routers/card');

// app.use(function (req, res, next) {

//     res.setHeader('Access-Control-Allow-Origin', '*');

//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

//     res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type,Accept,X-Auth-token,X-Username');

//     res.setHeader('Access-Control-Allow-Credentials', true);
	
//     next();
// });
// app.use('/api', express.static("uploads"));
app.use(express.json());
app.use((req, res, next) => {
    console.log(req.url)
    res.on('finish', () => {
        console.log('\x1b[36m%s \x1b[33m\x1b[5m%s\x1b[0m \x1b[30m\x1b[47m%s\x1b[0m', 
        req.ip, req.method, req.url, res.headersSent? res.statusCode: '-');        
    });
    next();
}); 
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/cards', cardRoutes);
app.use((error, req, res, next) => {
    res.json({
        message: error.message,
        status: Math.floor(error.status / 100) === 3? 'redirect' :'error',
        status_code: error.status || 500
    });
})
app.use('*', (req, res) => {
    res.status(404).json({
        message: 'Resource not found',
        status: 'error',
        status_code: 404
    });
});

require('./database/tables')();

const PORT = process.env.PORT;
const IP = process.env.IP;
const server = http.createServer(app);

server.listen(PORT, () => {
    console.log(env);
    console.log(`App running on http://${IP}:${PORT}`);
});