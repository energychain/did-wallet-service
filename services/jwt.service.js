"use strict";


/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

module.exports = {
	name: "jwt",

	/**
	 * Settings
	 */
	settings: {
		resolver:{
			rpcUrl:"https://integration.corrently.io/",
			name: "mainnet",
			chainId: "6226",
			registry:"0xda77BEeb5002e10be2F5B63E81Ce8cA8286D4335"
		}
	},

	/**
	 * Dependencies
	 */
	dependencies: [],

	/**
	 * Actions
	 */
	actions: {
		/**
		 * Input DID-JWT
		 * @params: did:"string"
		 * @returns JWT DID
		 */
		input: {
			rest: {
				method: "POST",
				path: "/input"
			},
			params: {
				did:"string"
			},
			async handler(ctx) {
				const JWTResolver = require("../lib/JWTResolver.js");
				const resolver = new JWTResolver(this.settings.resolver);
				let result = resolver.toDid(ctx.params.did);
				return result;
			}
		},
		/**
		 * Say a 'Hello' action.
		 *
		 * @returns
		 */
		ping: {
			rest: {
				method: "GET",
				path: "/ping"
			},
			async handler() {
				return "Pong JWT";
			}
		}
	},

	/**
	 * Events
	 */
	events: {

	},

	/**
	 * Methods
	 */
	methods: {

	},

	/**
	 * Service created lifecycle event handler
	 */
	created() {

	},

	/**
	 * Service started lifecycle event handler
	 */
	async started() {

	},

	/**
	 * Service stopped lifecycle event handler
	 */
	async stopped() {

	}
};
