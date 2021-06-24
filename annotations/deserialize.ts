import "reflect-metadata";

export function Deserialize(target: any, propertyName: string, descriptor: TypedPropertyDescriptor<Function>) {
    let method = descriptor.value!;
    descriptor.value = function () {

        let existingNamesIndex: { clazz: any, index: number, paramName: string }[] = Reflect.getOwnMetadata(paramSymbol, target, propertyName);
        const customArguments = [...arguments];
        if (existingNamesIndex) {
            for (let parameterIndex of existingNamesIndex) {
                const req = arguments[0];
                const constructedObject = new parameterIndex.clazz();
                
                if (req && req.body && req.body[parameterIndex.paramName]) {
                    const object = req.body[parameterIndex.paramName]
                    for (const key of Object.keys(object)) {
                        if (constructedObject['set' + toCamelCase(key)]) {
                        constructedObject['set' + toCamelCase(key)](object[key])
                        }
                    }
                }
                customArguments[parameterIndex.index] = constructedObject

            }
        }
        method.apply(this, [...customArguments])
    }
}

function toCamelCase(string: string) {
    return `${string[0].toUpperCase()}${string.substring(1, string.length)}`
}

const paramSymbol = Symbol("param");

export function Param(paramName: string) {

    function _Param(target: Object, propertyKey: string | symbol, parameterIndex: number) {
        const types = Reflect.getMetadata("design:paramtypes", target, propertyKey);
        console.log('parameterized', propertyKey, types[parameterIndex])
        const deserializationIndex: { clazz: any, index: number, paramName: string }[] = Reflect.getOwnMetadata(paramSymbol, target, propertyKey) || [];
        deserializationIndex.push({ clazz: types[parameterIndex], index: parameterIndex, paramName });
        Reflect.defineMetadata(paramSymbol, deserializationIndex, target, propertyKey);
    }


    return _Param;
}