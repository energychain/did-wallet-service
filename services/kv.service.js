"use strict";

const Cloudwallet = require("cloudwallet");
/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */
const masterKey = '0x4d3e20bde4455758814c77e6eb0231a58c548f8d653d011b7b9303696acaf240';
const memstorage = {};
let masterwallet = null;

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
				if((typeof ctx.params.privateKey == 'undefined')||(ctx.params.privateKey == null)) {
					ctx.params.privateKey = masterKey;
				}
				if(typeof memstorage[ctx.params.privateKey] == 'undefined') {
					 memstorage[ctx.params.privateKey] = {};
				}
				if(typeof memstorage[ctx.params.privateKey][ctx.params.key] == 'undefined') {
					if(masterwallet !== null) {
						let wallet = new Cloudwallet(process.env.rapidapi,ctx.params.privateKey);
					 	let cloudvalue = await wallet.get(ctx.params.key);
						if(typeof cloudvalue !== 'undefined') {
							memstorage[ctx.params.privateKey][ctx.params.key] = JSON.parse(cloudvalue);
						}
					}
				}
        return memstorage[ctx.params.privateKey][ctx.params.key];
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
					 if((typeof ctx.params.privateKey == 'undefined')||(ctx.params.privateKey == null)) {
							ctx.params.privateKey = masterKey;
					 }
					 if(typeof memstorage[ctx.params.privateKey] == 'undefined') {
							 memstorage[ctx.params.privateKey] = {};
					 }

           memstorage[ctx.params.privateKey][ctx.params.key] = ctx.params.value;
					try {
						if(masterwallet !== null) {
								let wallet = new Cloudwallet(process.env.rapidapi,ctx.params.privateKey);
							 	await wallet.set(ctx.params.key,JSON.stringify(ctx.params.value));
								await wallet.set('_update',new Date().getTime());
						}
					} catch(e) {
						console.log("Error in CW",e);
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
		memstorage[masterKey] =  {};
		if(typeof process.env.rapidapi !== 'undefined') {
			try {
				masterwallet = new Cloudwallet(process.env.rapidapi,masterKey);
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
