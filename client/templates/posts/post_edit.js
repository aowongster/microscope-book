Template.postEdit.events({
    'submit form': function(e) {
        e.preventDefault();
        var currentPostId = this._id;
        var postProperties = {
            url: $(e.target).find('[name=url]').val(),
            title: $(e.target).find('[name=title]').val(),
            _id: currentPostId
        };

        // call server side meteor method to do insert
        Meteor.call('postEdit', postProperties, function(error, result) { // display the error to the user and abort
            if (error)
                return alert(error.reason);

            // catch special case and alert user
            if (result.postExists)
                alert('This link has already been posted');

            Router.go('postPage', {_id: result._id});
        });
    },
    'click .delete': function(e) {
        e.preventDefault();
        if (confirm("Delete this post?")) {
            var currentPostId = this._id;
            Posts.remove(currentPostId);
            Router.go('postsList');
        }
    }
});
