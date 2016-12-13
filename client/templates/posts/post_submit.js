Template.postSubmit.events({
    'submit form': function(e) {
        e.preventDefault();
        var post = {
            url: $(e.target).find('[name=url]').val(),
            title: $(e.target).find('[name=title]').val()
        };

        // call server side meteor method to do insert
        Meteor.call('postInsert', post, function(error, result) { // display the error to the user and abort
            if (error)
                return throwError(error.reason);

            // catch special case and alert user
            if (result.postExists)
                throwError('This link has already been posted');

            Router.go('postPage', {_id: result._id});
        });
    }
});
