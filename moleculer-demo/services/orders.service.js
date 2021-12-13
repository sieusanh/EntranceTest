"use strict";

const DbMixin = require("../mixins/db.mixin");


/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

module.exports = {
	name: "orders",
	// version: 1

	mixins: [DbMixin("orders")],

	settings: {
		// Available fields in the responses
		fields: [
			"_id",
            "cart",
            "amount"
		],

		// Validator for the `create` & `insert` actions.
		entityValidator: {
            cart: "array",
            amount: "number|positive"
		}
	},

	hooks: {
		before: {
			/**
			 * Register a before hook for the `create` action.
			 * It sets a default value for the quantity field.
			 *
			 * @param {Context} ctx
			 */
			create(ctx) {
				ctx.params.quantity = 0;
			}
		}
	},

	dependencies: [],

	actions: {
        placeOrder: {
            rest: "POST /placeOne",
			query: {
				//cart: "string",
				p: "number|integer|positive",
				q: "number|integer|positive"
			},
			/** @param {Context} ctx  */
			async handler(ctx) {
				
				const isEmptyStock = await ctx.call("products.isEmptyStock", {id: ctx.query.p});
				if (isEmptyStock) 
					return {message: 'This product is out of stock'};
				const doc = await this.adapter.insert({ 
					cart: ['abc'],
					amount: 370
				});
				return doc;
			}
        },

		listOrder: {
			rest: "/list",
			query: {
				amount_gte: "number|integer|positive",
				amount_lte: "number|integer|positive",
				limit: "number|integer|positive"
				// day, date, month, year
			},
			/** @param {Context} ctx  */
			async handler(ctx) {				
				const qAmount_gte = ctx.query.amount_gte || 0;
				const qAmount_lte = ctx.query.amount_lte || 0;
				const qLimit = ctx.query.limit || 0;
				let docs;

				if (qAmount_gte)
					docs = await this.adapter.find({amount: {$gte: qAmount_gte} }).limit(qLimit);
				else if (qAmount_lte)
					docs = await this.adapter.find({amount: {$lte: qAmount_lte} }).limit(qLimit);
				else 
					docs = await this.adapter.find().limit(qLimit);
				return docs;
			}
		}
	},
	
	methods: {
	},

	async afterConnected() {
		// await this.adapter.collection.createIndex({ name: 1 });
	}
};
