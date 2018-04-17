/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.receivedEvent('deviceready');

        // Read NDEF formatted NFC Tags
        nfc.addNdefListener (
            function (nfcEvent) {
                var tag = nfcEvent.tag,
                    ndefMessage = tag.ndefMessage;

                // Decode payloads for Text and URI records    
                var decodePayload = function() {

                    var record = ndefMessage[0];
                    var payloadAsText;

                    if (util.isType(record, ndef.TNF_WELL_KNOWN, ndef.RTD_TEXT)) {
                        payloadAsText = ndef.textHelper.decodePayload(record.payload);
                    } else if (util.isType(record, ndef.TNF_WELL_KNOWN, ndef.RTD_URI)) {
                        payloadAsText = ndef.uriHelper.decodePayload(record.payload);
                    } else {
                        console.log('No decoder for TNF ' + ndef.tnfToString(record.tnf));
                    }

                    if (payloadAsText) {
                        navigator.notification.alert('', {}, payloadAsText);    
                    }
                }

                // dump the raw json of the message
                // note: real code will need to decode the payload from each record
                navigator.notification.alert(
                    JSON.stringify(ndefMessage), 
                    decodePayload, // decodePayload function is called when OK is clicked
                    'Raw Tag Data');

            },
            function () { // success callback
                console.log("Waiting for NDEF tag");
                app.addButton();
            },
            function (error) { // error callback
                navigator.notification.alert("Error adding NDEF listener " + JSON.stringify(error));
            }
        );
        
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },

    addButton: function() {
        if (cordova.platformId === 'ios') {
            var div = document.querySelector('#buttonDiv');
            var button = document.createElement('button');
            button.innerText = 'Begin NFC Session';
            button.onclick = function() {
                nfc.beginSession(
                    success => console.log('Started session'),
                    error => navigator.notification.alert('Failed to start session ' + error)
               );
            }
            div.appendChild(button);
        }
    }
};

app.initialize();