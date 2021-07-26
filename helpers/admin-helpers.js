var db = require('../config/connection')
var collection = require('../config/collections')
const bcrypt = require('bcrypt')
var objectId = require('mongodb').ObjectID
const { response } = require('express')
const { resolve } = require('path')

module.exports = {
    getAllOrders:()=>{
        return new Promise(async (resolve, reject) => {
            let allOrders = await db.get().collection(collection.ORDER_COLLECTION)
                .find().toArray()
            resolve(allOrders)
        })
    },
    getAllUsers:()=>{
        return new Promise(async (resolve, reject) => {
            let allUsers = await db.get().collection(collection.USER_COLLECTION)
                .find().toArray()
            resolve(allUsers)
        })
    },
}