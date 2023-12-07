//Off Line Process
const child_process = require('child_process');
var schedule = require('node-schedule');
var constantValues = require('./NodeConstants.js');
//var companies = [];

offlineProcess = function(companies){
console.log("Before calling Email process");
	emailProcess(companies);
 console.log('Email Process Called');
}

//Email Process
emailProcess = function(companies){
/*
var dateTime = require('node-datetime');
var dt = dateTime.create();
var formatted = dt.format('Y-m-d H:M:S'); */

	console.log('Email Process Called'+new Date());
	if(companies){
		var companiesList = JSON.parse(companies);
	
		var y=0;
		if(y<=2){
			for(var i=0;i<companiesList.length;i++){
				var workerProcess = child_process.exec("php "+CRON_SCHEDULER_PATH+" /emailProcess/"+companiesList[i],function 
				(error, stdout, stderr) {
					y++;
					if (error){
						 console.log('Message::'+error);
					 }else{
						 console.log('Message::'+stdout+new Date());
					 }
					if(y==2){
							y=0;
							console.log('z re assigned to zero in emails');
						}
				});
			}
		}
	}
}

//Newsletter Sending scheduled emails
newsletterScheduleEmailSentProcess = function(){
	console.log('Newsletter Sending scheduled emails Process Called');
	var workerProcess = child_process.exec("php "+CRON_SCHEDULER_PATH+" /newsletterSendEmails",function 
	(error, stdout, stderr) {
		console.log(stdout);
		 if (error){
			 console.log('Message::'+error);
		 }else{
			 console.log('Message::'+stdout);
		 }
	});
}

//Events Remainders Sending scheduled emails
eventScheduleEmailSentProcess = function(){
	console.log('Event Sending scheduled emails Process Called');
	var workerProcess = child_process.exec("php "+CRON_SCHEDULER_PATH+" /sendEmailReminders",function 
	(error, stdout, stderr) {
		console.log(stdout);
		 if (error){
			 console.log('Message::'+error);
		 }else{
			 console.log('Message::'+stdout);
		 }
	});
}

//Services Attachments Sending scheduled emails
serviceAttachmentsScheduleEmailSentProcess = function(){
	console.log('Services Attachments Sending scheduled emails Process Called');
	var workerProcess = child_process.exec("php "+CRON_SCHEDULER_PATH+" /serviceAttachmentsAlerts",function 
	(error, stdout, stderr) {
		console.log(stdout);
		 if (error){
			 console.log('Message::'+error);
		 }else{
			 console.log('Message::'+stdout);
		 }
	});
}
