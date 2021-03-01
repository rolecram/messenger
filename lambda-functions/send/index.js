const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();

exports.sendMessage = async function sendMessage(payload, endpoint)
{
    let promises = [];
    let date = (new Date()).toISOString();
    var response = {
        action:'sendMessage',
        success: true,
        payload:{
            idMessage: payload.idMessage,
            idLocal: payload.idLocal,
            from: payload.from,
            to: payload.to,
            priority: payload.priority,
            date: date
        }
    };
    payload.date = date;
    promises.push(saveLastMessage({from:payload.from,to:payload.to,message:payload.message,d:'sent',date:date,'content':payload.content,'type': payload.type}));
    promises.push(saveLastMessage({from:payload.to,to:payload.from,message:payload.message,d:'receive',date:date,'content':payload.content,'type': payload.type}));


    const contact = (await documentClient.get({TableName: 'contacts', Key: {'idContact': payload.to}}).promise()).Item;
    if(contact === undefined)
    {
        response.payload.message = 'Contact not found!';
        response.success = false;
        return(response);
    }
    if(contact.idConn === '#disconnect')
    {
        response.payload.sent = false;
        payload.sent = false;
    }
    else
    {
        
        const apigwManagementApi = new AWS.ApiGatewayManagementApi({
            endpoint: endpoint
        });
        let data = {
            action:'receiveMessage',
            success:true,
            payload:{
                from: payload.from,
                to: payload.to,
                idMessage: payload.idMessage,
                content: payload.content,
                type: payload.type,
                message: payload.message,
                priority: payload.priority,
                idConn: payload.idConn,
                date: date
            }
        };
        if(payload.title)
            data.payload.title = payload.title;
            
        await apigwManagementApi.postToConnection({ ConnectionId: contact.idConn, Data: JSON.stringify(data) }).promise()
        .then(r =>
            { 
                response.payload.sent=true;
                response.payload.idConn = contact.idConn;
                payload.sent = true;
                console.log('Success Sent');
            }
        )
        .catch(async (e)=>
            {
                response.payload.sent = false;
                payload.sent = false;
                if (e.statusCode === 410) {
                    console.log('Found stale connection');
                    response.message = 'Found stale connection';
                    await clearConnection();
                } else {
                    response.success = false;
                    response.message = e;
                }

            }
        );
    }
    promises.push(putMessage(payload));

    await Promise.all(promises);
    return(response);
};

async function clearConnection(idContact)
{
    let p = new Promise((resolve, reject)=>{
        var params = {
            TableName:'contacts',
            Key:{"idContact": idContact},
            UpdateExpression: "set idConn = :xidConn",
            ExpressionAttributeValues:{
                ":xidConn":'#disconnect'
            },
            ReturnValues:"UPDATED_NEW"
        };
        console.log("Updating the item...");
        documentClient.update(params).promise()
        .then((result) => {    
            console.log('Clear connection succeeded:', result);
            resolve(result);
        })
        .catch((e) => {
            console.log('error update item', e);
            reject();
        });
    });
    return(p);

}
async function clearConnectionById(idConn)
{
    console.log('event:' + JSON.stringify(event));
    //var p;
    var params = {
        TableName : "contacts",
        IndexName : "idConn-index",
        KeyConditionExpression: "idConn = :x_idConn",
        ExpressionAttributeValues: {
            ":x_idConn": event.requestContext.connectionId
        }
    };
    console.log('query');
    
    await documentClient.query(params).promise()
    .then(data=>{
        console.log(" -", data.Items[0].idContact + ": " + data.Items[0].idConn);
        return(data.Items[0].idContact);
    })
    .then(async (idContact)=>{
        console.log('next then ready to clear connection. idContact', idContact);
        await clearConnection(idContact);
    })
    .catch(e=>{console.error(e)});
    
    //Promise.all([p]);
}

async function putMessage(payload)
{
    console.log('put message', payload);
    const ft = (payload.from > payload.to) ? payload.to + "-" + payload.from : payload.from + "-" + payload.to;
    const params = {
        TableName : 'messages',
        Item: {
            "idMessage": payload.idMessage,
            "from":payload.from,
            "to": payload.to,
            "message": payload.message,
            "content": payload.content,
            "type" : payload.type,
            "priority": payload.priority,
            "read" : false,
            "sent" : payload.sent,
            "ft" : ft,
            "date" : payload.date
        }
    };
    if(payload.title)
        params.Item.title = payload.title;

    let p = new Promise((resolve, reject)=>{
        documentClient.put(params).promise()
        .then((result) => {    
            console.log('put message succeeded:', result);
            resolve(result);
        })
        .catch((e) => {
            console.error('put message error ', e);
            reject();
        });

    });
    return(p);
  
}
async function saveLastMessage(data)
{
    console.log('Save Last message', data);
    let p = new Promise((resolve, reject)=>{
        documentClient.get({TableName: 'contacts', Key: {'idContact': data.from}}).promise()
        .then((result) => {    
            console.log('get last message succeeded:', result);
            if(Object.keys(result).length === 0 && result.constructor === Object)
                return(undefined);
            let contact = result.Item.contacts.find((value, index)=>{
                if(value.id === data.to) {
                    //result.Item.contacts[index].lastMessage = data.message;
                    result.Item.contacts[index].message = {message:data.message,date:data.date,d:data.d,content:data.content,type:data.type};
                }
                return value.id === data.to;
            });
            console.log('Contact to MODIFY:', contact);
            return((contact === undefined) ? undefined : result.Item);
        })
        .then(async (result)=>{
            console.log('THEN RESULT', result);
            if(result !== undefined)
            {
                const params = {
                    TableName:'contacts',
                    Key:{"idContact": result.idContact},
                    UpdateExpression: "set contacts = :xcontacts",
                    ExpressionAttributeValues:{
                        ":xcontacts": result.contacts
                    },
                    ReturnValues:"UPDATED_NEW"
                };
                console.log("Updating the item...");
                await documentClient.update(params).promise()
                .then((result) => {    
                    console.log('Update CONTACTS succeeded:', result);
                    resolve(result);
                })
                .catch((e) => {
                    console.error('error update item', e);
                    reject();
                });
            }
            else
            {
                resolve('contact not found to put last message');
            }
        })
        .catch((e) => {
            console.error('get last message error', e);
            reject();
        });

    });
    return(p);
  
}
