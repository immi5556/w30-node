var nodemailer = require('nodemailer');
var smtpTransport = require('nodemailer-smtp-transport');

var wrapper = function(){
	var transporter = nodemailer.createTransport(smtpTransport({
	    host: 'send.one.com',
	    port: 465,
	    secure: true,
	    auth: {
	        user: 'admin@que.one',
	        pass: '123456'
	    }
	}));

	var emailoption = {
		emailtype: 'CompanyInvite',
		linkurl: 'http://registration.within30.com/',
		subject: '',
		text: '', 
	    html: '' 
	};

	var getOption = function(opts, options){
		var mailOptions = {
		    from: 'Admin ✔ <admin@que.one>', // sender address
		    to: options.to,
		    //cc: 'immanuelr@streamlinedmedical.in',
		    subject: options.subject,
		    text: options.text,
		    html: options.html
		};

		return mailOptions;
	}

	var sendEmail = function(opts, options) {
		transporter.sendMail(getOption(opts, options), function(error, info){
		    if(error){
		    	options.state = 'Error';
		    	options.message = error;
		    	options.info = info;
		    	opts.daler.logEmail(options);
		        return console.log(error);
		    }
		    options.state = 'Sucess';
		    options.message = info.response;
		    options.info = info;
		    opts.daler.logEmail(options);
		    console.log('Message sent: ' + info.response);
		});
	}

	var send = function(opts, option) {
		var options =  opts.qutils.extend(emailoption, option, true);
		if (options.action == 'ccreate'){
			//options.html = "<div> Que Invite -  Mr. " + options.regis.name + ", Please follow the link <a>" + options.linkurl + options.uniqueid + "</a></div>";
			options.html = "<h2 style='text-align:center;color:#39425f;font-size:30px;font-weight: 700; font-family:italic;'>Account Access</h2><br/><div style='text-align:center;color:#39425f;font-size:18px;font-weight:700;margin:0 30px;line-height: 26px;'>Click the button below to access your account and <br> customize your Business Page</div><br/><a style='background-color: #cb2027;height: 38px;color: #ffffff;line-height: 38px;text-decoration: none;font-size: 14px;font-weight: 700;width: 194px;display: block;margin: auto;border-radius: 20px;text-align: center;' href="+options.linkurl + options.uniqueid+" target='_blank'>Access</a><br><p style='padding: 0;margin: 0;font-size: 14px;color: #39425f;text-align: center;'>Button not working? Try pasting the link below into your browser.</p><br><div style='text-align:center;color: #cb2027;font-size: 16px;line-height: 22px;text-decoration: none;font-weight: 700'>"+ options.linkurl + options.uniqueid +"</div><br/><table width='100%><tr><td><a href='#'><h1>Within30</h1></a></td><td width='186px'><p style='color: #575757;font-size: 12px;padding: 0;margin: 0;'>2222 W Spring Creek Parkway,<br/> # 104<br/> Plano, TX 75023</p></td></tr></table>"
			options.text = 'Please continue with you registration';
			options.subject = 'Invite - Que One';
			options.to = options.regis.email;
			sendEmail(opts, options);
		}else if(options.action == 'contactUs'){
			options.html = "<div> From: "+options.regis.name+"<br>"+options.regis.message+"</div>";
			options.text = "";
			options.subject = 'contact Us';
			options.to = "vamsi@within30.com";
			sendEmail(opts, options);
		}
	}

	return {
		send: send
	}

}

module.exports.emailer =  wrapper();