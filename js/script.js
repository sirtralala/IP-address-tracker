// ********************************** map code **********************************

let map, marker, mapStyle = 'mapbox/streets-v11'; 
let icon = L.icon({
    iconUrl: '../images/icon-location.svg',
    iconSize:     [48, 56],
    iconAnchor:   [22, 94]
});

initializeMap = (latitude, longitude) => {
    map = L.map('map').setView([latitude, longitude], 13);
    displayMap(latitude, longitude);
}

displayMap = (latitude, longitude) => {
    map.setView([latitude, longitude], 13);
    setMapStyle();
    setMarker(latitude, longitude);
}

setMapStyle = (toggle = false) => {
    if (toggle) {
        mapStyle === 'mapbox/streets-v11' ? mapStyle = 'mapbox/satellite-v9' : mapStyle = 'mapbox/streets-v11';
    }
    
    L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
        attribution: `Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, 
                    <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>,
                    Imagery © <a href="https://www.mapbox.com/">Mapbox</a>`,
        maxZoom: 18,
        id: mapStyle,
        tileSize: 512,
        zoomOffset: -1,
        accessToken: 'pk.eyJ1Ijoic2lydHJhbGFsYSIsImEiOiJja2hvdWEyNXgwZDhvMnNwNXQxYnVwaDIyIn0.EXCPe5q97yPNkMH-0I6hww'
    }).addTo(map);
}

setMarker = (latitude, longitude) => {
    if (marker) {
        map.removeLayer(marker);
    }
    marker = new L.marker([latitude, longitude], {icon: icon}).addTo(map);
}

// ********************************** end of map code **********************************



// listen to 'Enter press' at search input
let inputDiv = document.querySelector('#input');
inputDiv.addEventListener('keyup', event => {
    if (event.keyCode === 13) {
        event.preventDefault();
        document.querySelector('#inputButton').click();
    }
});

readInput = () => {
    resetResultsDiv();
    let input = $('#input').val();
    let apiRequest = checkInput(input);

    if (apiRequest != null) {
        getDataFromIpify(apiRequest);
    }
}

checkInput = input => { 
    let checkIp = new RegExp('^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.'+
                             '(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.'+ 
                             '(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.'+ 
                             '(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$');

    let checkUrl = new RegExp('^(https?:\\/\\/)?'+ // protocol
                              '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
                              '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
                              '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
                              '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
                              '(\\#[-a-z\\d_]*)?$','i'); // fragment locator

    if (input.match(checkIp)) {
        return [input, 'ip'];
    }
    else if (input.match(checkUrl)) {
        return [adjustUrl(input), 'url'];
    }
    else {
        displayInvalidInput(`Invalid input: "${input}"`);
        return null;
    }
}

adjustUrl = input => {
    let startPosition = input.indexOf('//');
    let endPosition = input.length;
    let inputWithoutProtocol, pathPosition;

    // check if url contains http protocol - if so, slice it
    startPosition !== -1 ? startPosition += 2 : startPosition++;
    inputWithoutProtocol = input.slice(startPosition, endPosition);

    // check if url contains path - if so, slice it
    pathPosition = inputWithoutProtocol.indexOf('/');
    return pathPosition !== -1 ? inputWithoutProtocol.slice(0, pathPosition) : inputWithoutProtocol;
}

getDataFromIpify = (request = ['', 'ip']) => {
    let api_key = 'at_T2nz1Nv8sGqFMRsU3yuVyOOYnTuaC';
    
    $( () => {
       $.ajax({
           url: 'https://geo.ipify.org/api/v1',
           data: request[1] == 'ip' ? {apiKey: api_key, ipAddress: request[0]} : {apiKey: api_key, domain: request[0]},
           success: data => {
                displayData(data);
                !map ? initializeMap(data.location.lat, data.location.lng) : displayMap(data.location.lat, data.location.lng);
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
    location.text(data.location.city + ', ' + data.location.country + ', ' + data.location.postalCode);
    timezone.text('UTC ' + data.location.timezone);
    isp.text(data.isp);
}

resetResultsDiv = () => {
    let outputDiv = $('#output');
    let html = `<div class="results" id="output">
                    <div class="results__details">
                        IP Address
                        <div id="ip" class="results__details--result"></div>
                    </div>
                    <div class="results__details">
                        Location
                        <div id="location" class="results__details--result"></div>
                    </div>
                    <div class="results__details">
                        Timezone
                        <div id="timezone" class="results__details--result"></div>
                    </div>
                    <div class="results__details">
                        ISP
                        <div id="isp" class="results__details--result"></div>
                    </div>
                </div>`;
    outputDiv.replaceWith(html);
}



// ********************************** error handling **********************************

$(document).ajaxError( (event, xhr, options) => {
    let errorMessage = `Error requesting "${$('#input').val()}"<br />Request status: ${xhr.status}, ${xhr.statusText}`;
    displayInvalidInput(errorMessage);
});

displayInvalidInput = invalidInput => {
    let outputDiv = $('#output');
    let html = `<div class="results" id="output">
                    <div class="results__details">
                        Error occured
                        <div class="results__details--error">${invalidInput}<br />Please try again!</div>
                    </div> 
                </div>`;
    outputDiv.replaceWith(html);
}