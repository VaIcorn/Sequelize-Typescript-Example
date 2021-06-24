import "reflect-metadata";

const singeltons = Symbol("singeltons");

export function Singelton() {
    return function _Singelton<T extends { new(...args: any[]): {} }>(constr: T) {
        // Extends the original Class
        return class extends constr {
            constructor(...args: any[]) {
                // check if there already is a instance
                const instance: T = Reflect.getOwnMetadata(singeltons, constr, constr.name);
                if (instance) {
                    // return the existing instance
                    return instance;
                } else {
                    // create a new instance
                    super(...args);
                    const instance = this;
                    // save this instance
                    Reflect.defineMetadata(singeltons, instance, constr, constr.name);
                    return instance;

                }
            }
        }
    }
}