const {db} = require('../util/admin')

exports.getAllDecisions = (req, res) => {
  db.collection('decisions')
  .orderBy('createTime', 'desc')
  .get()
  .then(data => {
    let decisions = []
    data.forEach(doc => {
      decisions.push({
        decisionId: doc.id,
        ...doc.data()
      })
    })
    return res.json(decisions)
  })
  .catch((err) => console.log(err))
}

exports.createDecision = (req, res) => {
  const {title, context} = req.body
  const {user} = req
  const decision = {
    context, user, title,
    createTime: new Date().toISOString()
  }
  db.collection('decisions').add(decision).then(doc => {
    return res.json(decision)
  }).catch(err => {
    return res.status(500).json({message: "Unable to create user."}, err)
  })
}

// TODO to test this endpoint works.
exports.getDecision = (req, res) => {
  let decision = {}
  db.doc(`/decisions/${req.params.decisionId}`).get()
  .then(doc => {
    if (!doc.exists) {
      return res.status(404).end()
    }
    decision = doc.data()
    decision.decisionId = doc.id
    return db.collection('comments').where('objectId', '==', req.params.decisionId).get()
  })
  .then(querySnapshot => {
    decision.comments = []
    querySnapshot.forEach(doc => {
      decision.comments.push(doc.data())
    })
      return res.json({decision})
  })
  .catch(error => {
    console.log(error)
    return res.status(500).json({error: err.code})
  })
}