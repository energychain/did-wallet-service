"use strict";

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

const memstorage = {};
let cloudwallet = null;
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
				if(typeof memstorage[ctx.params.key] == 'undefined') {
					if(cloudwallet !== null) {
					 	let cloudvalue = await cloudwallet.get(ctx.params.key);
						if(typeof cloudvalue !== 'undefined') {
							memstorage[ctx.params.key] = cloudvalue;
						}
					}
				}
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
					try {
						if(cloudwallet !== null) {
								await cloudwallet.set(ctx.params.key,ctx.params.value);
						}
					} catch(e) {

					}
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
		if(typeof process.env.rapidapi !== 'undefined') {
			try {
				const Cloudwallet = require("cloudwallet");
				const privateKey = '0x4d3e20bde4455758814c77e6eb0231a58c548f8d653d011b7b9303696acaf240';
				cloudwallet = new Cloudwallet(process.env.rapidapi,privateKey);
			} catch(e) {
				console.log(e);

			}
		}
	},

	/**
	 * Service stopped lifecycle event handler
	 */
	async stopped() {

	}
};
