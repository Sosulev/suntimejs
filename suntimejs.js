const dayjs = require('dayjs');

!function(e,t){
  "object"==typeof exports && "undefined" != typeof module ? module.exports=t() :
  "function"==typeof define && define.amd ? define(t) :
  (e="undefined" != typeof globalThis ? globalThis : e || self).dayjs_plugin_sun=t()
}
(this, (function() {
  "use strict";
  return function(e,t,n) {
    const {latitude, longitude} = e
    n.extend(require('dayjs/plugin/utc'))
    n.extend(require('dayjs/plugin/dayOfYear'))
    const TrueL = (M) => {
      const L = M + (1.916 * Math.sin(DegToRad(M))) + (0.020 * Math.sin(DegToRad(2 * M))) + 282.634
      return L >= 360 ? L-360 : L < 0 ? L+360 : L
    }
    const RightAscension = (L) => {
      const RA = Math.atan(0.91764 * Math.tan(L * Math.PI / 180)) * 180 / Math.PI
      return (RA + ((90 * Math.floor(L / 90)) - (90 * Math.floor(RA / 90))))/15
    }
    const DegToRad = (arg) => Math.PI * arg / 180
    const ToUT = (T, lngHour) => {
      const UT = T - lngHour
      return UT < 0 ? UT+24 : UT >= 24 ? UT-24 : UT
    }
    const to360range = (arg) => arg > 360 ? arg - Math.floor(arg / 360) * 360 : arg < 0 ? arg + (Math.floor(-arg / 360) + 1) * 360 : arg

    t.prototype.sunTime = function (param) {

      param=String(param).toLowerCase()
      const angle = isFinite(param) && +param+90 || param.includes('twilight') && 96 || param.includes('sun') && 90.83333
      if(!isFinite(angle)) return dayjs(NaN)
      const date=this.startOf('date').add(12, 'hour')
      let rise, set, length
      rise = set = this.clone().add(NaN)
      const n = date.utc().dayOfYear() // calculate the day of the year
      const lngHour = longitude / 15 // convert the longitude to hour value and calculate an approximate time
      const trise = n + ((6 - lngHour) / 24)
      const tset = n + ((18 - lngHour) / 24)
      const mrise = (0.9856 * trise) - 3.289 // calculate the Sun's mean anomaly
      const mset = (0.9856 * tset) - 3.289
      const lrise = TrueL(mrise) // calculate the Sun's true longitude
      const lset = TrueL(mset)
      const RArise = RightAscension(lrise) // calculate the Sun's right ascension
      const RAset = RightAscension(lset)
      const sinDecrise = 0.39782 * Math.sin(DegToRad(lrise)) // calculate the Sun's declination
      const cosDecrise = Math.cos(Math.asin(sinDecrise))
      const sinDecset = 0.39782 * Math.sin(DegToRad(lset))
      const cosDecset = Math.cos(Math.asin(sinDecset))
      const cosHrise = (Math.cos(DegToRad(angle)) - (sinDecrise * Math.sin(DegToRad(latitude)))) / (cosDecrise * Math.cos(DegToRad(latitude)))
      const cosHset =  (Math.cos(DegToRad(angle)) - (sinDecset * Math.sin(DegToRad(latitude)))) / (cosDecset * Math.cos(DegToRad(latitude)))
      if(cosHrise >= -1 && cosHrise <= 1) {
        const Hrise = (360 - 180 * Math.acos(cosHrise) / Math.PI) / 15
        const Trise = Hrise + RArise - (0.06571 * trise) - 6.622
        const UTrise = ToUT(Trise, lngHour)
        const UTrisehour = Math.floor(UTrise)
        const UTriseminutes = Math.floor((UTrise - UTrisehour) * 60)
        rise = date.utc().hour(UTrisehour).minute(UTriseminutes).local()
        const Hset = (180 * Math.acos(cosHset) / Math.PI) / 15
        const Tset = Hset + RAset - (0.06571 * tset) - 6.622
        const UTset = ToUT(Tset, lngHour)
        const UTsethour = Math.floor(UTset)
        const UTsetminutes = Math.floor((UTset - UTsethour) * 60)
        set = date.utc().hour(UTsethour).minute(UTsetminutes).local()
        length = UTsethour < UTrisehour ? (24 * 60 - (UTrisehour * 60 + UTriseminutes)) + (UTsethour * 60 + UTsetminutes) : (24 * 60 - (UTrisehour * 60 + UTriseminutes)) - (24 * 60 - (UTsethour * 60 + UTsetminutes))
      }
      return param.includes('rise') && rise
          || param.includes('set') && set
          || param.includes('length') && length
          || {rise, set, length}
    }
    t.prototype.sunPositions = function() {
      const da=this.utc().date(), mo=this.utc().month()+1, ya=this.utc().year(), ut=this.utc().hour() + this.utc().minute()/60
      const d = 367 * ya - Math.floor((7 * (ya + (Math.floor((mo + 9) / 12)))) / 4) + Math.floor((275 * mo) / 9) + da - 730530;
      const w = 282.9404 + 4.70935 * Math.pow(10, -5) * d;    //longitude of perihelion
      const e = 0.016709 - 1.151 * Math.pow(10, -9) * d;      //eccentricity
      const M = to360range(356.0470 + 0.9856002585 * d);      //mean anomaly
      const oblecl = 23.4393 - 3.563 * Math.pow(10, -7) * d;  //obliquity of the ecliptic
      const L = to360range(w + M);                            //mean longitude
      const E = M + (180 / Math.PI) * e * Math.sin(M * Math.PI / 180) * (1 + e * Math.cos(M * Math.PI / 180));  //eccentric anomaly
    //rectangular coordinates in the plane of the ecliptic, where the X axis points towards the perihelion
      let x = Math.cos(E * Math.PI / 180) - e;
      let y = Math.sin(E * Math.PI / 180) * Math.sqrt(1 - e * e);
      const r = Math.sqrt(x * x + y * y);
      const v = (180 / Math.PI) * Math.atan2(y, x);
      const lon = to360range(v + w);
    //ecliptic rectangular coordinates
      x = r * Math.cos(lon * Math.PI / 180);
      y = r * Math.sin(lon * Math.PI / 180);
      let z = 0.0;
    //rotate to equatorial coordinates
      const xequat = x;
      const yequat = y * Math.cos(oblecl * Math.PI / 180) + z * Math.sin(oblecl * Math.PI / 180);
      const zequat = y * Math.sin(oblecl * Math.PI / 180) + z * Math.cos(oblecl * Math.PI / 180);
    //convert to RA and Declination
      const RA = (180 / Math.PI) * Math.atan2(yequat, xequat);
      const Decl = (180 / Math.PI) * Math.asin(zequat / r);
    //Sidereal Time at the Greenwich meridian at 00:00 right now
      const GMST0 = L / 15 + 12;
      let SIDTIME = GMST0 + ut + longitude / 15;
      SIDTIME = SIDTIME - 24 * Math.floor(SIDTIME / 24);
    //hour angle
      const HA = to360range(15 * (SIDTIME - RA / 15));
      x = Math.cos(HA * Math.PI / 180) * Math.cos(Decl * Math.PI / 180);
      y = Math.sin(HA * Math.PI / 180) * Math.cos(Decl * Math.PI / 180);
      z = Math.sin(Decl * Math.PI / 180);
      const xhor = x * Math.sin(latitude * Math.PI / 180) - z * Math.cos(latitude * Math.PI / 180);
      const yhor = y;
      const zhor = x * Math.cos(latitude * Math.PI / 180) + z * Math.sin(latitude * Math.PI / 180);
      const azimuth = Math.ceil(to360range(Math.atan2(yhor, xhor) * (180 / Math.PI) + 180)*100)/100
      const altitude = zhor >= 0 ? Math.ceil(Math.asin(zhor) * (180 / Math.PI)*100)/100 : 0
      return {azimuth, altitude}
    }
  }
}));