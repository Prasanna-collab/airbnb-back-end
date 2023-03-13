const mongoose = require('mongoose')

const db = async()=>{
    try {
        mongoose.connect(process.env.MONGO_URL)
        console.log("DB Connection Established Successfully")
    } catch (error) {
        console.log("Error", error)
    }
}

module.exports= db