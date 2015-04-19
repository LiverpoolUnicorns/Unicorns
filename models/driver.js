/**
 * Created by josephyearsley on 19/04/15.
 */
var mongoose = require('mongoose');

var DriverSchema = new mongoose.Schema({
    //Unique driver id
    code: Number,
    //To get rough timetabling - To give on time or not
    date:{ type: Date, default: Date.now },
    line: String,
    //For use in point of interest on client
    lon: String,
    lat: String,
    //Used for DB to not use buses already gone past.
    lastStop: String
});

exports.Driver = mongoose.model('Driver', DriverSchema);