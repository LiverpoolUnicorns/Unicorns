var express = require('express');
var router = express.Router();


var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://joe:icebaby@ds059917.mongolab.com:59917/unicorns');
var Driver = require('../models/driver.js').Driver;
var Routes = require('../models/routes.js').Routes;

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'Express', me: 'Joe' });
});

router.get('/api/nearbyStops/:long/:lat', function(req,res){
    var http = require('http');

    var username = 'ed24884593f0d9c6a88fa5e2664e3c2e';
    var password = '';
    var options = {
        host: 'itracs-project.org',
        path: '/api/7c60e7f4-20ff-11e3-857c-fcfb53959281/bus/'+
        'stops/near.json?lon='+req.param('long')+'&lat='+req.param('lat')+'&page=1&rpp=3',
        headers: {
            'Authorization': 'Basic ' + new Buffer(username + ':' + password).toString('base64')
        }
    };
    var data = '';
    try{
        var request = http.request(options
            ,
            function (response) {
                console.log('STATUS: ' + response.statusCode);
                console.log('HEADERS: ' + JSON.stringify(response.headers));
                response.setEncoding('utf8');
                response.on('data', function (chunk) {
                    data  += chunk;
                });
                response.on('end', function () {
                    res.send(data);
                });
            });
    }catch(e){console.log(e)}
    request.end();
});

router.get('/api/nextbus/:stopID', function(req,res){
    var http = require('http');
    var str = new Date().toISOString().
        replace(/T/, ' ').      // replace T with a space
        replace(/\..+/, '')
    var date = str.substring(0,str.length - 3).split(" ");
    console.log(date[1]);
    var username = 'ed24884593f0d9c6a88fa5e2664e3c2e';
    var password = '';
    var options = {
        host: 'itracs-project.org',
        path: '/api/7c60e7f4-20ff-11e3-857c-fcfb53959281/bus/stop/'+req.param('stopID')+'/'+date[0]+'/'+date[1]+'/timetable',
        headers: {
            'Authorization': 'Basic ' + new Buffer(username + ':' + password).toString('base64')
        }
    };
    var data = '';
    try{
        var request = http.request(options
            ,
            function (response) {
                console.log('STATUS: ' + response.statusCode);
                console.log('HEADERS: ' + JSON.stringify(response.headers));
                response.setEncoding('utf8');
                response.on('data', function (chunk) {
                    data  += chunk;
                });
                response.on('end', function () {
                    res.send(data);
                });
            });
    }catch(e){console.log(e)}
    request.end();
});

router.get('/api/busDriver/:driverCode/:line/:lastStop/:long/:lat', function(req,res){

    var driver = new Driver({
        code : req.param('driverCode'),
        line: req.param('line'),
        lon: req.param('long'),
        lat: req.param('lat'),
        lastStop: req.param('lastStop')
    });

    driver.save(function(err, driv) {
        if (err){
            console.error(err);
            res.sendStatus(500);
        }else{
            console.dir(driv);
        }
    });

    /**
     * SORT IN HERE THE ROUTE DOC, SO IF PAST ALL THEN WE HAVE ROUTE FOR THAT LINE!
     */
    //See that there's no route, so then check to find last stop
    Routes.find({line: req.param('line')}, function(err,doc){
        //Back to the start, so unravel and save into routes
        if(doc.length == 0){
            //find by last stop, then sort ascending
            Driver.find({lastStop: req.param('lastStop')}).sort(date).exec(function(err,docs){
                if(docs.length > 1){
                     temp = [];

                    //Go through docs and insert into array. Don't double count the last one.
                    for(i=0;i>docs.length-1;i++){
                        temp.push({locationCode: docs[i].lastStop, lat: docs[i].lat, lon: docs[i].lon})
                    }

                    var routes = new Routes({
                        line : req.param('line'),
                        route : temp
                    })
                    //save the new route
                    routes.save(function(err, rout) {
                        if (err){
                            console.error(err);
                            res.sendStatus(500);
                        }else{
                            console.dir(rout);
                        }
                    })
                }
            })
        }
    })
    res.sendStatus(200)

});

router.get('/api/nextBus/:line/:locationCode/:long/:lat', function(req,res){

    /**
     * Insert DB Queries here to collect all data of that line.
     * filter by if that drivers visited that stop recently, build up the rough data for a round trip on way.
     * then put into the routing api and use the distance as well as rough timings.
     * On top use our drivers data to work out average speed, and calculate our own timings.
     * Future can use a neural network to learn timings based on time, day, weather and average speed. (SOM?)
     */

    Routes.find({line: req.param('line')}, function(err,data){
        if(data.length > 0)
            Driver.find({line: 'line', code: 'code'}).sort(-date).exec(function(err,docs){

            })
    })
    res.sendStatus(200);
    /*if line in DB
     can see if in radius then exclude from analysis, by looking up stop code and position in array
     else
     agg on driver and line, order on time. if its in the past then its visited your stop.

     var driver+line = above

     var estimate time = route the locations and take distance, and average speed.
     return estimate timing, and if delayed or not, as well as lat and long
     */
});


module.exports = router;
