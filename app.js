    const express = require('express');
    const bodyParser = require('body-parser');

    const order = require('./routes/order.route');
    const factory = require('./routes/manufacture.route');
    const city = require('./routes/city.route');
    const size = require('./routes/size.route');
    const client = require('./routes/client.route');
    const app = express();
	
	const httpClient = require('./utils/http.client');
	const nameCity = require('./models/city.model');
	const manufacture = require('./models/manufacture.model');
	const sizeModel = require('./models/size.model');
	const orderModel = require('./models/order.model');
    
    const mongoose = require('mongoose');
    let orders_db_url = 'mongodb://Vasco:a123456@ds042527.mlab.com:42527/mcorderdatabase';
    let mongo_db = process.env.MONGODB_URI || orders_db_url;
    //mongoose.connect(mongo_db);
    mongoose.Promise = global.Promise;
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'MongoDB connection error:'));
    db.on('connected', ()=>{console.log('MongoDB connection ok:')});
    mongoose.connect(mongo_db);

    
    //Adds cities, which exists in database, to the logistic (knowledge base)
	nameCity.find({}, function (err, cities) {
        if (err) return next(err);
		httpClient.post(JSON.stringify(cities), "city");
    });

	//Adds manufactories, which exists in database, to the logistic (knowledge base)
    manufacture.find({}, function (err, manufactories) {
        if (err) return next(err);
		httpClient.post(JSON.stringify(manufactories), "manufactory");
    });

    //Adds sizes, which exists in database, to the logistic (knowledge base)
    sizeModel.find({}, function (err, sizes) {
        if (err) return next(err);
        httpClient.post(JSON.stringify(sizes), "packageSize");
    });
 
    //Adds orders, which exists in database, to the logistic (knowledge base)
    orderModel.find({}, function (err, orders) {
        if (err) return next(err);
        httpClient.post(JSON.stringify(orders), "order");
    });

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));
   
    //adds routes
    app.use('/orders', order);
    app.use('/manufactures', factory);
    app.use('/cities', city);
    app.use('/sizes', size);
    app.use('/clients', client);

    let port = 1234;
    app.listen(port, () => {
        console.log('Server is up and running on port number ' + port);
    });

    module.exports = app;