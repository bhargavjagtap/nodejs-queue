import express from 'express';
import bodyParser from "body-parser";
import { sendNewEmail } from "./queues/email.queue";
import axios from 'axios';
const app = express();

app.use(bodyParser.json());

// Create a zoom meeting link
app.post('/zoom-meeting', async (req, res) => {
  
  const clientId = 'sRrM5fUIQhy6HcgCsrqOVA';
  const clientSecret = 'd30vznBFfJifUgARW1wq15XQxhqGUShs';
  
  async function getAccessToken() {
    try {
      const response = await axios.post('https://zoom.us/oauth/token', null, {
        params: {
          grant_type: 'account_credentials',
          account_id: 'MyOIzazWTr6GPtn2tcggWg'
        },
        headers: {
          Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
        },
      });
      console.log('response.data.access_token', response.data.access_token);
      
      return response.data.access_token;
    } catch (error) {
      console.error('Error getting access token:', error);
      throw error;
    }
  }
  
    try {
  
      const accessToken = await getAccessToken()
      console.log('accessToken', accessToken);
      
      const email = process.env.ZOOM_HOST_EMAIL_ID;
      let resp = await axios.post(
        'https://api.zoom.us/v2/users/' + 'bhargav.j@crestinfosystems.net' + '/meetings',
        {
          topic: "Discussion about today's Demo",
          type: 2,
          start_time: Date.now(),
          duration: 30,
          timezone: 'India',
          agenda: 'Meet Process',
          settings: {
            // alternative_hosts: host_email,
            waiting_room: false,
            join_before_host: true,
            jbh_time: 5,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );
      console.log("res", resp.data.join_url);
      
      return resp?.data;
    } catch (error) {
      console.log('Zoom Error:', error);
      return error;
    }  
});

app.post('/send-email', async (req, res) => {
    const { from, to, subject, text } = req.body;

    await sendNewEmail({ from, to, subject, text });

    res.json({
      message: 'Email sent'
    });
});

app.listen(3000, () => {
    console.log('Server started at http://localhost:3000');
});
