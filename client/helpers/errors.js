// Local (client-only) collection
Errors = new Mongo.Collection(null);

throwError = function(message) {
  Errors.insert({message: message});
};

// define template through local client lookup
Template.errors.helpers({
  errors: function() {
    return Errors.find();
  }
});

// clears out rendered errors so messages dont stack after 3 seconds
Template.error.onRendered(function() {
  var error = this.data;
  Meteor.setTimeout(function() {
    Errors.remove(error._id);
  }, 3000);
});
