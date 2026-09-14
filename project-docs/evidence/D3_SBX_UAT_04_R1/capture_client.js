(function() {
    var capturedUtc = new Date().toISOString();
    console.log('UAT04_R1_CLIENT_CAPTURING', { capturedUtc: capturedUtc, app: 794, id: 15 });
    try {
        var rec = kintone.app.record.get();
        var rev = (rec && rec.record && rec.record.$revision) ? rec.record.$revision.value : null;
        var recId = (rec && rec.record && rec.record.$id) ? rec.record.$id.value : null;
        var payload = {
            source: 'kintone.app.record.get()',
            capturedUtc: capturedUtc,
            recordId: recId,
            revision: rev,
            record: rec
        };
        window.__uat04_r1_client = payload;
        var b = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(b);
        a.download = 'uat04_r1_client_record.json';
        a.click();
        console.log('UAT04_R1_CLIENT_SUCCESS', { capturedUtc: capturedUtc, recordId: recId, revision: rev });
    } catch (err) {
        var errPayload = {
            source: 'kintone.app.record.get()',
            capturedUtc: capturedUtc,
            error: (err && err.message) ? err.message : JSON.stringify(err)
        };
        window.__uat04_r1_client_error = errPayload;
        var b = new Blob([JSON.stringify(errPayload, null, 2)], { type: 'application/json' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(b);
        a.download = 'uat04_r1_client_error.json';
        a.click();
        console.error('UAT04_R1_CLIENT_ERROR', err);
    }
})();
