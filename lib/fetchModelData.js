/**
 * fetchModel - Fetch a model from the web server.
 *
 * @param {string} url      The URL to issue the GET request.
 *
 * @returns a Promise that should be filled with the response of the GET request
 * parsed as a JSON object and returned in the property named "data" of an
 * object. If the request has an error, the Promise should be rejected with an
 * object that contains the properties:
 * {number} status          The HTTP response status
 * {string} statusText      The statusText from the xhr request
 */
function fetchModel(url) {
  return new Promise(function (resolve, reject) {
    console.log(url);
    
    let responsepromise = fetch(url);

    responsepromise.then(
      response => {
        if (response.ok){
          let jsonpromise = response.json();
          // On Success return:
          jsonpromise.then(
            getResponseObject => {
              resolve({data: getResponseObject});
            },
            error => reject(new Error(
              {status: 501, statusText: error}
            ))
          );
          
        }
        else{
          reject(new Error(
            {status: response.status, statusText: response.statusText}
          ));
        }
      },
      error => reject(new Error(
        {status: 501, statusText: error}
      ))
    );
    
    

  });
}


// function fetchModel(url) {
//   return new Promise(async function (resolve, reject) {
//     console.log(url);
//     // setTimeout(() => reject(new Error(
//     //   { status: 501, statusText: "Not Implemented" })), 
//     //   0
//     // );

    
//     let response = await fetch(url);
    
//     if (response.ok){
//       let getResponseObject = await response.json();
//       // On Success return:
//       resolve({data: getResponseObject});
//     }
//     else{
//       reject(new Error(
//         {status: response.status, statusText: response.statusText}
//       ));
//     }

//   });
// }



export default fetchModel;
