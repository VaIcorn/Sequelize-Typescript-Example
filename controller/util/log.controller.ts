import * as log4js from 'log4js';
import * as path from 'path';

enum Severity {
    info,
    warn,
    error,
    debug
}

export class LogController {
    private static log: log4js.Logger;

    /**
     * Logs an Info-Message to Console
     * Disabled in Productionmode
     * @param message The Message that is always displayed
     * @param additionalObjects  Additional Objects for Debugging - not displayed in Productionmode
     */
    public static info(message: string, ...additionalObjects: any[]): void {
        this.logToConsole(Severity.info, message, additionalObjects);
    }
    /**
     * Logs an Warning to Console
     * @param message The Message that is always displayed
     * @param additionalObjects  Additional Objects for Debugging - not displayed in Productionmode
     */
    public static warn(message: string, ...additionalObjects: any[]): void {
        this.logToConsole(Severity.warn, `Warn: ${message}`, additionalObjects);
    }
    /**
     * Logs an Error to Console
     * @param message The Message that is always displayed
     * @param additionalObjects  Additional Objects for Debugging - not displayed in Productionmode
     */
    public static error(message: string, ...additionalObjects: any[]): void {
        this.logToConsole(Severity.error, message, additionalObjects);
    }
    /**
     * Logs an Debug-Message to Console
     * Disabled in Productionmode
     * @param message The Message that is always displayed
     * @param additionalObjects  Additional Objects for Debugging - not displayed in Productionmode
     */
    public static debug(message: string, ...additionalObjects: any[]): void {
        this.logToConsole(Severity.debug, message, additionalObjects);
    }

    private static logToConsole(severity: Severity, message: string, additionalObjects: any[]): void {
        const isProduction = process.env.NODE_ENV === 'production';

        if (isProduction && !this.log) {
            // initialize Logger
            log4js.configure(path.join(__dirname, '/../../config/log4js.json'));
            this.log = log4js.getLogger('app');
        }

        // if started locally log to the console, otherwise use log4js
        const logger = isProduction ? this.log : console;

        additionalObjects = additionalObjects.length === 0 ? null : additionalObjects

        switch (severity) {
            case Severity.info:
                logger.info(message, additionalObjects || '');
                break;
            case Severity.warn:
                logger.warn(message, additionalObjects || '');
                break;
            case Severity.error:
                logger.error(message, additionalObjects || '');
                break;
            case Severity.debug:
                logger.debug(message, additionalObjects || '');
                break;
        }
    }
}
