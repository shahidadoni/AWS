//#### 1. Configure aws sqs standard
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

var AWS = require("aws-sdk");
AWS.config.update({ region: process.env.REGION });
var sqs = new AWS.SQS({ apiVersion: "2012-11-05" });
var queueURL = process.env.SQSQueueUrl;

// --> select queue name

// --> select region for server as mumbai

// --> define queue attributes:
//     --> default visibility timeout === when consumer picks up the queue, if he wasn't able to process the message in the queue
//                                        then the message will be available for the other consumers after the visibility timeout is reached.
//     --> message retention period === it is the time for which the message will be available or persistent in the queue if it is not deleted.
//     --> maximum message size === the maximum size given by AWS is 256kb and if you think that it can be less in your case
//                                  then you can reduce it in the range from 1kb to 256kb.
//                                  It is recommended that you keep the default value as 256kb as it is.
//     --> Delivery Delay === it is the time after which the message is visible/available in the queue.
//     --> Receive message wait time === it is the time for receive call will wait till the message is available in the queue before returning a empty Response.

// --> Dead Letter queue settings === if the message was not processed by the consumer for a given number of times due to some reason,
//                                    then the message will be pushed in dead letter queue.
//                                    So, it is essential for the consumer to delete the message once it has been received after some time.

//#### 2. Function to push message to the queue.

var params = {
  DelaySeconds: 10,
  MessageAttributes: {
    Title: {
      DataType: "String",
      StringValue: "Rapyder",
    },
  },
  MessageBody: "Hello, Rapyder!!!",

  QueueUrl: queueURL,
};

sqs.sendMessage(params, function (err, data) {
  if (err) {
    console.log("Error", err);
  } else {
    console.log("Success", data.MessageId);
  }
});

//#### 3. Function to get message from the queue

var params = {
  AttributeNames: ["SentTimestamp"],
  MaxNumberOfMessages: 10,
  MessageAttributeNames: ["All"],
  QueueUrl: queueURL,
  VisibilityTimeout: 20,
  WaitTimeSeconds: 0,
};

sqs.receiveMessage(params, function (err, data) {
  console.log("data:" + JSON.stringify(data));
  if (err) {
    console.log("Receive Error", err);
  } else if (data.Messages) {
    console.log("Number of messages received:" + data.Messages.length);
    console.log("Received Message:" + JSON.stringify(data.Messages[0]));
    console.log("Message Body:" + data.Messages[0].Body);
    var deleteParams = {
      QueueUrl: queueURL,
      ReceiptHandle: data.Messages[0].ReceiptHandle,
    };
    sqs.deleteMessage(deleteParams, function (err, data) {
      // delete message after it has been processed for your business logic
      if (err) {
        console.log("Delete Error", err);
      } else {
        console.log("Message Deleted", data);
      }
    });
  } else {
    console.log("No Messages Received");
  }
});
