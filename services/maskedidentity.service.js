"use strict";

const Identity = require("did-wallet-web").Identity;
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
          let values = identity.getIdentity();
          await ctx.call("kv.set",{key:ctx.params.identity,value:values});
					await ctx.call("kv.set",{key:values.address,value:{resolve:ctx.params.identity}});
					await ctx.call("kv.set",{key:values.identifier,value:{resolve:ctx.params.identity}});
          return values;
        } else {
					if(typeof maskedidentity.resolve !== 'undefined') {
						return await ctx.call("maskedidentity.get",{identity:maskedidentity.resolve});
					} else {
				    return maskedidentity;
					}
        }
			}
		},
    addWebhook: {
      rest: {
        method: "GET",
        path: "/addWebhook"
      },
      visibility:'protected',
      params: {
        identity:"string",
				schema:"string",
				url:"string"
      },
      async handler(ctx) {
				let maskedidentity = await ctx.call("maskedidentity.get",{identity:ctx.params.identity});
				let storage = await ctx.call("kv.get",{privateKey:maskedidentity.privateKey,key:'webhooks'});
				if((typeof storage == 'undefined') || (storage == null)) storage = {};
				storage[ctx.params.schema] = ctx.params.url;
				await ctx.call("kv.set",{privateKey:maskedidentity.privateKey,key:'webhooks',value:storage});
        return ctx.params.schema + "@" + ctx.params.url;
      }
    },
		listWebhooks:{
			rest: {
				method: "GET",
				path: "/listWebhooks"
			},
			visibility:'protected',
			params: {
				identity:"string"
			},
			async handler(ctx) {
				let maskedidentity = await ctx.call("maskedidentity.get",{identity:ctx.params.identity});
				let schemas = await ctx.call("kv.get",{privateKey:maskedidentity.privateKey,key:'webhooks'});
				return schemas;
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
				let schemas = await ctx.call("kv.get",{privateKey:maskedidentity.privateKey,key:'schemas'});
				if((typeof schemas == 'undefined') || (schemas == null)) schemas = {};
				schemas[hash] = ctx.params.schema;
				await ctx.call("kv.set",{privateKey:maskedidentity.privateKey,key:'schemas',value:schemas});
				return hash
			}
		},
		listSchemas:{
			rest: {
				method: "GET",
				path: "/listSchemas"
			},
			visibility:'protected',
			params: {
				identity:"string"
			},
			async handler(ctx) {
				let maskedidentity = await ctx.call("maskedidentity.get",{identity:ctx.params.identity});
				let schemas = await ctx.call("kv.get",{privateKey:maskedidentity.privateKey,key:'schemas'});
				return schemas;
			}
		},
		addPresentation: {
			rest: {
				method: "GET",
				path: "/addPresentation"
			},
			visibility:'protected',
			params: {
				identity:"string",
				schema:"string"
			},
			async handler(ctx) {
				let hash = ethers.utils.id(new Date().getTime());
				let presentation = {
					hash: hash
				}

				let maskedidentity = await ctx.call("maskedidentity.get",{identity:ctx.params.identity});
				let storage = await ctx.call("kv.get",{privateKey:maskedidentity.privateKey,key:'presentations'});
				if((typeof storage == 'undefined') || (storage == null)) storage = {};
				storage[hash] = ctx.params.presentation;
				await ctx.call("kv.set",{privateKey:maskedidentity.privateKey,key:'presentations',value:storage});
				const schemas = await ctx.call("maskedidentity.listSchemas",{
					identity:ctx.params.identity
				})
				// Figure out if we have a schema definition for given schema - if validate
				if((typeof schemas !== 'undefined') && (typeof schemas[ctx.params.schema] !== 'undefined')) {
					const schema = schemas[ctx.params.schema];

					const Ajv = require("ajv");
					const addFormats = require("ajv-formats");
					const ajv = new Ajv({allErrors: true,strict: false, allowUnionTypes: true});
					addFormats(ajv);

					if(typeof schema["$id"] == 'undefined') {
						schema["$id"] = 'local/tmp/' + new Date().getTime() + '/' + Math.random();
					}
					const v =  await ajv.getSchema(schema["$id"])
									||  await ajv.compile(schema)
					const valid = v(ctx.params.presentation.payload);
					if(!valid) {
						presentation.error = 'Schema validation failed';
					} else {
							const webhooks = await ctx.call("maskedidentity.listWebhooks",{
								identity:ctx.params.identity
							})
							if(typeof webhooks[ctx.params.schema] !== 'undefined') {
								const url = webhooks[ctx.params.schema];
								const axios = require("axios");
								try {
									const result = await axios.post(url,{presentation:ctx.params.presentation});
									presentation.status = result.status;
								} catch(e) {
									presentation.status = -2;
									presentation.error = e.message;
								}
								// TODO: Work with Response from PPS
							} else {
								presentation.status = -1;
								presentation.error = 'No processor';
							}
					}
				}
				return presentation;
			}
		},
		listPresentations:{
			rest: {
				method: "GET",
				path: "/listPresentations"
			},
			visibility:'protected',
			params: {
				identity:"string"
			},
			async handler(ctx) {
				let maskedidentity = await ctx.call("maskedidentity.get",{identity:ctx.params.identity});
				let schemas = await ctx.call("kv.get",{privateKey:maskedidentity.privateKey,key:'presentations'});
				return schemas;
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
