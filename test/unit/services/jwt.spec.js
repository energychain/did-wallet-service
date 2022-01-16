"use strict";

const { ServiceBroker } = require("moleculer");
const { ValidationError } = require("moleculer").Errors;
const TestService = require("../../../services/jwt.service");

describe("Test 'jwt' service", () => {
	let broker = new ServiceBroker({ logger: false });
	broker.createService(TestService);

	beforeAll(() => broker.start());
	afterAll(() => broker.stop());

	describe("Test 'jwt.ping' action", () => {

		it("should return with 'Pong JWT'", async () => {
			const res = await broker.call("jwt.ping");
			expect(res).toBe("Pong JWT");
		});

	});

});
