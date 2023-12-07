var zaspireusers = [];

var resumeimportmessages = [];
var leadimportmessages =  [];
var accountimportmessages =  [];
var opportunityimportmessages =  [];
var contactimportmessages =  [];
var jobimportmessages =  [];
var campaignimportmessages = [];
var alertmessages = [];
var connectionsArray = [];
var emailProcessesMassages = [];
const child_process = require('child_process');

var constantValues = require('./NodeConstants.js');
var schedule = require('node-schedule');

alertProc = function(){
	var j = schedule.scheduleJob('*/2 * * * *', function(){
		alertsProcess();
	});
}

onlineProcess = function(socket){

	//On user opens a web page
	socket.on('userid', (data) => {
		var userid = "_"+data.userid;
			 zaspireusers[socket.id]={id : socket.id,userid : userid};
			 connectionsArray.push(socket);
			 sendstatus(data.userid);
console.log("New User");
	});
	
	
	//Ondemand Email Process
	socket.on('onDemandEmail', (data) => {
		console.log("onDemandEmail Called");
		var userid = "_"+data.userid;
		var arraydata = JSON.parse(data.result);
		var subject = arraydata.subjects;
		var type 	=  arraydata.type;
		var account_id =  arraydata.account_id;
		var msg_nos 	= arraydata.msg_nos;
		var user_id 	= arraydata.user_id;
		var company_id 	= arraydata.company_id;
		
		var workerProcess = child_process.exec("php "+CRON_SCHEDULER_PATH+" /checkRuleExist/"+subject+"/"+type+"/"+account_id+"/"+msg_nos+"/"+user_id+"/"+company_id, {maxBuffer: 1024 * 200}, function 
				(error, stdout, stderr) {
			console.log(stdout);
			if (error) {
				console.log(error);
				  emailProcessesMassages[userid]={status:"error",msg:error};
				  sendstatus(data.userid);
			  }else {
				  console.log(stdout);
				  emailProcessesMassages[userid]={status:"success",msg:stdout};
				  sendstatus(data.userid);
				  /*console.log("onDemandEmail success");
				  $("#message").empty().append(result).show();*/
			  }
		});
	}); //ending Ondemand Email
	
	
	
	//Import Process
	socket.on('import', (data) => {
		var model = data.model;
		console.log("Import "+model+" Process Called");
		var userid = "_"+data.userid;
		
		var workerProcess = child_process.exec("php "+CRON_SCHEDULER_PATH+" /importProcessStart/"+data.importid, {maxBuffer: 1024 * 200},function 
			(error, stdout, stderr) {
			console.log(stdout);
				if(error){
				  if (model == 'Candidate') {
					  resumeimportmessages[userid]={status:"error",msg:"Candidate Import process failed"};
					  sendstatus(data.userid);
				  }else if(model == 'Lead'){
					  leadimportmessages[userid]={status:"error",msg:"Lead Import process failed"};
					  sendstatus(data.userid);
				  }else if(model == 'Account'){
					  accountimportmessages[userid]={status:"error",msg:"Account Import process failed"};
					  sendstatus(data.userid);
				  }else if(model == 'Opportunity'){
					  opportunityimportmessages[userid]={status:"error",msg:"Opportunity Import process failed"};
					  sendstatus(data.userid);
				  }else if(model == 'Contact'){
					  contactimportmessages[userid]={status:"error",msg:"Contact Import process failed"};
					  sendstatus(data.userid);
				  }else if(model == 'Job'){
					  jobimportmessages[userid]={status:"error",msg:"Job Import process failed"};
					  sendstatus(data.userid);
				  }else if(model == 'Campaign'){
					  campaignimportmessages[userid]={status:"error",msg:"Campaign Import process failed"};
					  sendstatus(data.userid);
				  }
			  }else{
				  if(stdout){
					  if (model == 'Candidate') {
						  resumeimportmessages[userid]={msg:stdout,status:"success"};
					  }else if (model == 'Lead') {
						 leadimportmessages[userid]={msg:stdout,status:"success"};
					  }else if (model == 'Account') {
						 accountimportmessages[userid]={msg:stdout,status:"success"};
					  }else if (model == 'Opportunity') {
						 opportunityimportmessages[userid]={msg:stdout,status:"success"};
					  }else if (model == 'Contact') {
						 contactimportmessages[userid]={msg:stdout,status:"success"};
					  }else if (model == 'Job') {
						 jobimportmessages[userid]={msg:stdout,status:"success"};
					  }else if (model == 'Campaign') {
						  campaignimportmessages[userid]={msg:stdout,status:"success"};
					  }
				  }
				  
			  }
			  sendstatus(data.userid);
			  child_process.exec("php "+CRON_SCHEDULER_PATH+" /tagsProcess/"+data.importid, {maxBuffer: 1024 * 200},function 
						(error, stdout, stderr) {
				  console.log("tags:::"+stderr+stdout);
			  });
	
		});
	}); //ending import
	
	//Removing resume import process status after emiting to user.
	socket.on('killimport', (data) => {

		var userid = "_"+data.userid;
		var model = data.model;
		console.log("killing"+model);

		  if (model == 'Candidate') {
			delete resumeimportmessages[userid];
		  }else if (model == 'Lead') {
			  delete leadimportmessages[userid];
		  }else if (model == 'Account') {
			  delete accountimportmessages[userid];
		  }else if (model == 'Opportunity') {
			  delete opportunityimportmessages[userid];
		  }else if (model == 'Contact') {
			  delete contactimportmessages[userid];
		  }else if (model == 'Job') {
			  delete jobimportmessages[userid];
		  }else if (model == 'Campaign') {
			  delete campaignimportmessages[userid];
		  }else if (model == 'EmailImport') {
			  delete emailProcessesMassages[userid];
		  }
	});
	
	//Removing alerts messages after emiting to user.
	socket.on('killalertmessage', (data) => {
		console.log('killalertmessage Called'+data.mids);
		var userid = "_"+data.userid;
		delete alertmessages[userid];
		//update function calling
		var alertUpdateProcess = child_process.exec("php "+CRON_SCHEDULER_PATH+" /updateAlertStatus/"+data.mids, {maxBuffer: 1024 * 200},function 
			(error, stdout, stderr) {
			console.log(stdout);
			  if (error) {
				  console.log("Alert Messages Update Failed"+data.mids);  
			  }else {
				console.log("Alert Messages updated"+data.mids);  
			  }
		});
	});
	  //Removing socket from connected clients sockets on disconnecting 
	  socket.on('disconnect', function() {
		var socketIndex = connectionsArray.indexOf(socket);
		console.log('socketID = %s got disconnected', socketIndex);
			if (~socketIndex) {
				connectionsArray.splice(socketIndex, 1);
			}
			delete zaspireusers[socket.id];
		});
	  
	  
		//Search related data indexing Process
		socket.on('dataIndexing', (data) => {
			console.log("Serach DataIndexing Process Called");
			var userid = "_"+data.userid;
			var workerProcess = child_process.exec("php "+CRON_SCHEDULER_PATH+" /elasticSearchDataBulkIndexing/"+data.companyids+"/"+data.moduleids, {maxBuffer: 1024 * 200},function 
				(error, stdout, stderr) {
				
				console.log(stdout);
				
					if(error){
						console.log(error);
				    }else{
						console.log("Search Related Data successfully indexed"); 
				    }
				  sendstatus(data.userid);
		
			});
		}); //ending Search related data indexing 
		
		//Candidates Creat using resume parssing Process
		socket.on('resumeParsing', (data) => {
			console.log("Candidates Creat using resume parssing Process Called");
			var userid = "_"+data.userid;
			//var arraydata = data.result;
			var full_path = data.extractFoldersFullpath;
			var import_batch_id = data.importBatchId;
			var created 	=  data.extractFoldersCreated;
			var folderName =  data.extractFollderName;
			var company_id 	= data.companyId;
			console.log(full_path);
			var workerProcess = child_process.exec("php "+CRON_SCHEDULER_PATH+" /CandidatesCreateFromZip/"+import_batch_id+"/"+full_path+"/"+created+"/"+folderName+"/"+company_id, {maxBuffer: 1024 * 200},function 
				(error, stdout, stderr) {
				console.log(stdout);
					if(error){
						console.log(error);
				    }else{
						console.log("Successfully Candidates Created using resume.");
				    }
				  sendstatus(data.userid);
		
			});
		}); //ending Candidates Creat using resume parssing Process
}

// Sending process status for users.
sendstatus = function(userid){
	//Checking resume import process status of current user
	if (userid>=0){
		if(resumeimportmessages['_'+userid]){
			var msg = resumeimportmessages['_'+userid];
			connectionsArray.forEach(function(tmpSocket) {
				  if(zaspireusers[tmpSocket.id].userid == '_'+userid){
					  tmpSocket.volatile.emit('resumeimportstatus', {
								msg,
								status:"success"
						});
				  }
			});
		}
		if(leadimportmessages['_'+userid]){
			var msg = leadimportmessages['_'+userid];
			connectionsArray.forEach(function(tmpSocket) {
				  if(zaspireusers[tmpSocket.id].userid == '_'+userid){
					  tmpSocket.volatile.emit('leadimportstatus', {
								msg,
								status:"success"
						});
				  }
			  });
		}
		if(accountimportmessages['_'+userid]){
			var msg = accountimportmessages['_'+userid];
			connectionsArray.forEach(function(tmpSocket) {
				  if(zaspireusers[tmpSocket.id].userid == '_'+userid){
					  tmpSocket.volatile.emit('accountimportstatus', {
								msg,
								status:"success"
						});
				  }
			});
		}
		
		if(opportunityimportmessages['_'+userid]){
			var msg = opportunityimportmessages['_'+userid];
			connectionsArray.forEach(function(tmpSocket) {
				  if(zaspireusers[tmpSocket.id].userid == '_'+userid){
					  tmpSocket.volatile.emit('opportunityimportstatus', {
								msg,
								status:"success"
						});
				  }
			});
		}
		
		if(contactimportmessages['_'+userid]){
			var msg = contactimportmessages['_'+userid];
			connectionsArray.forEach(function(tmpSocket) {
				  if(zaspireusers[tmpSocket.id].userid == '_'+userid){
					  tmpSocket.volatile.emit('contactimportstatus', {
								msg,
								status:"success"
						});
				  }
			});
		}
		
		if(jobimportmessages['_'+userid]){
			var msg = jobimportmessages['_'+userid];
			connectionsArray.forEach(function(tmpSocket) {
				  if(zaspireusers[tmpSocket.id].userid == '_'+userid){
					  tmpSocket.volatile.emit('jobimportstatus', {
								msg,
								status:"success"
						});
				  }
			});
		}
		
		if(campaignimportmessages['_'+userid]){
			var msg = campaignimportmessages['_'+userid];
			connectionsArray.forEach(function(tmpSocket) {
				  if(zaspireusers[tmpSocket.id].userid == '_'+userid){
					  tmpSocket.volatile.emit('campaignimportstatus', {
								msg,
								status:"success"
						});
				  }
			});
		}
		
		if(emailProcessesMassages['_'+userid]){
			var msg = emailProcessesMassages['_'+userid];
			connectionsArray.forEach(function(tmpSocket) {
				  console.log(tmpSocket.id);
				  if(zaspireusers[tmpSocket.id].userid == '_'+userid){
					  tmpSocket.volatile.emit('emailimportstatus', {
								msg,
								status:"success"
						});
				  }
			});
		}
	}
}

sendAlert = function(userid){
		var msg = alertmessages['_'+userid];
		connectionsArray.forEach(function(tmpSocket) {
			  if(zaspireusers[tmpSocket.id].userid == '_'+userid){
				  tmpSocket.volatile.emit('alertmessagestatus', {
							msg,
							status:"success"
					});
			  }
		  });
}
//Alerts
alertsProcess = function(){
	var alerts = child_process.exec("php "+CRON_SCHEDULER_PATH+" /getAllPopupAlert", {maxBuffer: 1024 * 2000},function 
			(error, stdout, stderr) {
		 if (error){
			 console.log('Message::'+error);
		 }else if(stdout){
			 var arraydata = JSON.parse(stdout);
			for(var i=0;i<arraydata.length;i++){
				//console.log(arraydata[i].msg);
				alertmessages['_'+arraydata[i].user_id]={msg:arraydata[i].msg,mids:arraydata[i].mids,status:"success"};
				sendAlert(arraydata[i].user_id);
			}
		 }
	});
}
