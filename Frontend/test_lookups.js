import axios from 'axios';

axios.post('http://localhost:8000/api/login', {
    email: 'admin@school.com', // wait, do I know the admin email?
    password: 'password'
}).then(res => {
    const token = res.data.token;
    return axios.get('http://localhost:8000/api/lookups', {
        headers: { Authorization: `Bearer ${token}` }
    });
}).then(res => console.log(JSON.stringify(res.data.classes, null, 2)))
.catch(err => console.error(err.response?.data || err.message));
