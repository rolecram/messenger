//Messenger Main Process

const connection = require('connection');
const send = require('send');
const messages = require('messages');
const notify = require('notify');
const contacts = require('contacts');

exports.handler = async (event, context) => {

    console.log('event:' + JSON.stringify(event));
    
    const request = event.requestContext;
    const body = JSON.parse(event.body);
    let response = {
        action:body.action,
        success: false,
        payload:{
            message: 'Command Syntax Error',
            idConnection:request.connectionId,
        }

    }
	let endpoint = event.requestContext.domainName + '/' + event.requestContext.stage;
    switch(body.action)
    {
        case 'connect':
            await connection.connect(body.payload.from,request.connectionId).then(r => {response = r;});
            break;
        case 'disconnect':
            await connection.disconnect(body.payload.from).then(r => {response = r;});
            break;
        case 'sendMessage':
            body.payload.idMessage = request.messageId;
            await send.sendMessage(body.payload, endpoint).then(r => {response = r;});
            break;
        case 'getMessages':
            await messages.getMessages(body.payload.idMe, body.payload.idContact).then(r=>{response = r;});
            break;
		case 'typing':
			await connection.typing(body.payload,endpoint).then(r => {response = r});
            break;
        case 'set-read-message':
            await messages.setReadMessage(body.payload.idMessage).then(r=>{response = r;});
            break;
        case 'read-message':
            //body.payload.idMessage = request.messageId;
            //await send.sendMessage(body.payload, endpoint).then(r => {response = r;});
            break;
        case 'notify':
            console.log('NOTIFY');
            await notify.sendNotification(body.payload, endpoint).then(r=>{response = r;});
            break;
        case 'addContactToContact':
            console.log('ADD CONTACT TO CONTACT');
            await contacts.addContactToContact(body.payload).then(r=>{response = r;});
            break;
        case 'getContactsByComunity':
            console.log('GET CONTACTS BY COMUNITY');
            await contacts.getContactsByComunity(body.payload).then(r=>{response = r;});
            break;
        case 'addContact':
            console.log('ADD CONTACT');
            await contacts.addContact(body.payload).then(r=>{response = r;});
            break;
        case 'sendContact':
            await contacts.sendContact(body.payload, endpoint).then(r=>{response = r;});
            break;
        case 'addContactBothSides':
            await contacts.addContactBothSides(body.payload, endpoint).then(r=>{response = r;});
            break;
        case 'removeContactFromContact':
            await contacts.removeContactFromContact(body.payload).then(r=>{response = r;});
            break;
        case 'getKeys':
            await messages.getKeys(body.payload.idKey).then(r=>{response = r;});
            break;
        case 'ping':
            response = {success:true, action:'pong'};
            break;
    }
    return { statusCode: 200, body: JSON.stringify(response) };    

};
