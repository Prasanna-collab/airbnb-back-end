const bcrypt = require('bcryptjs')

const hashing = async(password)=>{
    try {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password,salt);
        console.log(hash)
        return hash
    } catch (error) {
        console.log(error)
    }
}

const hashCompare = async(password, hashValue)=>{
    try {
       const verify = await bcrypt.compare(password,hashValue)
       return verify
    } catch (error) {
        console.log(error)
    }
}

module.exports = {hashing, hashCompare}