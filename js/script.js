let inputDiv = document.querySelector('#input');

inputDiv.addEventListener('keyup', event => {
    // if ('Enter' was pressed)
    if (event.keyCode === 13) {
        event.preventDefault();
        document.querySelector('#inputButton').click();
    }
});


readInput = () => {
    resetResultsDiv();
    let input = $('#input').val();
    
    let request = checkInput(input);
    console.log('request: ' + request);
    if (request != null) {
        getDataFromIpify(request);
    }
    
}

resetResultsDiv = () => {
    let outputDiv = $('#output');
    let html = `<div class="header__results" id="output">
                    <div class="header__results--details">
                        IP Address
                        <div id="ip" class="header__results--result"></div>
                    </div>
                    <div class="header__results--details">
                        Location
                        <div id="location" class="header__results--result"></div>
                    </div>
                    <div class="header__results--details">
                        Timezone
                        <div id="timezone" class="header__results--result"></div>
                    </div>
                    <div class="header__results--details">
                        ISP
                        <div id="isp" class="header__results--result"></div>
                    </div>
                    </div>
                </div>`;
    outputDiv.replaceWith(html);
}

checkInput = input => {
    let checkIp = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    let checkUrl = /^[a-z][a-z0-9+.-]*:/;

    if (input.match(checkIp)) {
        return [input, 'ip'];
    }
    else if (input.match(checkUrl)) {
        return [input, 'url'];
    }
    else {
        displayInvalidInput(input);
        return null; // auch 2 argumente zurückgeben? [null, 'invalid']
    }
}

displayInvalidInput = invalidInput => {
    let outputDiv = $('#output');
    let html = `<div class="header__results" id="output">
                    <div class="header__results--details">
                        Error occured
                        <div class="header__results--result">Invalid input: ${invalidInput}<br />Please try again!</div>
                    </div> 
                </div>`;
    outputDiv.replaceWith(html);
}


getDataFromIpify = (request = ['', 'ip']) => {
    let api_key = 'at_T2nz1Nv8sGqFMRsU3yuVyOOYnTuaC';
    
    $( () => {
       $.ajax({
           url: 'https://geo.ipify.org/api/v1',
           data: request[1] == 'ip' ? {apiKey: api_key, ipAddress: request[0]} : {apiKey: api_key, domain: request[0]},
           success: function(data) {
                // $('body').append('<pre>'+ JSON.stringify(data,'',2)+'</pre>');
                console.log(data);
                displayData(data);
           }
       });
    });
}

displayData = data => {
    let ip_address = $('#ip'); 
    let location = $('#location');
    let timezone = $('#timezone');
    let isp = $('#isp');

    ip_address.text(data.ip);
    location.html(`${data.location.city}, ${data.location.country}, ${data.location.postalCode}`);
    timezone.text(data.location.timezone);
    isp.text(data.isp);
}