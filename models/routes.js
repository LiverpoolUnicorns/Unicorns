/**
 * Created by josephyearsley on 19/04/15.
 */
var mongoose = require('mongoose');

//To store routes when discovered
var RoutesSchema = new mongoose.Schema({
    line: String,
    //saves looking up again
    route: [{locationCode: String, lat: String, lon: String}]
});

exports.Routes = mongoose.model('Routes', RoutesSchema);