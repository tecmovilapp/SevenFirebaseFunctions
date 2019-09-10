import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

exports.createRide = functions.firestore
    .document('rides/{driverId}')
    .onCreate(async (snap, context) => {
        const data = snap.data();
        if (data) {
            const passengerName = data.passengerName;
            // Notification content
            const payload = {
                notification: {
                    title: 'Solicitud de Unidad',
                    body: `El cliente ${passengerName} ha solicitado una Unidad.`,
                    icon: 'https://goo.gl/Fz9nrQ',
                    sound : 'default'
                }
            }
            // ref to the device collection for the user
            const db = admin.firestore()
            const devicesRef = db.collection('devices');
            let queryRef = devicesRef.where('userType', '==', 'driver');
            // get the user's tokens and send notifications
            //const devices = await devicesRef.get();
            const devices = await queryRef.get();
            const tokens: any = [];
            // send a notification to each device token
            devices.forEach(result => {
                const token = result.data().token;
                tokens.push(token)
            })
            return admin.messaging().sendToDevice(tokens, payload).then((response) => {
                console.log(response);
            }).catch((err) => {
                console.log(err);
            })
        } else {
            console.log("No Data");
            return
        }
    });