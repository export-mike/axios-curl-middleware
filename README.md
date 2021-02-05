# Axios Curl Middleware

```yarn add axios-curl-middleware```

```js 

import axios from 'axios';
import axiosCurl from 'axios-curl-middleware';
axiosCurl(axios);

axios.get('https://dog.ceo/api/breeds/image/random?test=123132')
/*

curl -X get -H 'accept: application/json, text/plain, */*' 'http://dog.ceo:80/api/breeds/image/random?test=123132'

*/

```


> axiosCurl(axios, [{ log, writeToFS }])

Changing *writeToFS* to true will write an individual file for each curl into a curls folder.
