const isempty=(string)=>{
    if(string.trim===""){return true}
    else{return false}
}
const isemail=(email)=>{
    const regex='something'
    if(email.match(regex)){return true}
    else{return false}
}

exports.validatesignup=(data)=>{
    
    let error={};
    if(isempty(data.email)){error.email= "must not be empty"}
    else if(!isemail(data.email)){error.email= "wrong email entered"}
    else{return true}

    if(isempty(data.password)){error.password= "password must not be empty"}
    else{return true}

    if(isempty(data.confirmpassword)){error.confirmpassword= "confirmpassword must not be empty"}
    else if(data.password !== data.confirmpassword){error.confirmpassword= "password does not match"}
    else{return true}

    if(isempty(data.handle)){error.handle= "handle must not be empty"}
    else{return true}
 
    

    return {
        error,
        valid:Object.keys(error).length ===0 ? true:false
    }
}

exports.validatelogin=(data)=>{
    let error={};
    if(isempty(data.email)){error.email= "must not be empty"}
    if(isempty(data.password)){error.password= "password must not be empty"}
    
    return {
        error,
        valid:Object.keys(error).length ===0 ? true:false
    }
}
exports.reduceuser=(data)=>{
    const userdetails={}
    if(isempty(data.bio.trim()))userdetails.bio=data.bio
    if(isempty(data.website.trim())){
        if(data.website.trim().substring(0,4)=="http"){
            return userdetails.website=`https://${data.website.trim()}`
        }
    }
    else{userdetails.website=data.website}
    if(isempty(data.location.trim()))userdetails.location=data.location
}