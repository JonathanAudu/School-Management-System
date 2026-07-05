const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function run() {
  try {
    fs.writeFileSync('test.txt', 'dummy content');
    const form = new FormData();
    form.append('_method', 'PUT');
    form.append('title', 'Testing upload');
    form.append('image', fs.createReadStream('test.txt'));
    
    // Attempt to register a user to get token
    await axios.post('http://localhost:8000/api/register', {
      name: 'Admin3', email: 'admin3@test.com', password: 'password', password_confirmation: 'password', role: 'admin'
    }).catch(e => {});
    
    const loginRes = await axios.post('http://localhost:8000/api/login', {
      email: 'admin3@test.com', password: 'password'
    });
    const token = loginRes.data.token;
    
    const res = await axios.post('http://localhost:8000/api/website/news/1', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });
    
    console.log("Success:", res.data);
  } catch(e) {
    console.log("Error:", e.response ? e.response.data : e.message);
  }
}
run();
