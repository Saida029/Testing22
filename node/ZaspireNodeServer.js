var express = require('express'), app = express();
//var http = require('http'), server = http.createServer(app), io = require('socket.io').listen(server);
var http = require('http'), server = http.createServer(app), io = require('socket.io')(server);
var schedule = require('node-schedule');

var constantValues = require('./NodeConstants.js');
var companies = [];

const child_process = require('child_process');

require('./ZaspireOnline.js');

//Online Process Calling
io.on('connection', function (socket) {
	onlineProcess(socket);
});
//For Alerts
alertProc();
console.log("before Offline");
//Offline Process Calling
require('./ZaspireOffline.js');
console.log("Offline initiated"+new Date());
var j = schedule.scheduleJob('*/2 * * * *', function(){
	console.log("befor newsletter");
	//newsletterScheduleEmailSentProcess();
});

var j = schedule.scheduleJob('*/1 * * * *', function(){
	console.log("befor Event send Email Reminders");
	eventScheduleEmailSentProcess();
});

var j = schedule.scheduleJob('*/59 * * * *', function(){
	console.log("befor Event send Email Reminders");
	serviceAttachmentsScheduleEmailSentProcess();
});

var processstatus = '';
var j = schedule.scheduleJob('*/2 * * * *', function(){
	if(processstatus != 'started'){
		processstatus = 'started';
		var workerProcess = child_process.exec("php "+CRON_SCHEDULER_PATH+" /emailProcess/"+1,function
		(error, stdout, stderr) {
			
			if (error){
				console.log('Message  Error in email import :: '+error);
				
				var notifyProcess = child_process.exec("php "+CRON_SCHEDULER_PATH+" /errorNotification/",function
					(error, stdout, stderr) {
						if (error){
							console.log('Message  Error in EMail Error Notification :: '+error);
						}else{
							console.log('Message EMail Error Notification  :: '+stdout+"  "+new Date());
						}
					});
				
			}else{
				processstatus='';
				console.log('Message success :: '+stdout+"  "+new Date());
			}
		});
	}
});
server.listen(PORT);
