const express=require('express')
const functions=require('firebase-functions')
const { db } = require('./admin')
const app=express()
const auth=require('./authmiddleware')
const config=require('./config')

const {getallscream,postallscream,getcomments,postcomments,getlike,getunlike,deletescream}=require('./getscream')
const {signup,login,uploadimage,adduserdetails,getuserdetails,markread}=require('./signup')




app.get('/scream',getallscream);

//use this for firebase => exports.getscream=functions.https.onRequest()
app.post('/scream',auth,postallscream)

app.post('/signup',signup)

  //to signing the form
app.post('/login',login)
//https://google.com/something
//for using that => we use https://google.com/admin/something

app.post('/image',auth,uploadimage)
app.post('/userdetails',auth,adduserdetails)
app.get('/user',auth,getuserdetails)
app.post('/notifications',auth,markread)

app.get('/scream/:screamid/like',auth,getlike)
app.get('/scream/:screamid/unlike',auth,getunlike)
app.delete('/scream/:screamid',auth,deletescream)

app.get('/scream/:screamid',getcomments)
app.post('/scream/:screamid/comments',auth,postcomments)

//createnotifications
exports.createlikenotifications=functions.firestore.document(`/likes/{id}`)
.onCreate(snapshot=>{
  db.doc(`/screams/${snapshot.data().screamid}`).get()
  .then(doc=>{
    if(doc.exists){
      db.collection(`notifications`).doc(`${snapshot.id}`).set({
        createdat:new Date().toString(),
        recipients:doc.data().userhandle,
        sender:snapshot.data().userhandle,
        type:'like',
        read:false,
        screamid:doc.id
      }).then(()=>{
        return
      }).catch(()=>{
        return
      })
    }
  })
})

exports.notificationsunlike=functions.firestore.document(`/like/${id}`)
.onDelete(snapshot=>{
  db.doc(`notifications/${snapshot.id}`).delete().then(()=>{return})
  .catch(()=>{
    return
  })
  })


exports.createcommentnotifications=functions.firestore.document(`/comments/{id}`)
.onCreate(snapshot=>{
  db.doc(`/screams/${snapshot.data().screamid}`).get()
  .then(doc=>{
    if(doc.exists){
      db.collection(`notifications`).doc(`${snapshot.id}`).set({
        createdat:new Date().toString(),
        recipients:doc.data().userhandle,
        sender:snapshot.data().userhandle,
        type:'comment',
        read:false,
        screamid:doc.id
      }).then(()=>{
        return
      }).catch(()=>{
        return
      })
    }
  })
})

//we use another server region => .region()

exports.admin=functions.https.onRequest(app)