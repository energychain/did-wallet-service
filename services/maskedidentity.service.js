"use strict";

const DbService = require("moleculer-db");
const Identity = require("../lib/Identity.js");
const ethers = require("ethers");

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

module.exports = {
	name: "maskedidentity",
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
		 * Mask an identity (blockchainAccount) to a full (new) identity
		 * @returns identity
		 */
		get: {
			rest: {
				method: "GET",
				path: "/get"
			},
      visibility:'protected',
			params: {
				identity:"string"
			},
			async handler(ctx) {
        let maskedidentity = await ctx.call("kv.get",{key:ctx.params.identity});
        if((typeof maskedidentity == 'undefined') || (maskedidentity == null)) {
          let identity = new Identity();
          let keys = identity.getIdentity();
          keys.storage = {
            schemas:[],
						presentations:[]
          };
          await ctx.call("kv.set",{key:ctx.params.identity,value:keys});
					await ctx.call("kv.set",{key:"did:ethr:"+keys.publicKey,value:{resolve:ctx.params.identity}});
					await ctx.call("kv.set",{key:keys.publicKey,value:{resolve:ctx.params.identity}});
					await ctx.call("kv.set",{key:keys.address,value:{resolve:ctx.params.identity}});
          return keys;
        } else {
					if(typeof maskedidentity.resolve !== 'undefined') {
						return await ctx.call("maskedidentity.get",{identity:maskedidentity.resolve});
					} else {
				    return maskedidentity;
					}
        }
			}
		},
    addSchema: {
      rest: {
        method: "GET",
        path: "/addSchema"
      },
      visibility:'protected',
      params: {
        identity:"string"
      },
      async handler(ctx) {
				let hash = ethers.utils.id(ctx.params.schema["$id"]);

				let maskedidentity = await ctx.call("maskedidentity.get",{identity:ctx.params.identity});
				console.log('addPresentation',ctx.params.identity,maskedidentity);
        maskedidentity.storage.schemas[hash] = ctx.params.schema;
        await ctx.call("kv.set",{key:ctx.params.identity,value:maskedidentity});
        return hash
      }
    },
		addPresentation: {
			rest: {
				method: "GET",
				path: "/addPresentation"
			},
			visibility:'protected',
			params: {
				identity:"string"
			},
			async handler(ctx) {
				let hash = ethers.utils.id(new Date().getTime());
				let maskedidentity = await ctx.call("maskedidentity.get",{identity:ctx.params.identity});
				maskedidentity.storage.presentations[hash] = ctx.params.presentation;
				await ctx.call("kv.set",{key:ctx.params.identity,value:maskedidentity});
				return hash
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
