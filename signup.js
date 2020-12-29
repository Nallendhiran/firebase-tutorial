const {db}=require('./admin')
const firebase=require('firebase')
const {validatesignup}=require('./validator')
const firebase=require('firebase')
firebase.initializeApp(config)


exports.signup=(req,res)=>{
    const newuser={
        email:req.body.email,
        password:req.body.password,
        confirmpassword:req.body.confirmpassword,
        handle:req.body.handle
    }

//this method is to create and store email in authentication place
  
    // firebase.auth().createUserWithEmailAndPassword (newuser.email,newuser.password)
    //.then(data=>{ 
      //  res.json({message:`${data.user.id} signedup successfully`})
  //  }).catch(err=>{console.error(err)})

    const{error,valid}=validatesignup(newuser)
    if(!valid){return res.json(error)}
    let token,userid;
    const imageurl='noimg.jpg'
    //for store in database collection we use this method
    db.collection('users').doc(`${newuser.handle}`).get() //this is getting value
    .then(doc=>{
        if(doc.exists){
            return res.json({message:"document already exists"})
        }
        else{return firebase.auth().createUserWithEmailAndPassword (newuser.email,newuser.password)}
    }).then(data=>{
        userid=data.user.id
        return data.user.getIdToken()
    }).then(tokens=>{
        token=tokens
        const usercredentials={
            email:newuser.email,
            handle:newuser.handle,
            createdat:new Date().toString(),
            imgurl:`http://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imageurl}?alt=media`,
            userid
        }
        return db.doc(`/users/${newuser.handle}`).set(usercredentials)
    }).catch(err=>{console.log(err)})
}

exports.login=(req,res)=>{
    const user={
        email=req.body.email,
        password=req.body.password
    }
    const{error,valid}=validatelogin(user)
    if(!valid){return res.json(error)}

    firebase.auth().signInWithEmailAndPassword (user.email,user.password)
    .then((data)=>{
        return data.getIdToken()
    })
    .then(token=>{ 
        return res.json({token})
      }).catch(err=>{console.error(err)})
}


//upload image
exports.uploadimage=(req,res)=>{
    const BusBoy=require('busboy')
    const fs=require('fs')
    const path=require('path')
    const os=require('os')
    if(MimeType !== 'png/jpeg'){
        return res.json('wrong file uploaded')
    }
    busboy=new BusBoy({headers:req.headers})
    busboy.on('file',(file,filename,fieldname,MimeType,encoding)=>{
        const imageupload={}
    const imgname=`${math.round(math.random()*100000000000)}.${imgextension}`
    const imgextension=filename.split('.')[filename.split('.')-1]
    const filepath=path.join(os.tmpdir(),imgname)
    imageupload={
        filepath,MimeType
    }  
    file.pipe(fs.createWriteStream(filepath))
    })

    busboy.on('finish',()=>{admin.storage().bucket().upload(imageupload.filepath,{
        resumable:false,
        metadata:{
            metadata:{
                contentType:imageupload.MimeType
            }
        }
    })
    }).then(()=>{
        const imgurl=`http://firebasestorage.googleapis.com/v0/b/${config.storageBucket}/o/${imgname}?alt=media`
        return db.doc(`users/${req.user.handle}`).update(imgurl)

    }).then(()=>{
        res.json({image:"image uploaded successfully"})
    }).catch(err=>{
        res.json(err)
    })
busboy.end(req.rawbody)
}

exports.adduserdetails=(req,res)=>{
    const userdetails=reduceuser(req.body)
    db.collection('users').doc(`${req.user.handle}`).update(userdetails)
    .then(()=>{
        req.json({message:"userdetails are successfully added"})
    }).catch(err=>{
        res.json(err)
    })
}

exports.getuserdetails=(req,res)=>{
    let userdata={}
    db.collection('users').doc(`${req.user.handle}`).get()
    .then(doc=>{
        if(doc.exists){
        userdata.details=doc.data()
        return db.collection('likes').where('userhandle','==',req.user.handle).get()
        }
    }).then(data=>{
        userdata.likes=[]
        data.forEach(doc=>{
            userdata.likes.push(doc.data())
        })
        return db.collection('notification').where('recipient','===',req.user.handle).limit(10).get()
    }).then(data=>{
        userdata.notifications=[]
        data.forEach(doc=>{
            userdata.notifications.push({
        createdat:new Date().toString(),
        recipients:doc.data().recipients,
        sender:doc.data().sender,
        type:doc.data().type,
        read:doc.data().read,
        notifications:doc.id,
        screamid:doc.data().screamid
            })
        }).then(data=>{
            return res.json(userdata)
        })
    }).catch(err=>{
        res.json(err)
    })
}

exports.markread=(req,res)=>{
    let batch=db.batch()
    req.body.forEach(doc=>{
        const notification=db.collection('notifications').doc(`${doc}`)
        batch.update(notification,{read:true});
    })
    batch.commit().then(()=>{res.json({message:"notification read true"})})
    .catch(err=>{err})
}