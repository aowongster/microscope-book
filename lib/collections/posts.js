Posts = new Mongo.Collection('posts');

// you can define ACL for crud functions here implemented on the client side
// permissions helper defined in lib/permissions, allow client side modify
Posts.allow({
  update: function(userId, post) {
    return ownsDocument(userId, post);
  },
  remove: function(userId, post) {
    return ownsDocument(userId, post);
  }
});

// using method call so this is no longer required?
// Posts.deny({
//   update: function(userId, post, fieldNames) {
//     // may only edit the following two fields:
//     // return without these fields means someone tampers, true and deny
//     return (_.without(fieldNames, 'url', 'title').length > 0);
//   }
// });

// Posts.deny({
//   update: function(userId, post, fieldNames, modifier) {
//     var errors = validatePost(modifier.$set);
//     return errors.title || errors.url;
//   }
// });

Meteor.methods({

  // meteor call method
  // check params and enforce security by setting params server side
  postInsert: function(postAttributes) {
    check(Meteor.userId(), String);
    check(postAttributes, {
      title: String,
      url: String
    });

    // server side validation before insert,
    var errors = validatePost(postAttributes);
    if (errors.title || errors.url)
      throw new Meteor.Error('invalid-post', "You must set a title and URL for your post");

    // check for duplicates and redirect the user
    var postWithSameLink = Posts.findOne({url: postAttributes.url});
    if (postWithSameLink) {
      return {postExists: true, _id: postWithSameLink._id}
    }

    // setup the link object and save to db
    var user = Meteor.user();
    var post = _.extend(postAttributes, {
      userId: user._id,
      author: user.username,
      submitted: new Date()
    });
    var postId = Posts.insert(post);
    return {_id: postId};
  },

  // meteor method for edit funciton
  postEdit: function(postAttributes) {
    check(Meteor.userId(), String);
    check(postAttributes, {
      title: String,
      url: String,
      _id: String
    });

    // server side validation for edit/ update
    var errors = validatePost(postAttributes);
    if (errors.title || errors.url)
      throw new Meteor.Error('invalid-post', "You must set a title and URL for your post");

    // break out object
    var currentPostId = postAttributes._id;
    var postProperties = {
      title: postAttributes.title,
      url: postAttributes.url
    };

    // check for duplicates before submit edtting
    var postWithSameLink = Posts.findOne({
      _id: {
        $ne: postAttributes._id
      },
      url: postAttributes.url
    });

    if (postWithSameLink) {
      return {postExists: true, _id: postWithSameLink._id}
    }

    Posts.update(currentPostId, {
      $set: postProperties
    }, function(error) {
      if (error) {
        return {editError: true, _id: currentPostId}
      } else {
        return {_id: currentPostId};
      }
    })
  }
});

// check posts submitted for all fields
validatePost = function(post) {
  var errors = {};
  if (!post.title)
    errors.title = "Please fill in a headline";
  if (!post.url)
    errors.url = "Please fill in a URL";
  return errors;
}
