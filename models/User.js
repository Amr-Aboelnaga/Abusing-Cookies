const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const UserSchema = new mongoose.Schema({

    username: {
        type: String,
        default: ''
    },
    email: {
        type: String,
        default: ''
    },
    password: {
        type: String,
        default: ''
    },
    token:{
        type: Number,
        default: 0
    },
    isDeleted:{
        type:Boolean,
        default:false
    }
});
module.exports.doHash=function () {

  callback("asdasdasd");
};
module.exports.genHash = function(password){
    this.password= bcrypt.hashSync(password,bcrypt.genSaltSync(8,null),null);
};
module.exports.validPassword = function(password){
    return bcrypt.compareSync(password,this.password);
};


module.exports.save= function(User){
  User=this;
  callback(User);
};
module.exports = mongoose.model('User', UserSchema);
