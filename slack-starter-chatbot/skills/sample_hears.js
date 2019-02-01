/*

WHAT IS THIS?

This module demonstrates simple uses of Botkit's `hears` handler functions.

In these examples, Botkit is configured to listen for certain phrases, and then
respond immediately with a single line response.

*/
util = require("util");

const { webhookUtil } = require('@oracle/bots-node-sdk/util');


var interactiveMessage ;
var submit = false;
const channel = require('../webhookConfig.js')

module.exports = function(controller) {

  var expenseItem = {};

  var resetExpense = function(){
    expenseItem['amount']= "223.60 USD";
    expenseItem['merchant']= "Nobu Palo Alto";
    expenseItem['location']= "India";
    expenseItem['description']= "Meals";
    expenseItem['expenseType']= "Meals";
    expenseItem['attendees']= 2;
    expenseItem['date']= "1/26/2019";
  }

  var getFields = function(){
    var fields = [
      {
        "value": expenseItem.date,
        "title": "Date",
        "short": true
      },
      {
        "value": expenseItem.expenseType,
        "title": "Expense Type",
        "short": true
      },
      {
        "value": expenseItem.amount,
        "title": "Amount",
        "short": true
      },
      {
        "value": expenseItem.location,//"`missing`",
        "title": "Location",
        "short": true
      },
      {
        "value": expenseItem.attendees,
        "title": "Attendees",
        "short": true
      }
    ];
    return fields;
  }

  var getRetStr = function(fields){
    var retStr = {
      "text": "I've gathered your expense details:",
      "attachments": [
        {
          "author_name": "",
          "title_link": "",
          "callback_id": "gather_info",
          "text": "",
          "title": "",
          "color": "#2eb886",
          "fields": fields,
        },{
          "fallback": "Are these information right?",
          "title": "Are these information right?",
          "callback_id": "info_verification",
          "color": "#3AA3E3",
          "attachment_type": "default",
          "actions": [
            {
              "style": "primary",
              "type": "button",
              "value": "1",
              "name": "Yes",
              "text": "Yes"
            },
            {
              "style": "default",
              "type": "button",
              "value": "2",
              "name": "No, I want to edit",
              "text": "No, I want to edit"
            }
          ],
        }
      ]
    };
    return retStr;
  }




  /*controller.hears(['^hello$'], 'direct_message,direct_mention', function(bot, message) {
  console.log("message =  " + JSON.stringify(message));
  var obj_str = util.inspect(bot);
  //console.log("\nbot =  " + obj_str);
  var ibcsMessage = {
  "type": "text",
  "text": "hello",
};
var extras =  {
"profile": {
"firstName": 'John',
"lastName": 'Smith',
"age": 22,
"clientType": 'Alexa'
},
"greetingSLack" : "hello"
};
webhookUtil.messageToBotWithProperties(channel.url, channel.secret, message.user, ibcsMessage, extras, (err, result) => {
console.log("errror = " + err);
console.log("\n\n\nresult = "+result)
});

bot.reply(message, "Hi there, you're on workspace: " + message.team)
});
*/


controller.on('file_share', function(bot, message) {
  resetExpense();
  console.log("file_share");
  var fields = getFields();
  var retStr = getRetStr(fields);

  setTimeout(function() {
    bot.reply(message, retStr);
  }, 1000);


});


controller.on(['direct_message','mention','direct_mention'],function(bot,message) {
  console.log("hit in direct message");
  console.log("direct_message \n "+JSON.stringify(message)+"\n"+submit);
  if(submit == true){

    var fields = getFields();
    var justField = {
      "value": message.text,
      "title": "Justification",
      "short": true
    }
    fields.push(justField);
    var retStr = getRetStr(fields);
    retStr.text = ":white-green-heavy-check-mark: Your expense has been submitted for processing." //:heavy_check_mark:
    retStr.attachments.splice(1, 1);
    bot.reply(message, retStr);
    submit = false;
  }
  else bot.reply(message, "Please upload a receipt.");
});

controller.on('dialog_submission', function(bot, message) {
  //console.log("dialog submission \n "+JSON.stringify(message));
  var msgStr="";
  if( expenseItem['amount'] != message.submission.amount){
    msgStr = "Expense amount has been updated to "+message.submission.amount+"\n";
    expenseItem['amount'] = message.submission.amount
  }

  //if( expenseItem['merchant'] != message.submission.merchant)
  //msgStr += "Expense merchant has been updated to "+message.submission.merchant+"\n"
  if( expenseItem['location'] != message.submission.location){
    msgStr += "Expense location has been updated to "+message.submission.location+"\n"
    expenseItem['location'] = message.submission.location
  }

  //if( expenseItem['description'] != message.submission.description)
  //msgStr += "Expense description has been updated to "+message.submission.description+"\n"
  if( expenseItem['expenseType'] != message.submission.expenseType){
    msgStr += "Expense expense type has been updated to "+message.submission.expenseType+"\n"
    expenseItem['expenseType'] = message.submission.expenseType
  }

  if( expenseItem['attendees'] != message.submission.attendees){
    msgStr += "Expense attendees has been updated to :"+message.submission.attendees+"\n"
    expenseItem['attendees'] = message.submission.attendees
  }

  if(expenseItem['date'] != message.submission.date){
    msgStr += "Expense date has been updated to :"+message.submission.date+"\n"
    expenseItem['date'] = message.submission.date
  }
  var fields = getFields();
  var tempStr = getRetStr(fields);

  tempStr.text = "Your modified expense details:"

  bot.replyInteractive(interactiveMessage,tempStr);
  bot.dialogOk();
});

controller.on('interactive_message_callback', function(bot, message) {
  interactiveMessage = message;
  console.log('Callback text' + JSON.stringify(message));
  if(message.callback_id == "info_verification"){
    if(message.actions[0].value == 1){
      console.log("Expense created successfully")

      var fields = getFields();
      var retStr =  getRetStr(fields);
      retStr.text = "Expense details:";
      retStr.attachments[0].color = "##D3D3D3";
      retStr.attachments[1] = {
        "pretext": "A violation was detected for this expense item:",
        "text": ":warning:You should use corporate card.",
        "title": "",
        "color": "#B22222"
      }
      var askJust = {
        "pretext": "*Please type the justification.*",
        "text": "",
        "title": "",
        "color": "#3AA3E3"
      }
      retStr.attachments.push(askJust);
      submit = true;

      bot.replyInteractive(message,retStr);
    }
    else if(message.actions[0].value == 2){
      console.log("dialogs")

      var dialog = bot.createDialog(
        'Edit expense details',
        'callback_id',
        'Save'
      )
      .addText('Date','date',expenseItem.date)
      .addText('Amount','amount',expenseItem.amount)
      .addSelect('Expense Type','expenseType',expenseItem.expenseType,[{label:'Meals',value:'Meals'},{label:'Taxi',value:'Taxi'},{label:'Parking',value:'Parking'},{label:'Accomodation',value:'Accomodation'}])
      .addSelect('Location','location',expenseItem.location,[{label:'United States',value:'United States'},{label:'India',value:'India'},{label:'Canada',value:'Canada'},{label:'United Kingdom',value:'United Kingdom'}])
      .addText('Attendees','attendees',expenseItem.attendees,{placeholder: expenseItem.attendees})
      ;

      bot.replyWithDialog(message, dialog.asObject());

    }

  }


});

};
