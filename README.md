# Sipml5 webrtc for Angular

This is a Webrtc library for Angular based on [Sipml5](https://www.doubango.org/sipml5/). In fact, It's a bridge between [Sipml5](https://www.doubango.org/sipml5/) and Angular.

## Installation

Install via npm

```bash
npm i angular-webrtc-sipml
```

## Usage

import SIPmlWebRTC into your component
```javascript
import SIPmlWebRTC from 'angular-webrtc-sipml';
```

Add the following tags into your html component (audio tags are used to play voice call)
```html
<audio id="audio_remote" autoplay="autoplay"></audio>
<input type="button" class="btn btn-success" id="btnRegister" value="LogIn" (click)='sipRegister();' />
<input type="button" class="btn btn-success" id="btnCall" value="Audio Call" (click)="sipCall('call-audio')" />
<input type="button" class="btn btn-success" id="btnHangup" value="Hang Up" (click)="sipHangUp()" />
<input type="button" class="btn btn-danger" id="btnUnRegister" value="LogOut" (click)='sipUnRegister();' />
```

Then, you need to login or register with your information
```javascript
sipRegister = () => {

    //console.log(SIPmlWebRTC)
    let options = {
        realm: "xxx.xxx.xxx.xx", //txtRealm.value,
        impi: "xxxx",//txtPrivateIdentity.value,
        impu: "sip:xxx@xxx.xxx.xxx.xxx",//txtPublicIdentity.value,
        password: "xxxx",//txtPassword.value,
        display_name: "xxxx", //txtDisplayName.value,
        websocket_proxy_url: "xxxxxx",//(window.localStorage ? window.localStorage.getItem('org.doubango.expert.websocket_server_url') : null),
        outbound_proxy_url: "xxxxxx",//(window.localStorage ? window.localStorage.getItem('org.doubango.expert.sip_outboundproxy_url') : null),
        ice_servers: "xxxxxx", //(window.localStorage ? window.localStorage.getItem('org.doubango.expert.ice_servers') : null),
        enable_rtcweb_breaker: "xxxxx",(window.localStorage ? window.localStorage.getItem('org.doubango.expert.enable_rtcweb_breaker') == "true" : false),
        events_listener: { events: '*', listener: SIPmlWebRTC.onSipEventStack },
        enable_early_ims: "xxxxx",//(window.localStorage ? window.localStorage.getItem('org.doubango.expert.disable_early_ims') != "true" : true), // Must be true unless you're using a real IMS network
        enable_media_stream_cache: "xxxx",//(window.localStorage ? window.localStorage.getItem('org.doubango.expert.enable_media_caching') == "true" : false),
        sip_headers: [
            { name: 'User-Agent', value: 'IM-client/OMA1.0 sipML5-v1.2016.03.04' },
            { name: 'Organization', value: 'Doubango Telecom' }
        ]
    }
    SIPmlWebRTC.sipRegister(options);

}
```

## Call Control

Start Audio call
```javascript
sipCall = () => {
    SIPmlWebRTC.sipAudioCall();
}
```

Hang up (Stop Audio call)
```javascript
sipHangUp = () => {
    SIPmlWebRTC.sipHangUp();
}
```

Logout or signup
```javascript
sipUnRegister = () => {
    SIPmlWebRTC.sipUnRegister();
}
```

Mute
```javascript
// Soon
```

Unmute
```javascript
// Soon
```

Video Call
```javascript
// Soon
```
---

