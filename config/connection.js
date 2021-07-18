const mongoClient = require('mongodb').MongoClient

const mongodbOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true
  }
const state={
    db:null
}

module.exports.connect=function(done){
    const url = 'mongodb://localhost:27017'
    const dbname='shopping'

    mongoClient.connect(url,mongodbOptions,(err,data)=>{
        if(err)return done(err)
        state.db=data.db(dbname)
        done()
    })
    
}

module.exports.get=function(){
    return state.db
}