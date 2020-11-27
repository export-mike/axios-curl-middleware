const axios = require('axios');
require('./')(axios);

async function example(){
    const {data } = await axios.get(`https://dog.ceo/api/breeds/image/random?test=123132`)
    const req2 = await axios.post(`https://dog.ceo/api/breeds/image/random?test=123132`, {
        hi: true
    },  {
        headers: {
            'content-type': 'application/json',
        },
    })
    console.log(data);
}   

example()