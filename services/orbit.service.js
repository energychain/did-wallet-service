"use strict";

/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

const IPFS = require('ipfs');
const OrbitDB = require('orbit-db');
let orbitdb = null;
let db = null;

module.exports = {
	name: "orbit",
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
		send: {
			rest: {
				method: "GET",
				path: "/send"
			},
      visibility:'published',
			params: {
			     did:"string"
			},
			async handler(ctx) {

			}
		},
    receive: {
      rest: {
        method: "GET",
        path: "/receive"
      },
      visibility:'protected',
      async handler(ctx) {

      }
    },
		address: {
			rest: {
        method: "GET",
        path: "/address"
      },
      visibility:'published',
      async handler(ctx) {
					if(db !== null) {
						return db.address
					} else {
						return null;
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
		try {
		const ipfs = await IPFS.create({
			    start: true,
			    preload: {
			      enabled: false
			    },
			    EXPERIMENTAL: {
			      pubsub: true,
			    },
			    config: {
			      Addresses: {
			        Swarm: [
								'/ip4/0.0.0.0/tcp/4002',
                '/dns4/secure-beyond-12878.herokuapp.com/tcp/443/wss/p2p-webrtc-star/',
                '/dns4/wrtc-star1.par.dwebops.pub/tcp/443/wss/p2p-webrtc-star/',
                '/dns4/wrtc-star2.sjc.dwebops.pub/tcp/443/wss/p2p-webrtc-star/'
			        ]
			      },
			    }
  	});
		orbitdb = await OrbitDB.createInstance(ipfs);
		db = await orbitdb.open('did-wallet-service', {
			 create: true,
			 overwrite: true,
			 localOnly: false,
			 type: 'eventlog',
			 accessController: {
				 write: ['*']
			 }
		 })
	 } catch(e) {

	 }
	},

	/**
	 * Service stopped lifecycle event handler
	 */
	async stopped() {

	}
};
