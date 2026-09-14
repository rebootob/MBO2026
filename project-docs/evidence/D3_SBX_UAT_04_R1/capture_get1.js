(function() {
    var attempt = 1;
    var preUtc = new Date().toISOString();
    console.log('UAT04_R1_GET1_DISPATCHING', { attempt: attempt, preUtc: preUtc, app: 794, id: 15 });
    kintone.api('/k/v1/record.json', 'GET', { app: 794, id: 15 })
        .then(function(r) {
            var postUtc = new Date().toISOString();
            var rev = (r && r.record && r.record.$revision) ? r.record.$revision.value : null;
            var recId = (r && r.record && r.record.$id) ? r.record.$id.value : null;
            var payload = {
                attempt: attempt,
                endpoint: '/k/v1/record.json?app=794&id=15',
                preUtc: preUtc,
                postUtc: postUtc,
                recordId: recId,
                revision: rev,
                response: r
            };
            window.__uat04_r1_get1 = payload;
            var b = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
            var a = document.createElement('a');
            a.href = URL.createObjectURL(b);
            a.download = 'uat04_r1_get1_record.json';
            a.click();
            console.log('UAT04_R1_GET1_SUCCESS', { attempt: attempt, postUtc: postUtc, recordId: recId, revision: rev });
        })
        .catch(function(err) {
            var postUtc = new Date().toISOString();
            var errPayload = {
                attempt: attempt,
                endpoint: '/k/v1/record.json?app=794&id=15',
                preUtc: preUtc,
                postUtc: postUtc,
                error: (err && err.message) ? err.message : JSON.stringify(err)
            };
            window.__uat04_r1_get1_error = errPayload;
            var b = new Blob([JSON.stringify(errPayload, null, 2)], { type: 'application/json' });
            var a = document.createElement('a');
            a.href = URL.createObjectURL(b);
            a.download = 'uat04_r1_get1_error.json';
            a.click();
            console.error('UAT04_R1_GET1_ERROR', err);
        });
})();
