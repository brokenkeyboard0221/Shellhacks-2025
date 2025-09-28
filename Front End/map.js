var map = L.map('map').setView([25.761681, -80.191788], 10);

const location_popup = L.popup();

// store selected coordinates
window.selectedLocation = null;

const analyzeBtn = document.getElementById('analyzeBtn');

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

function onMapClick(e) {
    //alert("You clicked the map at " + e.latlng);

    location_popup
        .setLatLng(e.latlng)
        .setContent(`Latitude: ${e.latlng.lat.toFixed(5)} Longitude: ${e.latlng.lng.toFixed(5)}`)
        .openOn(map);

    // store the selected location globally
    window.selectedLocation = { lat: e.latlng.lat, lng: e.latlng.lng };

    // re-center the map smoothly to the selected location
    map.setView(e.latlng, Math.max(map.getZoom(), 10), { animate: true });

    // enable analyze button now that a location is selected
    if(analyzeBtn) analyzeBtn.disabled = false;
}

map.on('click', onMapClick);

// Ensure the map resizes correctly when the window changes
window.addEventListener('resize', function(){
    try{ map.invalidateSize(); }catch(e){/* ignore if map not ready */}
});

// Analyze button behavior: requires a selected location
if(analyzeBtn){
    analyzeBtn.addEventListener('click', function(){
        if(!window.selectedLocation){
            alert('Please select a location on the map first.');
            return;
        }

        // simple UI feedback: show popup and temporarily disable the button while "analyzing"
        const lat = window.selectedLocation.lat.toFixed(5);
        const lng = window.selectedLocation.lng.toFixed(5);
        const latlng = L.latLng(window.selectedLocation.lat, window.selectedLocation.lng);

        location_popup
            .setLatLng(latlng)
            .setContent(`<strong>Analyzing radar at</strong><br/>Latitude: ${lat}<br/>Longitude: ${lng}`)
            .openOn(map);

        analyzeBtn.disabled = true;
        analyzeBtn.textContent = 'Analyzing...';

        // Simulate analysis delay (replace with real request in future)
        setTimeout(()=>{
            analyzeBtn.disabled = false;
            analyzeBtn.textContent = 'Analyze Radar Image';
            // For now, log the coords. Replace with analysis API call.
            console.log('Analyze requested for:', window.selectedLocation);
            // Optionally, you can show a more detailed result or navigate to result page.
        }, 1500);
    });
}