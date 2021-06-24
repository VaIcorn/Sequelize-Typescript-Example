class DataBaseConnectionException extends Error {
    constructor(m: string) {
        super(m);
    }
}

export { DataBaseConnectionException };