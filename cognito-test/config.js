//all the provided keys are examples, go to Amazon Cognito and get yours

AWSCognito.config.region = 'us-east-1'; //This is required to derive the endpoint

var poolData = {
    UserPoolId : 'pool id', // your user pool id here
    ClientId : 'client id' // your client id here
};

var identityPoolId = 'identity pool id'; //go to AWS Cognito Federated Identites

var userAttributes = ['email', 'phone_number','name']; //the standard attributes you require in AWS Cognito

var MFARequired = true; //do you require your clients to use MFA?