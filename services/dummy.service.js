"use strict";

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

const memstorage = [];

module.exports = {
	name: "dummy",
	/**
	 * Settings
	 */

	/**
	 * Dependencies
	 */
	dependencies: [],

	/**
	 * Actions
	 */
	actions: {
		/**
		 * @returns identity
		 */
		bufferPost: {
			rest: {
				method: "POST",
				path: "/buffer"
			},
      visibility:'published',
			async handler(ctx) {
          memstorage.push(ctx.params);
          return memstorage;
			}
		},
    bufferGet: {
			rest: {
				method: "GET",
				path: "/buffer"
			},
      visibility:'published',
			async handler(ctx) {
          return memstorage;
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
