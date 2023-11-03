const admin = require("firebase-admin");

const serviceAccount = require("../../firebase_config.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const sendNotification = async (data:any) => {
  const payload = {
    notification: {
      title: data.title,
      body: data.message,
    },
    token: data.token,
    data:data?.data,
  };
  admin
    .messaging()
    .send(payload)
    .then((response: any) => {
      console.log("Successfully sent message:", response);
    })
    .catch((error: any) => {
      console.log("Error sending message:", error);
    });
};

module.exports.admin = admin;
