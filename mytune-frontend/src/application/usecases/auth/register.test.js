import { register } from "./register";

describe("register usecase", () => {
    test("ok true when backend returns message", async () => {
        const authGateway = { register: jest.fn().mockResolvedValue({ message: "User registered successfully" }) };
        const run = register({ authGateway });

        const result = await run({ username: "u", email: "e", password: "p", password2: "p" });

        expect(authGateway.register).toHaveBeenCalled();
        expect(result.ok).toBe(true);
    });

    test("ok false when backend returns errors", async () => {
        const authGateway = { register: jest.fn().mockResolvedValue({ email: ["already used"] }) };
        const run = register({ authGateway });

        const result = await run({ username: "u" });

        expect(result.ok).toBe(false);
        expect(result.data).toEqual({ email: ["already used"] });
    });
});
