
class NimbleInstitutionsAPI {

    apiBase = 'https://d2yewv0iyy4eh7.cloudfront.net';

    fetchApi(path){
        return fetch(path)
        .then(response => {
            if (!response.ok) { throw response }
            return response;
        })
        .then(response => response.json());
    }

    getDomainMeta(domain){
        return new Promise((resolve, reject) => {
            this.fetchApi(`${this.apiBase}/Public?data=${domain}`)
                .then(data => {
                    if(data.data.length === 0){
                        reject(new Error(`Bank domain ${domain} not found.`));
                    }
                    resolve(data.data[0]);
                })
                .catch(error => {
                    if(error.json){
                        error.json().then(body => {
                            if(body.errors[0].detail === 'Monthly quota has been reached. Please upgrade to continue making requests.') { 
                                reject(new Error('Something went wrong. Error code: MQR')); 
                            }
                        });
                    }
                })
        })
    }

    getBraches(domain){
        return new Promise((resolve, reject) => {
            this.fetchApi(`${this.apiBase}/Public?data=${domain}`)
                .then(data => {
                    if(data.data.length === 0){
                        reject(new Error(`Bank domain ${domain} not found.`));
                    }
                    resolve(data.data);
                })
                .catch(error => {
                    if(error.json){
                        error.json().then(body => {
                            if(body.errors[0].detail === 'Monthly quota has been reached. Please upgrade to continue making requests.') { 
                                reject(new Error('Something went wrong. Error code: MQR')); 
                            }
                        });
                    }
                })
        })
    }
}

export default NimbleInstitutionsAPI;