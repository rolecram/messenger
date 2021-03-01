const AWS = require('aws-sdk');
//const send = require('send');

const documentClient = new AWS.DynamoDB.DocumentClient();

exports.sendNotification = async (payload, endpoint)=>
{
    payload.date = (new Date()).toISOString();
    console.log('send notification', payload);

    let response = {
        action: 'notify-response',
        success:true,
        payload:{

        }
    };
    let promises = [];
    //let id = '' + (new Date()).getTime();
    //const ft = (payload.from > payload.to) ? payload.to + "-" + payload.from : payload.from + "-" + payload.to;


    switch(payload.to.target)
    {
        case 'floor':
            console.log('get floor');
            await getByFloor(payload.to.value)
                .then(async (contacts)=>{
                    console.log('contacts',contacts);
                    payload.contacts = contacts;
                    await sendNotifyToContacts(payload, endpoint)
                    .then(data =>{
                        //response.payload.contacts = contacts;
                        promises.push(saveMessages(payload));

                    })
                    .catch(e =>{response.success = false;response.payload.message=e;});

                })
                .catch((e)=>{
                    response.success = false;
                    response.payload.message = e;
                }
            );
            break;
        case 'room':
            console.log('NOTIFY GUEST', payload.to.value);
            await getByRoom(payload.to.value)
                .then(async (contacts)=>{
                    console.log('contacts',contacts);
                    payload.contacts = contacts;
                    await sendNotifyToContacts(payload, endpoint)
                    .then(data =>{
                        //response.payload.contacts = contacts;
                        promises.push(saveMessages(payload));

                    })
                    .catch(e =>{response.success = false;response.payload.message=e;});

                })
                .catch((e)=>{
                    response.success = false;
                    response.payload.message = e;
                }
            );
            break;
        case 'comunity':
            console.log('NOTIFY COMMUNITY', payload.to.value);
            await getByComunity(payload.to.value)
                .then(async (contacts)=>{
                    console.log('contacts',contacts);
                    payload.contacts = contacts;
                    await sendNotifyToContacts(payload, endpoint)
                    .then(data =>{
                        //response.payload.contacts = contacts;
                        promises.push(saveMessages(payload));

                    })
                    .catch(e =>{response.success = false;response.payload.message=e;});

                })
                .catch((e)=>{
                    response.success = false;
                    response.payload.message = e;
                }
            );
            break;
        case 'guest':
            console.log('NOTIFY GUEST', payload.to.value);
            await(getContact(payload.to.value))
            .then(async (contacts)=>{
                console.log('contacts',contacts);
                payload.contacts = contacts;
                await sendNotifyToContacts(payload, endpoint)
                .then(data =>{
                    //response.payload.contacts = contacts;
                    promises.push(saveMessages(payload));

                })
                .catch(e =>{response.success = false;response.payload.message=e;});

            })
            .catch((e)=>{
                response.success = false;
                response.payload.message = e;
            }
            );
            break;
    }
    await Promise.all(promises);
    return(response);
};
    //async function saveMessage(payload)
    //{
    //    send.putMessage(payload);
    //}

async function sendNotifyToContacts(payload, endpoint)
{
    let data = {
        action: 'notify',
        success: true,
        payload: {
            from: payload.from,
            date : payload.date,
            message: payload.message,
            priority: payload.priority,
            severity: payload.severity,
            reply: false,
            type: payload.type,
            content: payload.content,
            wait: payload.wait,
            popup: payload.popup

        }
    };
    if(payload.title)
        data.payload.title = payload.title;

    const apigwManagementApi = new AWS.ApiGatewayManagementApi({
        endpoint: endpoint
    });

    let p = new Promise(async (resolve, reject)=>{

        for(var i=0 ; i < payload.contacts.length; i++)
        {
            console.log('begin to send');
            payload.contacts[i].sent = false;
            if(payload.contacts[i].idConn !== '#disconnect')
            {
                data.to = payload.contacts[i].idContact;
                await apigwManagementApi.postToConnection({ ConnectionId: payload.contacts[i].idConn, Data: JSON.stringify(data)}).promise()
                .then(r =>
                    { 
                        payload.contacts[i].sent = true;
                        console.log('Notify Success Sent', payload.contacts[i]);
                    }
                )
                .catch(async (e)=>
                    {
                        console.log('Notify Fail Sent', payload.contacts[i]);
                    }
                );
            }
        }
        resolve(payload.contacts);
    });
    return(p);

}
async function saveMessages(payload)
{

    console.log('notify save message', payload);
    const params = {
        TableName : 'messages',
        Item: {
            //"idMessage": payload.idMessage,
            "from":payload.from,
            //"to": payload.to,
            "message": payload.message,
            "content": payload.content,
            "type" : payload.type,
            "priority": payload.priority,
            "read" : false,
            //"sent" : payload.sent,
            //"ft" : ft,
            "date" : payload.date
        }
    };
    if(payload.title)
        params.Item.title = payload.title;

    let p = new Promise(async (resolve, reject)=>{
        for(var i=0 ; i < payload.contacts.length; i++)
        {
            params.Item.idMessage = '' + (new Date()).getTime();
            params.Item.to = payload.contacts[i].idContact;
            params.Item.ft = 'hotel-' + params.Item.to;
            params.Item.sent = payload.contacts[i].sent;

            await documentClient.put(params).promise()
            .then((result) => {    
                console.log('save message succeeded:', result);
            })
            .catch((e) => {
                console.error('save message error ', e);
            });
    
        }
        resolve(true);

    });
    return(p);

}
async function getByFloor(value)
{
    console.log('query get by Floor');
    let params = {
        TableName : "contacts",
        IndexName : "floor-index",
        KeyConditionExpression: "floor = :xfloor",
        ExpressionAttributeValues: {
            ":xfloor": '' + value
        }
    };
    let p = new Promise((resolve, reject)=>{
        documentClient.query(params).promise()
        .then(data=>{
            //console.log('get contacts',data.Items);
            resolve(data.Items);
        })
        .catch((e) => {
            console.error('get contacts error ', e);
            reject();
        });
    });
    return(p);
}
async function getByRoom(value)
{
    console.log('query get by Room');
    let params = {
        TableName : "contacts",
        IndexName : "room-index",
        KeyConditionExpression: "room = :xroom",
        ExpressionAttributeValues: {
            ":xroom": '' + value
        }
    };
    let p = new Promise((resolve, reject)=>{
        documentClient.query(params).promise()
        .then(data=>{
            //console.log('get contacts',data.Items);
            resolve(data.Items);
        })
        .catch((e) => {
            console.error('get contacts error ', e);
            reject();
        });
    });
    return(p);
}
async function getByComunity(value)
{
    console.log('query get by Comunity');
    let params = {
        TableName : "contacts",
        IndexName : "comunity-index",
        KeyConditionExpression: "comunity = :xcomunity",
        ExpressionAttributeValues: {
            ":xcomunity": '' + value
        }
    };
    let p = new Promise((resolve, reject)=>{
        documentClient.query(params).promise()
        .then(data=>{
            //console.log('get contacts',data.Items);
            resolve(data.Items);
        })
        .catch((e) => {
            console.error('get contacts error ', e);
            reject();
        });
    });
    return(p);
}
async function getContact(id)
{
    let p = new Promise((resolve, reject)=>{
        documentClient.get({TableName: 'contacts', Key: {'idContact': id}}).promise()
        .then((data) => {
            //console.log('Contacts: get contact success', result);
            let contacts = [];
            contacts.push(data.Item);
            resolve(contacts);
        })
        .catch((e) => {
            console.error('Contacts: get contact error', e);
            reject();
        });

    });
    return(p);
}
