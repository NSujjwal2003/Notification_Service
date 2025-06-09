const express = require('express');
const amqplib = require('amqplib');
const { EmailService } = require('./services');
async function connectQueue(){
    try {
        const connection = await amqplib.connect('amqp://localhost');
        const channel = await connection.createChannel();
        await channel.assertQueue("noti-queue");
        channel.consume("noti-queue", async (data) => {
            //const object = JSON.parse(`${Buffer.from(data.content)}`);
            const object = JSON.parse(data.content.toString());
            //await EmailService.sendEmail("travisbickle218@gmail.com", object.recepientEmail, object.subject, object.text);
            await EmailService.sendEmail(ServerConfig.GMAIL_EMAIL, object.recepientEmail, object.subject, object.text);
            channel.ack(data);
        })
    } catch (error) {
        console.log(error);
    }    
}

const { ServerConfig } = require('./config');
const apiRoutes = require('./routes');

const mailsender = require('./config/email-config');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', apiRoutes);

app.listen(ServerConfig.PORT, async () => {
    console.log(`Successfully started the server on PORT : ${ServerConfig.PORT}`);

    // try {
    //     const response = await mailsender.sendMail({
    //     from: ServerConfig.GMAIL_EMAIL,
    //     to: 'uns.singh03@gmail.com', 
    //     subject: 'is this service working?',
    //     text: 'If you are reading this, then the service is working fine.',
    // });
    // console.log(response);
    // } catch (error) {
    //     console.log(error);
    // }

    await connectQueue();
});
