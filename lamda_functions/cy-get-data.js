const AWS = require('aws-sdk');
const dynamodb = new AWS.DynamoDB({region: 'ap-southeast-2', apiVersion: '2012-08-10'});
const cisp = new AWS.CognitoIdentitySereviceProvider({apiVersion: '2016-04-18'});


exports.handler = (event, context, callback) => {
    const accessToken = event.accessToken;

    const type = event.type;
    if (type === 'all'){
        const params = {
            TableName: "compare-yourself"
        };
        dynamodb.scan(params, function(error, data){
            if (error){
                callback(error);
            }else{
                const items = data.Items.map(
                    (dataField) => {
                        return {age: +dataField.Age.N, height: +dataField.Height.N, income: +dataField.Income.N}
                    });
                callback(null, items);

            }
        });
    } else if (type === 'single'){
        const cispParams = {
            "AccessToken": accessToken
        }

        cisp.getUser(cispParams, (err, result) => {
            if (err) {
                console.log(err);
                callback(err)
            } else {
                console.log(result);
                const userId = result.UserAttributes[0].Value;
                const params = {
                  Key:{
                      "UserId": {
                          S: userId
                      }
                  },
                  TableName: "compare-yourself"
                };
                dynamodb.getItem(params, function(error, data){
                    if(error){
                        console.log(error)
                        callback(error)
                    }else{
                        console.log(data);
                        callback(null, [{age: +data.Item.Age.N, height: +data.Item.Height.N, income: +data.Item.Income.N}]);
                    }
                })
                    }

                })


    } else {
        callback(null, 'Hello From Lambda');
    }
};
