const express = require('express');
const amqplib = require('amqplib');

async function connectQueue(){
    try {
        const connection = await amqplib.connect('amqp://localhost');
        const channel = await connection.createChannel();
        await channel.assertQueue("noti-queue");
        channel.consume("noti-queue", (data) => {
            console.log(`${Buffer.from(data.content)}`)
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
