const {admin,db}=require('./admin')

module.exports=(req,res,next)=>{
    if(req.headers.authorization && req.headers.authorization.startsWith('bearer ')){
    let tokenid=req.headers.authorization.split('bearer ')[1]}
    else{
        return res.json({error:"unauthorized"})
    }

    admin.auth().verifyIdToken(tokenid)
    .then(decodedtoken=>{
        req.user=decodedtoken
        db.collection('users').where("userid","==",req.user.id)
        .limit(1).get()
    }).then(data=>{
        req.user.handle=data.docs[0].data().handle,
        req.user.imageurl=data.docs[0].data().imageurl
        return next()
    }).catch(err=>{res.json(err)})
}
