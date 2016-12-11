Posts = new Mongo.Collection('posts');

// permissions helper defined in lib/permissions, allow client side modify
Posts.allow({
    update: function(userId, post) {
        return ownsDocument(userId, post);
    },
    remove: function(userId, post) {
        return ownsDocument(userId, post);
    }
});

Meteor.methods({

    // meteor call method
    // check params and enforce security by setting params server side
    postInsert: function(postAttributes) {
        check(Meteor.userId(), String);
        check(postAttributes, {
            title: String,
            url: String
        });

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
    }
});
