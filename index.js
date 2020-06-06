let SIPml = require('./SIPml.min.js')

module.exports = {
    options : {},
    oSipStack : null,
    oSipSessionRegister: null,
    oSipSessionCall: null,
    oSipSessionTransferCall:null,
    oConfigCall:null,
    sipHangUp: function() {
        if (this.oSipSessionCall) {
            //txtCallStatus.innerHTML = '<i>Terminating the call...</i>';
            this.oSipSessionCall.hangup({ events_listener: { events: '*', listener: onSipEventSession } });
        }
    },
    sipUnRegister: function() {
        if (this.oSipStack) {
            this.oSipStack.stop(); // shutdown all sessions
        }
    },
    sipAudioCall : function() {

        let s_type = "call-audio";
        let audioRemote = document.getElementById("audio_remote");
        this.oConfigCall = {
            audio_remote: audioRemote,
            video_local: null,
            video_remote: null,
            screencast_window_id: 0x00000000, // entire desktop
            bandwidth: { audio: undefined, video: undefined },
            video_size: { minWidth: undefined, minHeight: undefined, maxWidth: undefined, maxHeight: undefined },
            events_listener: { events: '*', listener: this.onSipEventSession },
            sip_caps: [
                            { name: '+g.oma.sip-im' },
                            { name: 'language', value: '\"en,fr\"' }
            ]
        };

        if (this.oSipStack && !this.oSipSessionCall) {
            if (s_type == 'call-screenshare') {
                if (!SIPml.isScreenShareSupported()) {
                    alert('Screen sharing not supported. Are you using chrome 26+?');
                    return;
                }
                if (!location.protocol.match('https')) {
                    if (confirm("Screen sharing requires https://. Do you want to be redirected?")) {
                        //sipUnRegister();
                        //window.location = 'https://ns313841.ovh.net/call.htm';
                    }
                    return;
                }
            }
            //btnCall.disabled = true;
            //btnHangUp.disabled = false;

            if (window.localStorage) {
                //this.oConfigCall.bandwidth = tsk_string_to_object(window.localStorage.getItem('org.doubango.expert.bandwidth')); // already defined at stack-level but redifined to use latest values
                //this.oConfigCall.video_size = tsk_string_to_object(window.localStorage.getItem('org.doubango.expert.video_size')); // already defined at stack-level but redifined to use latest values
            }

            // create call session
            this.oSipSessionCall = this.oSipStack.newSession(s_type, this.oConfigCall);
            // make call
            if (this.oSipSessionCall.call("9999") != 0) {
                this.oSipSessionCall = null;
                //txtCallStatus.value = 'Failed to make call';
                //btnCall.disabled = false;
                //btnHangUp.disabled = true;
                return;
            }
            //this.saveCallOptions();
        }
        else if (this.oSipSessionCall) {
            //txtCallStatus.innerHTML = '<i>Connecting...</i>';
            this.oSipSessionCall.accept(this.oConfigCall);
        }
    },
    sipRegister: function(parameters) {

        window.localStorage.setItem('org.doubango.expert.websocket_server_url', "wss://213.202.217.19:8089/ws");

        try {
            //btnRegister.disabled = true;
            // enable notifications if not already done
            //if (Notification && Notification.checkPermission != 0) {
            Notification.requestPermission();
            //}

            // save credentials
            //this.saveCredentials();

            // update debug level to be sure new values will be used if the user haven't updated the page
            SIPml.setDebugLevel((window.localStorage && window.localStorage.getItem('org.doubango.expert.disable_debug') == "true") ? "error" : "info");

            // create SIP stack
            if(parameters)
                this.options = parameters;
            this.oSipStack = new SIPml.Stack(
                this.options
            );
            if (this.oSipStack.start() != 0) {
                console.log("Failed to start the SIP stack");
                //txtRegStatus.innerHTML = '<b>Failed to start the SIP stack</b>';
            }
            else return;
        }
        catch (e) {
            console.log(e );
            //txtRegStatus.innerHTML = "<b>2:" + e + "</b>";
        }
        //btnRegister.disabled = false;
    },
    onSipEventSession: function(e) {
        console.log('==session event = ' + e.type);

        switch (e.type) {
            case 'connecting': case 'connected':
                {
                    var bConnected = (e.type == 'connected');
                    if (e.session == this.oSipSessionRegister) {
                        //this.uiOnConnectionEvent(bConnected, !bConnected);
                        //txtRegStatus.innerHTML = "<i>" + e.description + "</i>";
                    }
                    else if (e.session == this.oSipSessionCall) {
                        alert('HangUp')
                        //btnHangUp.value = 'HangUp';
                        //btnCall.disabled = true;
                        //btnHangUp.disabled = false;
                        //btnTransfer.disabled = false;
                        //if (window.btnBFCP) window.btnBFCP.disabled = false;

                        if (bConnected) {
                            //stopRingbackTone();
                            //stopRingTone();

                            //if (oNotifICall) {
                            //    oNotifICall.cancel();
                            //    oNotifICall = null;
                            //}
                        }

                        //txtCallStatus.innerHTML = "<i>" + e.description + "</i>";
                        //divCallOptions.style.opacity = bConnected ? 1 : 0;

                        if (SIPml.isWebRtc4AllSupported()) { // IE don't provide stream callback
                            //this.uiVideoDisplayEvent(false, true);
                            //this.uiVideoDisplayEvent(true, true);
                        }
                    }
                    break;
                } // 'connecting' | 'connected'
            case 'terminating': case 'terminated':
                {
                    if (e.session == this.oSipSessionRegister) {
                        //this.uiOnConnectionEvent(false, false);

                        this.oSipSessionCall = null;
                        this.oSipSessionRegister = null;

                        //txtRegStatus.innerHTML = "<i>" + e.description + "</i>";
                    }
                    else if (e.session == this.oSipSessionCall) {
                        //this.uiCallTerminated(e.description);
                    }
                    break;
                } // 'terminating' | 'terminated'

            case 'm_stream_video_local_added':
                {
                    if (e.session == this.oSipSessionCall) {
                        //this.uiVideoDisplayEvent(true, true);
                    }
                    break;
                }
            case 'm_stream_video_local_removed':
                {
                    if (e.session == this.oSipSessionCall) {
                        //uiVideoDisplayEvent(true, false);
                    }
                    break;
                }
            case 'm_stream_video_remote_added':
                {
                    if (e.session == this.oSipSessionCall) {
                        //uiVideoDisplayEvent(false, true);
                    }
                    break;
                }
            case 'm_stream_video_remote_removed':
                {
                    if (e.session == this.oSipSessionCall) {
                        //uiVideoDisplayEvent(false, false);
                    }
                    break;
                }

            case 'm_stream_audio_local_added':
            case 'm_stream_audio_local_removed':
            case 'm_stream_audio_remote_added':
            case 'm_stream_audio_remote_removed':
                {
                    break;
                }

            case 'i_ect_new_call':
                {
                    this.oSipSessionTransferCall = e.session;
                    break;
                }

            case 'i_ao_request':
                {
                    if (e.session == this.oSipSessionCall) {
                        var iSipResponseCode = e.getSipResponseCode();
                        if (iSipResponseCode == 180 || iSipResponseCode == 183) {
                            //startRingbackTone();
                            //txtCallStatus.innerHTML = '<i>Remote ringing...</i>';
                        }
                    }
                    break;
                }

            case 'm_early_media':
                {
                    if (e.session == this.oSipSessionCall) {
                        //stopRingbackTone();
                        //stopRingTone();
                        //txtCallStatus.innerHTML = '<i>Early media started</i>';
                    }
                    break;
                }

            case 'm_local_hold_ok':
                {
                    if (e.session == this.oSipSessionCall) {
                        if (this.oSipSessionCall.bTransfering) {
                            this.oSipSessionCall.bTransfering = false;
                            // AVSession.TransferCall(transferUri);
                        }
                        //btnHoldResume.value = 'Resume';
                        //btnHoldResume.disabled = false;
                        //txtCallStatus.innerHTML = '<i>Call placed on hold</i>';
                        //this.oSipSessionCall.bHeld = true;
                    }
                    break;
                }
            case 'm_local_hold_nok':
                {
                    if (e.session == this.oSipSessionCall) {
                        //this.oSipSessionCall.bTransfering = false;
                        //btnHoldResume.value = 'Hold';
                        //btnHoldResume.disabled = false;
                        //txtCallStatus.innerHTML = '<i>Failed to place remote party on hold</i>';
                    }
                    break;
                }
            case 'm_local_resume_ok':
                {
                    if (e.session == this.oSipSessionCall) {
                        //this.oSipSessionCall.bTransfering = false;
                        //btnHoldResume.value = 'Hold';
                        //btnHoldResume.disabled = false;
                        //txtCallStatus.innerHTML = '<i>Call taken off hold</i>';
                        //this.oSipSessionCall.bHeld = false;

                        if (SIPml.isWebRtc4AllSupported()) { // IE don't provide stream callback yet
                            //uiVideoDisplayEvent(false, true);
                            //uiVideoDisplayEvent(true, true);
                        }
                    }
                    break;
                }
            case 'm_local_resume_nok':
                {
                    if (e.session == this.oSipSessionCall) {
                        //this.oSipSessionCall.bTransfering = false;
                        //btnHoldResume.disabled = false;
                        //txtCallStatus.innerHTML = '<i>Failed to unhold call</i>';
                    }
                    break;
                }
            case 'm_remote_hold':
                {
                    if (e.session == this.oSipSessionCall) {
                        //txtCallStatus.innerHTML = '<i>Placed on hold by remote party</i>';
                    }
                    break;
                }
            case 'm_remote_resume':
                {
                    if (e.session == this.oSipSessionCall) {
                        //txtCallStatus.innerHTML = '<i>Taken off hold by remote party</i>';
                    }
                    break;
                }
            case 'm_bfcp_info':
                {
                    if (e.session == this.oSipSessionCall) {
                        //txtCallStatus.innerHTML = 'BFCP Info: <i>' + e.description + '</i>';
                    }
                    break;
                }

            case 'o_ect_trying':
                {
                    if (e.session == this.oSipSessionCall) {
                        //txtCallStatus.innerHTML = '<i>Call transfer in progress...</i>';
                    }
                    break;
                }
            case 'o_ect_accepted':
                {
                    if (e.session == this.oSipSessionCall) {
                        //txtCallStatus.innerHTML = '<i>Call transfer accepted</i>';
                    }
                    break;
                }
            case 'o_ect_completed':
            case 'i_ect_completed':
                {
                    if (e.session == this.oSipSessionCall) {
                        //txtCallStatus.innerHTML = '<i>Call transfer completed</i>';
                        //btnTransfer.disabled = false;
                        if (this.oSipSessionTransferCall) {
                            this.oSipSessionCall = this.oSipSessionTransferCall;
                        }
                        this.oSipSessionTransferCall = null;
                    }
                    break;
                }
            case 'o_ect_failed':
            case 'i_ect_failed':
                {
                    if (e.session == this.oSipSessionCall) {
                        //txtCallStatus.innerHTML = '<i>Call transfer failed</i>';
                        //btnTransfer.disabled = false;
                    }
                    break;
                }
            case 'o_ect_notify':
            case 'i_ect_notify':
                {
                    if (e.session == this.oSipSessionCall) {
                        //txtCallStatus.innerHTML = "<i>Call Transfer: <b>" + e.getSipResponseCode() + " " + e.description + "</b></i>";
                        if (e.getSipResponseCode() >= 300) {
                            if (this.oSipSessionCall.bHeld) {
                                this.oSipSessionCall.resume();
                            }
                            //btnTransfer.disabled = false;
                        }
                    }
                    break;
                }
            case 'i_ect_requested':
                {
                    if (e.session == this.oSipSessionCall) {
                        var s_message = "Do you accept call transfer to [" + e.getTransferDestinationFriendlyName() + "]?";//FIXME
                        if (confirm(s_message)) {
                            //txtCallStatus.innerHTML = "<i>Call transfer in progress...</i>";
                            this.oSipSessionCall.acceptTransfer();
                            break;
                        }
                        this.oSipSessionCall.rejectTransfer();
                    }
                    break;
                }
        }
    },
    onSipEventStack: function(e) { 

        console.log('==stack event = ' + e.type);
        switch (e.type) {
            case 'started':
                {
                    // catch exception for IE (DOM not ready)
                    try {
                        console.log(this.oSipStack)
                        // LogIn (REGISTER) as soon as the stack finish starting
                        this.oSipSessionRegister = this.oSipStack.newSession('register', {
                            expires: 200,
                            events_listener: { events: '*', listener: onSipEventSession },
                            sip_caps: [
                                { name: '+g.oma.sip-im', value: null },
                                //{ name: '+sip.ice' }, // rfc5768: FIXME doesn't work with Polycom TelePresence
                                { name: '+audio', value: null },
                                { name: 'language', value: '\"en,fr\"' }
                            ]
                        });
                        this.oSipSessionRegister.register();
                    }
                    catch (e) {
                        console.log("1:", e)
                        //txtRegStatus.value = txtRegStatus.innerHTML = "<b>1:" + e + "</b>";
                        //btnRegister.disabled = false;
                    }
                    break;
                }
            case 'stopping': case 'stopped': case 'failed_to_start': case 'failed_to_stop':
                {
                    var bFailure = (e.type == 'failed_to_start') || (e.type == 'failed_to_stop');
                    this.oSipStack = null;
                    this.oSipSessionRegister = null;
                    this.oSipSessionCall = null;

                    //uiOnConnectionEvent(false, false);

                    //stopRingbackTone();
                    //stopRingTone();

                    //uiVideoDisplayShowHide(false);
                    //divCallOptions.style.opacity = 0;

                    //txtCallStatus.innerHTML = '';
                    console.log("<i>Disconnected: <b>" + e.description + "</b></i>" + "<i>Disconnected</i>");
                    //txtRegStatus.innerHTML = bFailure ? "<i>Disconnected: <b>" + e.description + "</b></i>" : "<i>Disconnected</i>";
                    break;
                }

            case 'i_new_call':
                {
                    if (this.oSipSessionCall) {
                        // do not accept the incoming call if we're already 'in call'
                        e.newSession.hangup(); // comment this line for multi-line support
                    }
                    else {
                        this.oSipSessionCall = e.newSession;
                        // start listening for events
                        this.oSipSessionCall.setConfiguration(this.oConfigCall);

                        //uiBtnCallSetText('Answer');
                        //btnHangUp.value = 'Reject';
                        //btnCall.disabled = false;
                        //btnHangUp.disabled = false;

                        //startRingTone();

                        var sRemoteNumber = (this.oSipSessionCall.getRemoteFriendlyName() || 'unknown');
                        //txtCallStatus.innerHTML = "<i>Incoming call from [<b>" + sRemoteNumber + "</b>]</i>";
                        //showNotifICall(sRemoteNumber);
                    }
                    break;
                }

            case 'm_permission_requested':
                {
                    console.log("m_permission_requested")
                    //divGlassPanel.style.visibility = 'visible';
                    break;
                }
            case 'm_permission_accepted':
            case 'm_permission_refused':
                {
                    console.log("m_permission_refused")
                    //divGlassPanel.style.visibility = 'hidden';
                    if (e.type == 'm_permission_refused') {
                        //uiCallTerminated('Media stream permission denied');
                    }
                    break;
                }

            case 'starting': default: break;
        }

    }
}