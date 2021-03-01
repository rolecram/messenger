const util = require('util');
const jsonwebtoken = require('jsonwebtoken');
const jwkToPem = require('jwk-to-pem');
const Axios = require ('axios');
const cognitoPoolId = 'Your Cognito Pool Id';
const cognitoIssuer = `https://cognito-idp.us-east-1.amazonaws.com/${cognitoPoolId}`;

const verifyPromised = util.promisify(jsonwebtoken.verify.bind(jsonwebtoken));
exports.handler = async (event, context)=> {        

    console.log('authorization function with token validation');
    console.log('Evento:', JSON.stringify(event, null, 2));
    console.log('Contexto:', JSON.stringify(context));

    let token = event.queryStringParameters.token;
    let id = 'me';
    try{
        let result = await checkToken(token);
        console.log('token OK');
        id = result.clientId;
        return(generateAllow(id, event.methodArn));
    }catch(e)
    {
        console.error(e.message);
        return(generateDeny(id, event.methodArn));
        //return { statusCode: 403, body: 'Invalid Token' };
    }


    //return { statusCode: 200, body: 'Connected.' };

};

// Help function to generate an IAM policy
let generatePolicy = (principalId, effect, resource) => {
    // Required output:
    let authResponse = {};
     authResponse.principalId = principalId;
    if (effect && resource) {
        let policyDocument = {};
        policyDocument.Version = '2012-10-17'; // default version
        policyDocument.Statement = [];
        let statementOne = {};
        statementOne.Action = 'execute-api:Invoke'; // default action
        statementOne.Effect = effect;
        statementOne.Resource = resource;
        policyDocument.Statement[0] = statementOne;
        authResponse.policyDocument = policyDocument;
     }
    /*
    authResponse.context = {
        "stringKey": "value",
        "numberKey": 1,
        "booleanKey": true
     };
     */
     authResponse.usageIdentifierKey = "IMSCKlbPG848dl7G9ydzq9SEbxPJxUv24J9FEjo9";
     console.log('policy:',JSON.stringify(authResponse));
     
    return authResponse;
 };
     
 let generateAllow = (principalId, resource) => {
    return generatePolicy(principalId, 'Allow', resource);
 };
     
 let generateDeny = (principalId, resource) => {
    return generatePolicy(principalId, 'Deny', resource);
 };



const checkToken = async (token) => {
    console.log('check token');
    const tokenSections = token.split('.');
    if (tokenSections.length < 2) {
        throw new Error('requested token is invalid');
    }
    const headerJSON = Buffer.from(tokenSections[0], 'base64').toString('utf8');
    const header = JSON.parse(headerJSON);
    const keys = await getPublicKeys();
    const key = keys[header.kid];
    if (key === undefined) {
        throw new Error('claim made for unknown kid');    
    }
    const claim = await verifyPromised(token, key.pem);
    const currentSeconds = Math.floor( (new Date()).valueOf() / 1000);
    if (currentSeconds > claim.exp || currentSeconds < claim.auth_time) {
        throw new Error('claim is expired or invalid');
    }
    if (claim.iss !== cognitoIssuer) {
        throw new Error('claim issuer is invalid');
    }
    if (claim.token_use !== 'access') {
        throw new Error('claim use is not access');
    }
    console.log(`claim confirmed for ${claim.username}`);
    let result = {userName: claim.username, clientId: claim.client_id, isValid: true};
    return(result);

};
const getPublicKeys = async () => {
      const url = `${cognitoIssuer}/.well-known/jwks.json`;
      const publicKeys = await Axios.default.get(url);
      console.log('public keys',publicKeys.data);
      let cacheKeys = publicKeys.data.keys.reduce((agg, current) => {
        const pem = jwkToPem(current);
        agg[current.kid] = {instance: current, pem};
        console.log('agg',agg);
        return agg;
      });
      return cacheKeys;
  };
