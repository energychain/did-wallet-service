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
				console.log("maskedidentity.get():",ctx.params.identity);
        let maskedidentity = await ctx.call("kv.get",{key:ctx.params.identity});
        if((typeof maskedidentity == 'undefined') || (maskedidentity == null)) {
					console.log("Creation");
          let identity = new Identity();
          let values = identity.getIdentity();
          await ctx.call("kv.set",{key:ctx.params.identity,value:values});
					await ctx.call("kv.set",{key:values.address,value:{resolve:ctx.params.identity}});
					await ctx.call("kv.set",{key:values.identifier,value:{resolve:ctx.params.identity}});
          return values;
        } else {
					if(typeof maskedidentity.resolve !== 'undefined') {
						console.log("Resolving");
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
		retrievePresentation: {
			rest: {
				method: "GET",
				path: "/retrievePresentation"
			},
			visibility:'protected',
			params: {
				identity:"string"
			},
			async handler(ctx) {
				let maskedidentity = await ctx.call("maskedidentity.get",{identity:ctx.params.resolver});
				let pds = await ctx.call("kv.get",{privateKey:maskedidentity.privateKey,key:"pds"});
				if((typeof pds == 'undefined') || (pds == null)) pds = {};
				if(typeof pds[ctx.params.schema] !== 'undefined') {
							let profile = await ctx.call("kv.get",{privateKey:maskedidentity.privateKey,key:pds[ctx.params.schema].id});
							let schemas = await ctx.call("kv.get",{privateKey:maskedidentity.privateKey,key:'schemas'});
							let schema = schemas[pds[ctx.params.schema].input_descriptors[0].id];

							console.log('schema',schema);
							const Ajv = require("ajv");
							const addFormats = require("ajv-formats");
							const ajv = new Ajv({allErrors: true,strict: false, allowUnionTypes: true,removeAdditional: true});
							const validate = ajv.compile(schema);
							validate(profile);
							// Soft Validation on rool level (see limit in AJV)
							let nprofile = {};
							for (const [key, value] of Object.entries(schema.properties)) {
							  nprofile[key] = profile[key];
							}
							return nprofile;
				} else {
					return {err:'Not allowed - VC does not exists'};
				}
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
		listPDs: {
			rest: {
				method: "GET",
				path: "/listPDs"
			},
			visibility:'protected',
			params: {
				identity:"string"
			},
			async handler(ctx) {
				let maskedidentity = await ctx.call("maskedidentity.get",{identity:ctx.params.identity});
				let schemas = await ctx.call("kv.get",{privateKey:maskedidentity.privateKey,key:'pds'});
				return schemas;
			}
		},
		addPD: {
			rest: {
				method: "GET",
				path: "/addPD"
			},
			visibility:'published',
			params: {
				identity:"string"
			},
			async handler(ctx) {
				let hash = ethers.utils.id(ctx.params.identity + '_'+new Date().getTime());
				console.log('Adding PD',hash);
				console.log('For ID',ctx.params.identity);
				console.log('Of Id',ctx.params.from);
				ctx.params.pd.id = ctx.params.from;
				let maskedidentity = await ctx.call("maskedidentity.get",{identity:ctx.params.identity});
				let pds = await ctx.call("kv.get",{privateKey:maskedidentity.privateKey,key:'pds'});
				if((typeof pds == 'undefined') || (pds == null)) pds = {};
				pds[hash] = ctx.params.pd;
				await ctx.call("kv.set",{privateKey:maskedidentity.privateKey,key:'pds',value:pds});
				return {
					vp: {
						schema:hash,
						identity:ctx.params.identity,
						audience:ctx.params.pd.input_descriptors.purpose
				}
			}
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

				let hash = ethers.utils.id(ctx.params.from + "_" + ctx.params.identity + "_" + new Date().getTime());
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
							if((typeof webhooks !== 'undefined') && (webhooks !== null) && (typeof webhooks[ctx.params.schema] !== 'undefined')) {
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
							// work with From - and add values to profile
							let storage = await ctx.call("kv.get",{privateKey:maskedidentity.privateKey,key:ctx.params.from});
							if((typeof storage == 'undefined') || (storage == null)) storage = {};
							for (const [key, value] of Object.entries(ctx.params.presentation.payload)) {
							  storage[key] = value;
							}
							console.log('Profile Storage',storage);
							await ctx.call("kv.set",{privateKey:maskedidentity.privateKey,key:ctx.params.from,value:storage});
						  presentation.profiled = true;
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
