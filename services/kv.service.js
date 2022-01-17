"use strict";

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

const memstorage = {};

module.exports = {
	name: "kv",
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
		get: {
			rest: {
				method: "GET",
				path: "/get"
			},
      visibility:'published',
			params: {
			     key:"string"
			},
			async handler(ctx) {
          return memstorage[ctx.params.key];
			}
		},
    set: {
      rest: {
        method: "GET",
        path: "/set"
      },
      visibility:'protected',
      params: {
           key:"string"
      },
      async handler(ctx) {
          memstorage[ctx.params.key] = ctx.params.value;
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
