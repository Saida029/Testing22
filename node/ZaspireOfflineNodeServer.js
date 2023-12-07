var express = require('express'), app = express();
//var http = require('http'), server = http.createServer(app), io = require('socket.io').listen(server);
var http = require('http'), server = http.createServer(app), io = require('socket.io')(server);

var constantValues = require('./NodeConstants.js');
var schedule = require('node-schedule');
var companies = [];

const child_process = require('child_process');

//Offline Process Calling
require('./ZaspireOffline.js');
var j = schedule.scheduleJob('0 */1 * * *', function(){
	
	var fechcompanies = child_process.exec("php "+CRON_SCHEDULER_PATH+" /fetchCompanieForNode/",function 
			(error, stdout, stderr) {
		 if (error){
			 console.log('Message::'+error);
		 }else{
			 companies = stdout;
			offlineProcess(companies);
		 }
	});
});
server.listen(OFFLINE_PORT);