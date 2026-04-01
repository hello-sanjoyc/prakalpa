export class MemberError extends Error {
    constructor(message) {
        super(message);
        this.name = "MemberError";
    }
}
