const { user } = require('firebase-functions/lib/providers/auth');
const{db}=require('./admin')
const { reduceuser}=require('./validator')

exports.getallscream=(req,res)=>{
    db.collection('scream').get()
    .then(data=>{
        let screams=[];
        data.forEach(element => {
        screams.push(element.data())    //or use => ...element.data(),{screamid:element.id}
    });
    return res.json(screams)
}).catch(err=>{console.log(err)})
}

exports.postallscream=(req,res)=>{
    const Post = {
        body:req.body.body,
        userhandle:req.user.handle,
        createdat:new Date().toISOString(), //db.Timestamp.fromDate(new Date())  for this we use new Date().tostring()
        userimage:req.user.imageurl,
        like:0,
        comment:0
    }// if we give get request to call this, its show error
    db.collection('scream').add(Post)
    .then(doc=>{res.json(`${doc.id} submitted successfully`)})
    .catch(err=>{console.log(err)
    })
}

exports.getcomments=(req,res)=>{
    let screamdata={}
    db.doc(`/scream/${req.params.screamid}`).get()
    .then(doc=>{
        if(!doc.exists){
            res.json({message:"scream id not found"})
        }else{
        screamdata=doc.data()
        screamdata.id=doc.data().id
        return db.doc(`/comments/${screamdata.id}`).limit(1).get()
        //or db.collection('comments').where('screamid','==',req.params.screamid).get()
        }
    }).then(data=>{
        screamdata.comments=[]
        data.forEach(doc=>{
            screamdata.comments.push(doc.data())
        })
        return res.json(screamdata)
    }).catch(err=>{
        res.json(err)
    })
}

exports.postcomments=(req,res)=>{
    const newcomment={
        userhandle:req.user.handle,
        userimage:req.user.imageurl,
        createdat:new Date().toISOString(),
        body:req.body.body,
        screamid:req.params.screamid
    }
    if(newcomment.body===""){return res.json({message:"must not be empty"})}
    db.doc(`/screams/${req.params.screamid}`).get()
    .then(doc=>{
        if(!doc.exists)
        {return res.json({message:"file not found"})}
        return doc.ref.update(doc.data().comment()+1)
    }).then(()=>{
        return db.collection('comments').add(newcomment)
    }).then(()=>{
        res.json({message:"comments succesfully added"})
    }).catch(err=>{
        res.json(err)
    })
}

exports.getlike=(req,res)=>{
        const screamdata;
        const likedoc=db.collection('likes').where('screamid','==',req.params.screamid).where('userhandle','==',req.user.handle)
        .limit(1)
        const screamdoc=db.doc(`/scream/${req.params.screamid}`)
  screamdoc.get()
  .then(doc=>{
      if(doc.exists){
          screamdata=doc.data()
          screamdata.screamid=doc.data().id
          return likedoc.get()
      }
      else{
          req.json({err:"file is empty"})
      }
    }).then(data=>{
        if(data.empty()){
            return db.collection('likes').add({
                screamid:res.params.screamid,
                userhandle:req.user.handle
            }).then(()=>{
                screamdata.like++
                screamdoc.update({like:screamdata.like})
            })
        }
        else{
            res.json("scream is liked")
        }
    }) .catch(err=>{
        res.json(err)
    })
}

exports.getunlike=(req,res)=>{
    const screamdata;
        const unlikedoc=db.collection('likes').where('screamid','==',req.params.screamid).where('userhandle','==',req.user.handle)
        .limit(1)
        const screamdoc=db.doc(`/scream/${req.params.screamid}`)
  screamdoc.get()
  .then(doc=>{
      if(doc.exists){
          screamdata=doc.data()
          screamdata.screamid=doc.data().id
          return unlikedoc.get()
      }
      else{
          req.json({err:"file is empty"})
      }
    }).then(data=>{
        if(data.empty()){
            return res.json({message:"scream not liked"})
        }
        else{
            return db.collection('likes').doc(`${screamdata.screamid}`).delete()
        }
    }).then(data=>{
       screamdata.like--
       return screamdoc.update({like:screamdata.like})
    }).then(()=>{
        res.json(screamdata)
    }) .catch(err=>{
        res.json(err)
    })
}

exports.deletescream=(req,res)=>{
    const document=db.doc(`/screams/${req.params.screamid}`)
    document.get()
    .then(doc=>{
        if(!doc.exists){
            res.json({message:"file not found"})
        }
        if(req.user.handle !== doc.data().userhandle){
            res.json("unauthorized")
        }
        else{
            document.delete()
        }
    }).then(()=>{
        res.json("successfully deleted")
    }).catch(err=>{
        res.json(err)
    })
}