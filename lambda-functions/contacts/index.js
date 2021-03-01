const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();


exports.addContactBothSides = async (payload, endpoint)=>
{
    let response = {
        action: 'addBothContacts-response',
        success: false,
        payload:{

        }
    };
    const apigwManagementApi = new AWS.ApiGatewayManagementApi({
        endpoint: endpoint
    });
    let p = new Promise(async (resolve, reject)=>{
        let c1 = await getContact(payload.from);
        c1 = c1.Item;
        console.log('c1', c1);
        let c2 = await getContact(payload.to);
        c2 = c2.Item;
        console.log('c2', c2);
        if(!hasContactId(c1, c2.idContact))
        {
            c1.contacts.push(getContactObject(c2));
            await updateContact(c1);
            await sendNewContact(apigwManagementApi,c1.idConn, getContactObject(c2));
        }
        if(!hasContactId(c2, c1.idContact))
        {
            c2.contacts.push(getContactObject(c1));
            await updateContact(c2);
            await sendNewContact(apigwManagementApi,c2.idConn, getContactObject(c1));

        }
        response.success = true;
        resolve(response);
    });
    return(p);

};
async function sendNewContact(gateway, idConn, c)
{
    if(idConn === '#disconnect')
        return;
    let data = {
        action:'send-contact',
        success : true,
        payload:c
    };

    await gateway.postToConnection({ ConnectionId: idConn, Data: JSON.stringify(data) }).promise()
    .then(r =>
        { 
            console.log('Success Sent');
        }
    )
    .catch(async (e)=>
        {
            console.error('Fail Sent');
        }
    );

}
async function updateContact(c)
{
    console.log('update contact', c);
    let p = new Promise(async (resolve, reject)=>{
        const params = {
            TableName:'contacts',
            Key:{"idContact": c.idContact},
            UpdateExpression: "set contacts = :xcontacts",
            ExpressionAttributeValues:{
                ":xcontacts": c.contacts
            },
            ReturnValues:"UPDATED_NEW"
        };
        await documentClient.update(params).promise()
        .then((result) => {    
            console.log('Update CONTACT succeeded:', result);
            resolve(result);
        })
        .catch((e) => {
            console.error('error update item', e);
            reject();
        });

    });
    return(p);
}

function hasContactId(c, id)
{
    for(var i=0 ; i < c.contacts.length ; i++)
        if(c.contacts[i].id === id)
            return(true);
    return(false);
}
function getContactObject(c)
{
    let contact = {
        'id': c.idContact,
        'image': c.image,
        'name' : c.name,
        'role' : c.role,
        'comunity' : c.comunity,
        'friendly' : c.friendly
    };
    if(c.floor) contact.floor = c.floor;
    if(c.room) contact.room = c.room;
    return(contact);
}


exports.removeContactFromContact = async (payload)=>
{
    console.log('remove contact from contact',payload);
    let response = {
        action: 'remove-contact-response',
        success:false,
        payload:{
        }
    };
    
    await getContact(payload.from)
    .then(r =>{
        //Armar el Contacto source
        for(var i = 0; i < r.Item.contacts.length ; i++)
        {
            if(r.Item.contacts[i].id === payload.to)
            {
                r.Item.contacts.splice(i,1);
                response.success = true;
                response.payload.from = payload.from;
                response.payload.to = payload.to;
                break;
            }
        }
        console.log('contact to update', r);
        return(r);
    })
    .then(async r => {
        await updateContacts(payload.from, r.Item.contacts);
        console.log('update contact', r);
        return;
    })
    .catch(e => {
        response.success = false;
        response.payload.message = e;
    });
    return(response);

};

exports.addContactToContact = async (payload)=>
{
    let response = {
        action: 'addcontact-response',
        success:true,
        payload:{

        }
    };
    let contact = {};
    
    await getContact(payload.from)
    .then(r =>{
        //Armar el Contacto source
        console.log('source contact', r);
        contact = {
            'id': r.Item.idContact,
            'image': r.Item.image,
            'name' : r.Item.name,
            'role' : r.Item.role,
            'comunity' : r.Item.comunity,
            'friendly' : r.Item.friendly
        };
        if(r.Item.floor) contact.floor = r.Item.floor;
        if(r.Item.room) contact.room = r.Item.room;
        return;
    })
    .then(async () => {
        console.log('get contact',payload.to);
        let r = await getContact(payload.to);
        return(r);
    })
    .then(async r => {
        console.log('contact to add', contact);
        console.log('destination contact', r);
        r.Item.contacts.push(contact);
        await updateContacts(payload.to, r.Item.contacts);
        response.payload = contact;
        console.log('update contact', r);
        return;
    })
    .catch(e => {
        response.success = false;
        response.payload.message = e;
    });
    console.log('end contacts');

    return(response);
};

exports.sendContact = async (payload, endpoint)=>
{
    const apigwManagementApi = new AWS.ApiGatewayManagementApi({
        endpoint: endpoint
    });
    let response = {
        action: 'sendContact-response',
        success: true,
        payload:{}
    };
    let data = {
        action:'send-contact',
        success : true,
        payload:{}
    };
    console.log('send contact payload', payload);
    await exports.addContactToContact(payload)
    .then(async r=>{
        if(r.success)
        {
            console.log('add ctc success', r.payload);
            data.payload = r.payload;
            await apigwManagementApi.postToConnection({ ConnectionId: payload.idConn, Data: JSON.stringify(data) }).promise()
            .then(r =>
                { 
                    response.payload.sent=true;
                    console.log('Success Sent');
                }
            )
            .catch(async (e)=>
                {
                    response.payload.sent = false;
                    console.log('Fail Sent');
                }
            );
    
        }
    })
    .catch(e=>{
        response.success = false;
    });
    return(response);
};

async function getContact(id)
{
    let p = new Promise((resolve, reject)=>{
        documentClient.get({TableName: 'contacts', Key: {'idContact': id}}).promise()
        .then((result) => {
            //console.log('Contacts: get contact success', result);
            resolve(result);
        })
        .catch((e) => {
            console.error('Contacts: get contact error', e);
            reject();
        });

    });
    return(p);
}
async function updateContacts(idContact, contacts)
{
    console.log('update contacts', contacts);
    let p = new Promise(async (resolve, reject)=>{
        const params = {
            TableName:'contacts',
            Key:{"idContact": idContact},
            UpdateExpression: "set contacts = :xcontacts",
            ExpressionAttributeValues:{
                ":xcontacts": contacts
            },
            ReturnValues:"UPDATED_NEW"
        };
        await documentClient.update(params).promise()
        .then((result) => {    
            console.log('Update CONTACTS succeeded:', result);
            resolve(result);
        })
        .catch((e) => {
            console.error('error update item', e);
            reject();
        });

    });
    return(p);
}
exports.getContactsByComunity = async (payload)=>
{
    let params = {
        TableName : "contacts",
        IndexName : "comunity-index",
        KeyConditionExpression: "comunity = :xcomunity",
        ExpressionAttributeValues: {
            ":xcomunity": payload.comunity
        }
    };
    let response = {
        success: true,
        payload:{}
    };

    console.log('query get comunity');
    
    await documentClient.query(params).promise()
    .then(data=>{
        console.log('items', data.Items);
        response.payload.contacts = data.Items;
    })
    .catch(e=>{
        response.success = false;
        response.payload.message = e;
        console.error(e);
    });
    return(response);
};
exports.addContact = async (payload)=>
{
    const params = {
        TableName : 'contacts',
        Item: payload
    };
    let response = {
        action:'add-contact-response',
        success:true,
        payload:{}
    };
    let p = new Promise((resolve, reject)=>{
        documentClient.put(params).promise()
        .then((result) => {    
            console.log('add contact succeeded:', result);
            resolve(response);
        })
        .catch((e) => {
            console.error('add contact error ', e);
            response.success = false;
            response.payload.message = e;
            reject(response);
        });

    });
    return(p);
};
