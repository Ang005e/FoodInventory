
class UserError extends Error {

    constructor(message: string) {
        super(message);
        this.name = new.target.name;
        Object.setPrototypeOf(this, new.target.prototype) // restore Error prototype chain (best practice)
    }
}

class InputInvalidError extends UserError {
    public inputType: string;

    constructor(message: string, inputType: string) {
        super(message);
        this.inputType = inputType;
        Object.setPrototypeOf(this, new.target.prototype)
    }
}

class DateInvalidError extends InputInvalidError {

    constructor(message: string) {
        super(message, "date")
        Object.setPrototypeOf(this, new.target.prototype)
    }
}