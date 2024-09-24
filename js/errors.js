"use strict";
class UserError extends Error {
    constructor(message) {
        super(message);
        this.name = new.target.name;
        Object.setPrototypeOf(this, new.target.prototype); // restore Error prototype chain (best practice)
    }
}
class InputInvalidError extends UserError {
    constructor(message, inputType) {
        super(message);
        this.inputType = inputType;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
class DateInvalidError extends InputInvalidError {
    constructor(message) {
        super(message, "date");
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
