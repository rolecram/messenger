const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();

exports.getKeys = async (idKey)=>{

    console.log('get keys');
    let response = {
        action: 'getKeys-response',
        success: true,
        payload : {}
    };
    let params = {
        TableName : "messages",
        IndexName : "type-index",
        KeyConditionExpression: "#ntype = :xtype",
        ExpressionAttributeNames: {
            "#ntype": 'type'
        },
        ExpressionAttributeValues: {
            ":xtype": 'key-' + idKey
        }
    };
    let p = new Promise((resolve, reject)=>{
        documentClient.query(params).promise()
        .then(data=>{
            console.log('params', params);
            console.log('data.Items', data.Items)
            response.payload.messages = data.Items;
            resolve(response);
        })
        .catch((e) => {
            console.error('get KEY error ', e);
            response.success = false;
            response.payload.message = e;
            resolve(response);
        });
    });
    return(p);



};

exports.getMessages = async function getMessages(idMe, idContact)
{
    console.log('Get messages', idMe, idContact);

    const response = {
        action:'getMessages',
        success: true,
        payload:{
			idMe: idMe,
			idContact:idContact,
            messages:[]
        }
    };
    let x1 = (idMe > idContact) ? idContact + '-' + idMe : idMe + '-' + idContact;
    if(idContact === 'hotel')
        x1 = 'hotel-' + idMe;
    
    const params = {
        TableName : "messages",
        IndexName : "ft-date-index",
        KeyConditionExpression: "ft = :x1",
        ExpressionAttributeValues: {
            ":x1": x1,
        }
    };

    let p = new Promise((resolve, reject)=>{
        documentClient.query(params).promise()
        .then(data=>{
            data.Items.forEach((m) => {
                //console.log('message', m);
                response.payload.messages.push(m);
            });        
            resolve(response);
        })
        .catch((e) => {
            console.error('Get messages error ', e);
            reject();
        });
    });
    return(p);
    
};
exports.setReadMessage = async (idMessage)=>
{
    console.log('Message Read', idMessage);

    let response = {
        action:'message-read-response',
        success: true,
        payload:{
        }
    };

    let params = {
        TableName:'messages',
        Key:{"idMessage": idMessage},
        UpdateExpression: "set #read = :xread",
        ExpressionAttributeNames:{
            "#read":"read"
        },
        ExpressionAttributeValues:{
            ":xread":true
        }
        //ReturnValues:"UPDATED_NEW"
    };

    console.log("Updating the read Message...");
    await documentClient.update(params).promise()
    .then((result) => {    
        console.log('Update read Message succeeded:', result);
    })
    .catch((e) => {
        console.error('ERROR Update read Message:', e);
        response.success = false;
        response.payload.message = e;
    });
    console.log('end function');

    return(response);
}
