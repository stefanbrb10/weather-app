import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Modal from 'react-modal';

function Weather() {
  const [forecast, setForecast] = useState([]);
  const [time, setTime] = useState([]);
  const [currentLocation, setCurrentLocation] = useState('');
  const [latitude, setLatitude] = useState(44.4323);
  const [longitude, setLongitude] = useState(26.1063);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const locations = [
    { name: 'Bucuresti', latitude: 44.4323, longitude: 26.1063 },
    { name: 'Roman', latitude: 47.9275, longitude: 26.3700 },
    { name: 'Granada', latitude: 37.1773, longitude: -3.5986 },
    { name: 'Londra', latitude: 51.5074, longitude: -0.1278 },
    { name: 'Tokyo', latitude: 35.6895, longitude: 139.6917 },
    { name: 'New York', latitude: 40.7128, longitude: -74.0060 }
  ];

  
  const getWeatherUrl = (latitude, longitude) => {
    return `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum,snowfall_sum,precipitation_probability_max&past_days=1&forecast_days=1`;
  };

  const getNominatimApiUrl = (latitude, longitude) => {
    return `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`;
  };

  const forecastUnits = {
    'precipitation_probability_max': '%',
    'precipitation_sum': ' mm',
    'snowfall_sum': ' mm',
    'uv_index_max': ' UV',
    'sunrise': ' AM',
    'sunset': ' PM',
    'temperature_2m_max': '°C',
    'temperature_2m_min': '°C'
  };

  function getDataFromApi(latitude, longitude) {
    axios
      .get(getWeatherUrl(latitude, longitude))
      .then((res) => {
        console.log(res);
        setForecast(res.data.daily);
        setTime(res.data.daily.time);
      })
      .catch((err) => {
        console.log(err);
      });

    axios.get(getNominatimApiUrl(latitude, longitude))
      .then((res) => {
        const city = res.data.address.city;
        const country = res.data.address.country;
        setCurrentLocation(`${city}, ${country}`);
    })
    .catch((err) => {
      console.log(err);
    });
  }


  useEffect(() => {
    getDataFromApi(latitude, longitude);
  }, []);

  function convertHour(forecastString){
  let hour = forecastString.slice(0, 2);
      hour = parseInt(hour) + 2;
      hour = hour.toString();
      if(hour.length === 1)
        hour = `0${hour}`;
      forecastString = `${hour}${forecastString.slice(2)}`;
      return forecastString;
  }

  function processForecast(forecastString, key){
    if(key === 'sunrise' || key === 'sunset'){
      forecastString = forecastString.slice (11, 16);
      return convertHour(forecastString);
    }
    if(key !== 'time')
      return `${forecastString}${forecastUnits[key]}`;
    return undefined;
  }

  function processKey(key){
    if(key === 'temperature_2m_max')
      return { label: 'Max Temperature:', icon: <i className="fas fa-cloud-sun"></i> };
    if(key === 'temperature_2m_min')
      return { label: 'Min Temperature:', icon: <i className="fas fa-cloud-moon"></i> };
    if(key === 'precipitation_sum')
      return { label: 'Precipitation:', icon: <i className="fas fa-cloud-rain"></i> };
    if(key === 'snowfall_sum')
      return { label: 'Snowfall:', icon: <i className="fas fa-snowflake"></i> };
    if(key === 'uv_index_max')
      return { label: 'UV Index:', icon: <i className="fas fa-umbrella-beach"></i> };
    if(key === 'precipitation_probability_max')
      return { label: 'Precipitation Probability:', icon: <i className="fas fa-cloud-showers-heavy"></i> };
    if(key === 'sunrise')
      return { label: 'Sunrise:', icon: <i className="fas fa-sun"></i> };
    if(key === 'sunset')
      return { label: 'Sunset:', icon: <i className="fas fa-cloud-moon"></i> };
    return {label: '', icon: ''}
  }

  function processTime(time){
    let monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    let date = new Date(time);
    let day = date.getDate();
    let monthIndex = date.getMonth();
    let year = date.getFullYear();
    let formattedDate = `${day}-${monthNames[monthIndex]}-${year}`;
    return formattedDate;
  }

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    getDataFromApi(latitude, longitude);
  };

  const handleLocationSelect = (location) => {
    setCurrentLocation(location.name);
    setLatitude(location.latitude);
    setLongitude(location.longitude);
    console.log(location.name);
    closeModal();
    };

  const keys = Object.keys(forecast);

  return (
    <div>
    <h2 onClick = {openModal} className = 'locationHeader'>
    {currentLocation}
    <i class="fas fa-location-arrow fa-xs"></i>
    </h2>
    <Modal isOpen={isModalOpen}
           onRequestClose={closeModal}
           contentLabel="Location Modal">
            <button onClick = {closeModal} className='closeModal'>X</button>
            <h2>Select a location</h2>
            {locations.map((location) => (
              <p onClick = {() => handleLocationSelect(location)}>{location.name}</p>
            ))}
    </Modal>
      {[...Array(2)].map((_, index) => (
        <div className='weatherCard'>
          <div className='weatherTitle'>
            <h3>{index === 0 && 'Yesterday'} {index === 1 && 'Today'}</h3>
            <h5>{processTime(time[index])}</h5>
          </div>
          <ul>
            {keys.map((key) => ( 
                <li className={key}>
                {processKey(key).icon} {processKey(key).label}  {processForecast(forecast[key][index], key)}
                </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Weather;
