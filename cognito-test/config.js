//all the provided keys are examples, go to Amazon Cognito and get yours

AWSCognito.config.region = 'us-east-1'; //This is required to derive the endpoint

var poolData = {
    UserPoolId : 'us-east-1_xj2XvSYuW', // your user pool id here
    ClientId : '3lu533a32cvh6jjlot047cflk6' // your client id here
};

var identityPoolId = 'eu-west-1:928sjpf-283osj3-293us3js-82372-730s'; //go to AWS Cognito Federated Identites

var userAttributes = ['email', 'phone_number','name']; //the standard attributes you require in AWS Cognito

var MFARequired = true; //do you require your clients to use MFA?