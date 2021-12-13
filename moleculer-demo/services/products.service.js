"use strict";

const DbMixin = require("../mixins/db.mixin");


/**
 * @typedef {import('moleculer').Context} Context Moleculer's Context
 */

module.exports = {
	name: "products",
	// version: 1

	/**
	 * Mixins
	 */
	mixins: [DbMixin("products")],

	/**
	 * Settings
	 */
	settings: {
		// Available fields in the responses
		fields: [
			"_id",
			"name",
			"price",
			"stock"
		],

		// Validator for the `create` & `insert` actions.
		entityValidator: {
			name: "string|min:3",
			price: "number|positive",
			stock: "number|positive"
		}
	},

	/**
	 * Action Hooks
	 */
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

	actions: {
		hello: {
			rest: "/hello",
			handler(){
				return 'Hello Sanh!'
			}
		},
		listProduct: {
			rest: {
				method: "GET",
				path: "/list"
			},
			query: {
				new: "string",
				stock_gte: "number|integer|positive",
				stock_lte: "number|integer|positive",
				limit: "number|integer|positive"
			},
			/** @param {Context} ctx  */
			async handler(ctx) {
				
				const qNew = ctx.query.new || '';
				const qStock_gte = ctx.query.stock_gte || 0;
				const qStock_lte = ctx.query.stock_lte || 0;
				const qLimit = ctx.query.limit || 0;
				let docs = [];
				let sort_flag = 1;

				qNew === 'true' && (sort_flag = -1);

				if (qStock_gte) 
					docs = await this.adapter.find({stock: {$gte: qStock_gte} })
											.sort({createdAt: sort_flag}).limit(qLimit) // limit 0 = infinity
				else if (qStock_lte)
					docs = await this.adapter.find({stock: {$lte: qStock_lte} })
											.sort({createdAt: sort_flag}).limit(qLimit)	
				else
					docs = await this.adapter.find()
											.sort({createdAt: sort_flag}).limit(qLimit)

				// const json = await this.transformDocuments(ctx, ctx.params, docs);
				// await this.entityChanged(null, json, ctx);
				return docs;
			}
		},

		async isEmptyStock(id) {
			const doc = await this.adapter.findOne({_id: id});
			if (doc.stock === 0)
				return true;
			return false;
		}
	},

	methods: {
		async seedDB() {
			for (let i = 1; i <= 200; i++) {
				await this.adapter.insert({ 
					name: `Product ${i}`, 
					price: Math.round( Math.random()*100 ) + 1, 
					stock: 0
				});
			}
			for (let i = 201; i <= 200000; i++) {
				await this.adapter.insert({ 
					name: `Product ${i}`, 
					price: Math.round( Math.random()*100 ), 
					stock: Math.round( Math.random()*1000 )
				});
			}
		}
	},

	async afterConnected() {
		// await this.adapter.collection.createIndex({ name: 1 });
	}
};
