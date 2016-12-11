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

Posts.deny({
    update: function(userId, post, fieldNames) {
        // may only edit the following two fields:
        // return without these fields means someone tampers, true and deny
        return (_.without(fieldNames, 'url', 'title').length > 0);
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
    },

    // meteor method for edit funciton
    postEdit: function(postAttributes) {
        check(Meteor.userId(), String);
        check(postAttributes, {
            title: String,
            url: String,
            _id: String
        });

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
