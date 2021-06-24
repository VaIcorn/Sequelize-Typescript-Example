import "reflect-metadata";
import { Sequelize } from "sequelize/types";
import { DataBaseController } from "../controller/database.controller";
import { LogController } from "../controller/util/log.controller";

const uninitializedEntities = Symbol("uninitializedEntities");

export function Entity() {
    return function _Entity(constr: EntityType) {
        const databaseController = new DataBaseController();
        if (!databaseController.getConnectionValue()) {
            const entities: EntityType[] = Reflect.getOwnMetadata(uninitializedEntities, Entity, 'entities') || [];
            const isConnecting: boolean = Reflect.getOwnMetadata(uninitializedEntities, Entity, 'isConnecting') || false;
            LogController.info('Init Entity:', constr)
            entities.push(constr);
            Reflect.defineMetadata(uninitializedEntities, entities, Entity, 'entities');
            if (isConnecting) {
                return;
            } else {
                Reflect.defineMetadata(uninitializedEntities, true, Entity, 'isConnecting');
                databaseController.connectToDatabase().then(initEntities).catch(() => {
                    LogController.error('Cannot initialize Tables!');
                    process.exit(1)
                });
            }
        } else {
            LogController.info('Initialize Tables for:', constr)
            constr.initTable(databaseController.getConnection()).then(() => {
                LogController.info('Initialize Associations for:', constr)
                constr.initAssociations().then(() => {
                    LogController.info('Database Synchronization Done for Entity:', constr)
                    databaseController.getConnection().sync({ alter: true });
                });
            });
        }
    }
}

function initEntities() {
    const dataBaseController = new DataBaseController();

    const entities: EntityType[] = Reflect.getOwnMetadata(uninitializedEntities, Entity, 'entities') || [];
    // empty array - later we will check if there were entities added afterwards
    Reflect.defineMetadata(uninitializedEntities, [], Entity, 'entities');

    const initTablePromises = [];
    for (const entity of entities) {
        initTablePromises.push(entity.initTable(dataBaseController.getConnection()))
    }
    LogController.info('Initialize Tables for:', initTablePromises.length, 'Entities!')
    Promise.all(initTablePromises).then(() => {
        const initAssociationsPromises = [];
        for (const entity of entities) {
            initAssociationsPromises.push(entity.initAssociations());
        }
        LogController.info('Initialize Associations for:', initAssociationsPromises.length, 'Entities!')
        Promise.all(initAssociationsPromises).then(() => {
            LogController.info('Database Synchronization Done!')
            dataBaseController.getConnection().sync({ alter: true });

            // check if there were Entities added afterwards ...
            const entities: EntityType[] = Reflect.getOwnMetadata(uninitializedEntities, Entity, 'entities') || [];
            if (entities.length) {
                LogController.info('There are still unitialized Entities. Repeat.');
                initEntities();
            }
        })
    })
}

export type EntityType = {
    initTable: (sequelize: Sequelize) => Promise<any>,
    initAssociations: () => Promise<any>
}