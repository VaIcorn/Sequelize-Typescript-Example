import { BehaviorSubject, Observable } from "rxjs";
import { Dialect, Sequelize } from "sequelize";
import { Singelton } from '../annotations/singelton';
import { LogController } from "./util/log.controller";
import { parseDialect, parseNumber } from "./util/utility";
import * as mysql from 'mysql2/promise';
import { CreateDataBaseException } from '../exception/CreateDataBaseException';
import { DataBaseConnectionException } from "../exception/DataBaseConnectionException";

@Singelton()
class DataBaseController {
    private sequelize: Sequelize;
    private hasConnection = new BehaviorSubject<boolean>(false);
    private isConntecting = false;

    async connectToDatabase(): Promise<Sequelize> {
        if (this.isConntecting) {
            return;
        }
        this.isConntecting = true;

        const databaseName = process.env['DATABASE_NAME'] || 'example'
        const databaseHost = process.env['DATABASE_HOST'] || 'localhost'
        const databaseUserName = process.env['DATABASE_USER_NAME'] || 'root'
        const databasePassword = process.env['DATABASE_PASSWORD'] || 'master'
        const databaseDialect = parseDialect(process.env['DATABASE_DIALECT']);
        const databasePort = parseNumber(process.env['DATABASE_PORT'], 3307)

        try {
            await this.createDatabaseIfNotPresent(databaseHost, databasePort, databaseUserName, databasePassword, databaseName)
        } catch (error) {
            LogController.error(`Cannot create Database! Host: ${databaseHost}, Port: ${databasePort}, User: ${databaseUserName}, DB-Name: ${databaseName}`, error);
            throw new CreateDataBaseException(`Cannot create Database ${databaseName}!`);
        }

        try {
            const sequelize = new Sequelize({
                database: databaseName,
                host: databaseHost,
                username: databaseUserName,
                password: databasePassword,
                dialect: 'mariadb',
                port: databasePort,
                logging: false
            })

            await sequelize.authenticate();
            LogController.info('Successful conntected to Database!')

            this.sequelize = sequelize;
            this.hasConnection.next(true);
            return this.sequelize;
        } catch (error) {
            LogController.error(`Cannot connect to Database! Host: ${databaseHost}, Port: ${databasePort}, User: ${databaseUserName}, DB-Name: ${databaseName}`, error);
            throw new DataBaseConnectionException(`Cannot connect to Database ${databaseName}!`);
        }
    }

    public closeConnection(): void {
        this.sequelize.close();
        this.sequelize = null;
        this.hasConnection.next(false);
    }

    public isConnected(): Observable<boolean> {
        return this.hasConnection.asObservable()
    }

    public getConnectionValue(): boolean {
        return this.hasConnection.value;
    }

    public getConnection(): Sequelize {
        return this.sequelize;
    }

    private async createDatabaseIfNotPresent(host: string, port: number, user: string, password: string, databaseName: string) {
        const connection = await mysql.createConnection({ host, port, user, password })
        await connection.query((`CREATE DATABASE IF NOT EXISTS ${databaseName};`));
        await connection.end();
    }
}

export { DataBaseController };