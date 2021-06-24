/**
 * Add Utility Functions here
 */

import { Dialect } from "sequelize/types";

function normalizePort(val: string) {
    const port = parseInt(val, 10);

    if (isNaN(port)) {
        // named pipe
        return val;
    }

    if (port >= 0) {
        // port number
        return port;
    }

    return false;
}

function parseNumber(number: string, fallBack: number) {
    const parsedNumber = parseInt(number);

    if (isNaN(parsedNumber) || number === '' || number === undefined || number === null) {
        return fallBack ? fallBack : null;
    }

    return parsedNumber;
}

function parseDialect(string: string): Dialect {
    if (['mysql', 'postgres', 'sqlite', 'mariadb', 'mssql'].includes(string)) {
        return string as Dialect
    }

    return "mariadb";
}

export { normalizePort, parseNumber, parseDialect };