let poolData = {
    UserPoolId : 'your user pool id here', // 
    ClientId : 'your client id here', // 
    Storage: new AmazonCognitoIdentity.CookieStorage({domain: "messenger.me"})
};
let userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
let congnitoUser = null;

function cognitoLogin(mail, password)
{
    console.log('Try Login...');
    let userData = {
        Username: mail, 
        Pool : userPool,
    }
    cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
    let authenticationData = {Username : mail, Password : password};
    let authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);

    let p = new Promise(async (resolve, reject)=>{    
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: function (result) {
                console.log('Logged in');
                var accessToken = result.getAccessToken().getJwtToken();
                //console.log('access token:' + accessToken);
                resolve(accessToken);

            },
            onFailure: function(err) {
                console.error(err);
                resolve(null);
            }

        });
    });
    return(p);
}
