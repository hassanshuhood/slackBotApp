const OracleBot = require('@oracle/bots-node-sdk');
const { webhookUtil } = require('@oracle/bots-node-sdk/util');
const channel = require('../webhookConfig.js')
module.exports = (app,controller) => {

	OracleBot.init(app);

	// implement webhook
	const { WebhookClient, WebhookEvent } = OracleBot.Middleware;

	const webhook = new WebhookClient({ channel: channel });
	webhook.on(WebhookEvent.ERROR, console.error);

	// receive bot messages
	app.post('/bot/message', webhook.receiver()); // receive bot messages
	webhook.on(WebhookEvent.MESSAGE_RECEIVED, message => {
		console.log("messageReceived = "+ JSON.stringify(message, null, 4))

		var slackPpty = {"user":"U7LM6FDRQ","channel":"DFQFYEMT4"}
		var msg = message.messagePayload.text;

		bot.reply( slackPpty, msg , function(err,res){
			if ( err) console.log("say err in send = " + err);
			else console.log("say res in send = " + JSON.stringify(res));
		});
		// format and send to messaging client...
	});

	// send messages to bot (example)
	app.post('/user/message', (req, res) => {
		// let message = {"text" : "Hi"}; // format according to MessageModel
		console.log("Hit in /user/message");
		var extras = null;
		var message = {
			"userId" : "123",
			"messagePayload": {
				"type": "text",
				"text": "hello"
			},
			"greeting" : "hello"
		};
		webhookUtil.messageToBotWithProperties(channel.url, channel.secret, "1234", message, extras, (err, result) => {
			console.log("errror = " + err);
			console.log("\n\n\nresult = "+result)
		});

		res.send('ok');

		webhook.send(message)
		.then(() => res.send('ok'), e => res.status(400).end());
	});

};
