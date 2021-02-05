class WeatherApp {
  constructor(id, props = {}) {
    this._key = '64d01fd4bf8aeb877b07499277fb5522';
    this._APIs = { weather: 'https://api.openweathermap.org/data/2.5/weather', location: 'https://api.bigdatacloud.net/data/reverse-geocode-client' }; // this._staticGeo = !!props.location;

    this.rootEl = document.getElementById(id);

    this.views = [
      'country', 'city', 'temp', 'unit', 'unitBtn', 'synchBtn', 'synchBtn', 'windDir', 'bg', 'windSpeed', 'sunrise', 'sunset',
    ];

    this.props = {
      lang: navigator.language.slice(0, 2),
      celsius: true,
      location: {
        latitude: 1, longitude: 1,
      },
      ...props,
    };

    this.initViews();
    if (!props.location) { // if (!this._staticGeo) {
      new Promise((resolve, reject) => { navigator.geolocation.getCurrentPosition(resolve, reject); })
        .then((dataPos) => { // Spread ...dataPos.coords don't work, propetries is prototype or non-enumerable
          this.props.location = { ...this.props.location, latitude: dataPos.coords.latitude, longitude: dataPos.coords.longitude }; this.synch(); /* this.render(); */
        });
    }

    /* this.render(); */ this.synch(); setInterval(() => { this.synch(); }, 60000);
    this.initListners();
  }

  initViews() {
    const buf = {};
    this.views.forEach((el) => {
      buf[el] = this.rootEl.querySelector(`.widget__${el}`);
    }); this.views = buf;
  }

  async getWeather() {
    return this.getData(`${this._APIs.weather}?lat=${this.props.location.latitude}&lon=${this.props.location.longitude}&units=${this.props.celsius ? 'metric' : 'imperial'}&lang=${this.lang}&appid=${this._key}`)
      .then((dataW) => { this.props.location = { ...this.props.location, ...dataW }; });
  }

  async getLocation() {
    return this.getData(`${this._APIs.location}?latitude=${this.props.location.latitude}&longitude=${this.props.location.longitude}&localityLanguage=${this.props.lang}`)
      .then((dataL) => { this.props.location = { ...this.props.location, ...dataL }; });
  }

  getData(uri) {
    return fetch(uri).then((data) => { if (!data.ok) throw new Error('Whoops!'); return data.json(); });
  }

  setUnit() {
    this.views.unitBtn.textContent = this.props.celsius ? 'Fahrenheit' : 'Celsius';
    this.views.unit.textContent = this.props.celsius ? 'ºC' : 'ºF';
  }

  viewWeather() { // set Weather view
    const dW = this.props.location;
    const sunrize = new Date(dW.sys.sunrise * 1000);
    const sunset = new Date(dW.sys.sunset * 1000);
    const v = this.views;

    v.temp.textContent = dW.main.temp;
    v.windSpeed.textContent = `${dW.wind.speed} m/s`;
    v.sunrise.textContent = `${sunrize.getHours()}:${sunrize.getMinutes()}`;
    v.sunset.textContent = `${sunset.getHours()}:${sunset.getMinutes()}`;

    setTimeout(() => { v.bg.style.backgroundImage = `url('http://openweathermap.org/img/wn/${dW.weather[0].icon}@2x.png')`; }, 1000);
    v.windDir.style.transform = `rotate(${dW.wind.deg}deg)`;
    this.rootEl.classList.toggle('widget_hot', ((dW.main.temp > 0) && this.props.celsius) || dW.main.temp > 32);
  }

  viewLocation() { // set Location view
    this.views.country.textContent = this.props.location.countryName;
    this.views.city.textContent = this.props.location.city;
  }

  synch() {
    this.views.synchBtn.firstChild.classList.add('reload'); this.views.bg.style.backgroundImage = 'url(widget-loading.gif)';
    setTimeout(() => { this.views.synchBtn.firstChild.classList.remove('reload'); }, 2000);
    this.setUnit();
    this.getLocation().then(() => { this.viewLocation(); }); // Banned my test client-side adress
    this.getWeather().then(() => { this.viewWeather(); });
  }

  tost() {
    this.props.celsius = !this.props.celsius; this.setUnit();
    this.getWeather().then(() => { this.viewWeather(); });
  }

  initListners() {
    this.views.unit.addEventListener('click', () => { this.tost(); });
    this.views.unitBtn.addEventListener('click', this.tost.bind(this)); // Experiment
    this.views.synchBtn.addEventListener('click', this.synch.bind(this)); // Experiment
    this.views.temp.addEventListener('click', () => { this.synch(); });
  }
}
