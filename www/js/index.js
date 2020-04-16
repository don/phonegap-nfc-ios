var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    onDeviceReady: function() {
        this.receivedDeviceReadyEvent('deviceready');
        app.addButtons();
    },

    showNfcTag: function(tag) {

        pre.innerText = 'NFC Tag'
        if (tag.id) {
            pre.innerText += '\n';
            pre.innerText += '  id: ' + nfc.bytesToHexString(tag.id);
        }
        if (tag.type) {
            pre.innerText += '\n';
            pre.innerText += '  type: ' + tag.type;
        }
        if (tag.isWritable) {
            pre.innerText += '\n';
            // TODO convert isWritable to boolean elsewhere
            pre.innerText += '  isWritable: ' + !!tag.isWritable;
        }
        pre.innerText += '\n';

        if (tag.ndefMessage) {
            tag.ndefMessage.forEach((record, i) => {

                pre.innerText += `\nNDEF Record ${i + 1}\n`;
    
                if (util.isType(record, ndef.TNF_WELL_KNOWN, ndef.RTD_TEXT)) {
                    pre.innerText += '  Text Record\n';
                    pre.innerText += '    ' + ndef.textHelper.decodePayload(record.payload);
                } else if (util.isType(record, ndef.TNF_WELL_KNOWN, ndef.RTD_URI)) {
                    pre.innerText += '  URI Record\n';
                    pre.innerText += '    ' + ndef.uriHelper.decodePayload(record.payload);
                } else {
                    console.log('No decoder for TNF ' + ndef.tnfToString(record.tnf));
                    pre.innerText += `  TNF ${record.tnf} Record`
                    pre.innerText += '    ' + JSON.stringify(record);
                }
                pre.innerText += '\n';
            });    
        }

    },

    clearOutput: function() {
        pre.innerText = '';
    },

    showData: function(data) {
        pre.innerText = data + '\n';
    },

    showError: function(error) {
        let message = error;
        if (error instanceof Error) {
            message = error.message;
        }
        navigator.notification.alert(message);
    },

    writeNdef: function() {

        app.clearOutput();
        
        // NDEF message with 2 records
        var message = [
            ndef.textRecord("Hello phonegap-nfc!"),
            ndef.uriRecord("https://chariotsolutions.com")
        ];

        nfc.write(
            message,
            success => app.showData('Message was written to the tag.'),
            error => app.showError(error)
       );

    },

    startNDEFScan: async function() {

        app.clearOutput();

        // scanNdef replaces beingSession
        // scanned tag data is returned in the promise
        try {
            let tag = await nfc.scanNdef();
            console.log(JSON.stringify(tag));
            app.showNfcTag(tag);
        } catch (err) {
            app.showError(err);
        }

    },

    // using the Tag scanner gets the Tag UID but doens't read as many tags
    startTagScan: async function() {

        app.clearOutput();

        // On iOS 13, we can use the new scanner to include that tag ids
        try {
            let tag = await nfc.scanTag();
            app.showNfcTag(tag);
        } catch (err) {
            app.showError(err);
        }
    },

    addButtons: function() {
        var div = document.querySelector('#buttonDiv');

        if (cordova.platformId === 'ios') {
            var button = document.createElement('button');
            button.innerText = 'Start NDEF Scan';
            button.onclick = app.startNDEFScan;
            div.appendChild(button);

            button = document.createElement('button');
            button.innerText = 'Start Tag Scan';
            button.onclick = app.startTagScan;
            div.appendChild(button);

            button = document.createElement('button');
            button.innerText = 'Write to NFC Tag';
            button.onclick = app.writeNdef;
            div.appendChild(button);
        } else {
            var p = document.createElement('p');
            p.innerText = 'This demo is intended for Cordova iOS';
            div.appendChild(p);
        }
    },

    // Update DOM on a Received Event
    receivedDeviceReadyEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    }
    
};

app.initialize();