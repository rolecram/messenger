const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});
const documentClient = new AWS.DynamoDB.DocumentClient();


exports.connect = async function connect(idContact, idConnection)
{

    let response = {
        action:'connect',
        success: true,
        payload:{
            contact:undefined
        }
    };
    
    response.payload.contact = (await documentClient.get({TableName: 'contacts', Key: {'idContact': idContact}}).promise()).Item;
    if(response.payload.contact === undefined)
    {
        response.payload.message = 'Contact not found!';
        response.success = false;
        return(response);
    }
    response.payload.contact.idConn = idConnection;
    let params = {
        TableName:'contacts',
        Key:{"idContact": idContact},
        UpdateExpression: "set idConn = :xidConn",
        ExpressionAttributeValues:{
            ":xidConn":idConnection
        },
        ReturnValues:"UPDATED_NEW"
    };
    console.log("Updating the item...");
    await documentClient.update(params).promise()
    .then((result) => {    
        console.log('UpdateItem succeeded:', result);
    })
    .catch((e) => {
        response.success = false;
        response.payload.message = e;
    });
    console.log('end function');
    
    return(response);
};

exports.disconnect =  async function disconnect(idContact)
{
    let response = {
        action:'disconnect',
        success: true,
        payload:{
        }
    };

    response.payload.contact = (await documentClient.get({TableName: 'contacts', Key: {'idContact': idContact}}).promise()).Item;
    if(response.payload.contact === undefined)
    {
        response.payload.message = 'Contact not found!';
        response.success = false;
        return(response);
    }

    let params = {
        TableName:'contacts',
        Key:{"idContact": idContact},
        UpdateExpression: "set idConn = :xidConn",
        ExpressionAttributeValues:{
            ":xidConn":"#disconnect"
        },
        ReturnValues:"UPDATED_NEW"
    };

    console.log("Updating the item...");
    await documentClient.update(params).promise()
    .then((result) => {    
        console.log('UpdateItem succeeded:', result);
    })
    .catch((e) => {
        response.success = false;
        response.payload.message = e;
    });
    console.log('end function');

    return(response);


};
exports.typing = async function(payload, endpoint)
{
    let response = {
        action:'typing-response',
        payload:{
            from: payload.from,
            to: payload.to
        }
    };
    let data = {
        action: 'typing',
        success: true,
        payload:{
            from : payload.from,
            to : payload.to
        }
    };
    const apigwManagementApi = new AWS.ApiGatewayManagementApi({
        endpoint: endpoint
    });
    
    await apigwManagementApi.postToConnection({ ConnectionId: payload.idConn, Data: JSON.stringify(data) }).promise()
    .then(r =>
        { 
            response.success = true;
            response.payload.online = true;
            console.log('Typing Success');
        }
    )
    .catch(async (e)=>
        {
            response.success = true;
            if (e.statusCode === 410) {
                console.log('Typing Found stale connection');
                response.payload.online = false;
            } else {
                response.success = false;
                response.payload.message = e;
                console.log('Typing Error', e);
            }

        }
    );
    return(response);
}