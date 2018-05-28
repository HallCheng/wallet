import Constants from '../utils/Constants'

const request = (url, method, body) => {
  let isOk;
  return new Promise((resolve, reject) => {
    fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
        "uid":Constants.uid|'',
        "token":Constants.token,
        "version":Constants.version,
        "os":Constants.os,
        "osVersion":Constants.osVersion,
        "model":Constants.model,
        "deviceId":Constants.deviceId
      },
      body:JSON.stringify(body)
    })
      .then((response) => {
        if (response.ok) {
          isOk = true;
        } else {
          isOk = false;
        }
        return response.json();
      })
      .then((responseData) => {
        if (isOk) {
          resolve(responseData);
        } else {
          reject(responseData);
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
};

export default {
  request
};
