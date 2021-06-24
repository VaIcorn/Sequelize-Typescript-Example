import cookieParser from 'cookie-parser';
import express, { NextFunction, Request, Response } from 'express';
import http, { Server } from 'http';
import createError, { HttpError } from 'http-errors';
import lessMiddleware from 'less-middleware';
import * as path from 'path';
import { DataBaseController } from './controller/database.controller';
import { LogController } from './controller/util/log.controller';
import { Router } from './routes/router';
import { normalizePort } from './controller/util/utility'

// create app
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(lessMiddleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// Init Router
const router = new Router();
const expressRouter = router.getExpressRouter();
app.use('/', expressRouter);

// catch 404 and forward to error handler
app.use(function (req: Request, res: Response, next: NextFunction) {
  next(createError(404));
});

// // error handler
app.use(function (err: HttpError, req: Request, res: Response, next: NextFunction) {
  if (err.status === 404) {
    res.render('404');
    return;
  }
  
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

/**
 * Event listener for HTTP server "error" event.
 */

 function onError(error: HttpError) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const port = normalizePort(process.env.PORT || '3000');
  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */
function onListening(server: Server) {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  LogController.info('Listening on ' + bind);
}

const dataBaseController = new DataBaseController()
dataBaseController.connectToDatabase().catch(() => {
  subscription.unsubscribe();
  process.exit(1)
})
const subscription = dataBaseController.isConnected().subscribe((isConnected) => {
  if (isConnected) {
    subscription.unsubscribe();
    /**
     * Create HTTP server.
     */

    const server = http.createServer(app);
    const port = normalizePort(process.env.PORT || '3000');
    // app.set('port', port);

    server.listen(port);
    server.on('error', onError);
    server.on('listening', () => onListening(server));
  }
})

export default app;