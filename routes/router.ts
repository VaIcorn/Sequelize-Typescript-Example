import express, { NextFunction, Request, Response } from 'express';
import { Deserialize, Param } from '../annotations/deserialize';
import { Singelton } from '../annotations/singelton';
import { UserDTO } from '../model/user';

@Singelton()
class Router {

    private expressRouter: express.Router

    constructor() {
        this.expressRouter = express.Router();

        // Routes
        this.expressRouter.get('/', this.getLandingPage);
        this.expressRouter.get('/test', this.getLandingPage);
        this.expressRouter.post('/user', (req: Request, res: Response) => this.postUpdateUser(req, res));
    }

    public getExpressRouter(): express.Router {
        return this.expressRouter;
    }

    public getLandingPage(req: Request, res: Response, next: NextFunction) {
        console.log('index')
        res.render('index', { title: 'Express' });
    }

    @Deserialize
    private postUpdateUser(req: Request, res: Response, @Param('user') user?: UserDTO) {
        console.log(`${user.getFirstName()} ${user.getLastName()}`)
        res.render('index', { title: 'Express' });
    }
}

export { Router };
