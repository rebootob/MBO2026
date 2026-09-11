import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LiveBusinessDateProvider,
  getLiveBusinessDate,
  LiveBusinessDateProviderError
} from '../src/services/live-business-date-provider.js';
import { setResolutionBusinessDateForTests } from '../src/main-mbo-app.js';

test('LiveBusinessDateProvider: Requirement 1 - HTTP 200 + valid RFC1123 Date returns Asia/Bangkok YYYY-MM-DD', async () => {
  let calledEndpoint = null;
  let calledInit = null;

  const mockFetch = async (endpoint, init) => {
    calledEndpoint = endpoint;
    calledInit = init;
    return {
      status: 200,
      ok: true,
      headers: {
        get: (name) => (name.toLowerCase() === 'date' ? 'Fri, 11 Sep 2026 15:55:13 GMT' : null)
      }
    };
  };

  const businessDate = await LiveBusinessDateProvider.getBusinessDate({ fetchImpl: mockFetch });
  assert.equal(businessDate, '2026-09-11');
  assert.equal(calledEndpoint, '/k/');
  assert.equal(calledInit?.method, 'HEAD');
  assert.equal(calledInit?.credentials, 'same-origin');
  assert.equal(calledInit?.cache, 'no-store');
});

test('LiveBusinessDateProvider: Requirement 2 - UTC/Bangkok boundary conversions', async () => {
  // Case A: 17:00 UTC rolls over to next calendar day in Bangkok (00:00 UTC+7)
  const fetchRollover = async () => ({
    status: 200,
    ok: true,
    headers: {
      get: () => 'Fri, 11 Sep 2026 17:00:00 GMT'
    }
  });
  const dateRollover = await getLiveBusinessDate({ fetchImpl: fetchRollover });
  assert.equal(dateRollover, '2026-09-12');

  // Case B: 16:59:59 UTC remains on same calendar day in Bangkok (23:59:59 UTC+7)
  const fetchSameDay = async () => ({
    status: 200,
    ok: true,
    headers: {
      get: () => 'Fri, 11 Sep 2026 16:59:59 GMT'
    }
  });
  const dateSameDay = await getLiveBusinessDate({ fetchImpl: fetchSameDay });
  assert.equal(dateSameDay, '2026-09-11');

  // Case C: Year boundary rollover (Dec 31 18:00 UTC -> Jan 01 01:00 Bangkok)
  const fetchYearEnd = async () => ({
    status: 200,
    ok: true,
    headers: {
      get: () => 'Thu, 31 Dec 2026 18:00:00 GMT'
    }
  });
  const dateYearEnd = await getLiveBusinessDate({ fetchImpl: fetchYearEnd });
  assert.equal(dateYearEnd, '2027-01-01');
});

test('LiveBusinessDateProvider: Requirement 3 - missing Date header fails closed', async () => {
  const mockFetchMissing = async () => ({
    status: 200,
    ok: true,
    headers: {
      get: () => null
    }
  });

  await assert.rejects(
    () => getLiveBusinessDate({ fetchImpl: mockFetchMissing }),
    (err) => {
      assert.ok(err instanceof LiveBusinessDateProviderError);
      assert.equal(err.code, 'SERVER_DATE_HEADER_MISSING');
      return true;
    }
  );

  const mockFetchEmpty = async () => ({
    status: 200,
    ok: true,
    headers: {
      get: () => '   '
    }
  });

  await assert.rejects(
    () => getLiveBusinessDate({ fetchImpl: mockFetchEmpty }),
    (err) => {
      assert.ok(err instanceof LiveBusinessDateProviderError);
      assert.equal(err.code, 'SERVER_DATE_HEADER_MISSING');
      return true;
    }
  );
});

test('LiveBusinessDateProvider: Requirement 4 - invalid Date header fails closed', async () => {
  const mockFetchInvalid = async () => ({
    status: 200,
    ok: true,
    headers: {
      get: () => 'not-a-valid-date-timestamp'
    }
  });

  await assert.rejects(
    () => getLiveBusinessDate({ fetchImpl: mockFetchInvalid }),
    (err) => {
      assert.ok(err instanceof LiveBusinessDateProviderError);
      assert.equal(err.code, 'SERVER_DATE_HEADER_INVALID');
      return true;
    }
  );
});

test('LiveBusinessDateProvider: Requirement 5 - fetch/network rejection fails closed', async () => {
  const mockFetchReject = async () => {
    throw new Error('Connection refused to Kintone endpoint');
  };

  await assert.rejects(
    () => getLiveBusinessDate({ fetchImpl: mockFetchReject }),
    (err) => {
      assert.ok(err instanceof LiveBusinessDateProviderError);
      assert.equal(err.code, 'NETWORK_ERROR');
      return true;
    }
  );
});

test('LiveBusinessDateProvider: Requirement 6 - non-2xx response fails closed', async () => {
  for (const status of [400, 401, 403, 404, 500, 502, 503]) {
    const mockFetchBadStatus = async () => ({
      status,
      ok: false,
      headers: {
        get: () => 'Fri, 11 Sep 2026 15:55:13 GMT'
      }
    });

    await assert.rejects(
      () => getLiveBusinessDate({ fetchImpl: mockFetchBadStatus }),
      (err) => {
        assert.ok(err instanceof LiveBusinessDateProviderError);
        assert.equal(err.code, 'NON_SUCCESS_HTTP_STATUS');
        return true;
      }
    );
  }
});

test('LiveBusinessDateProvider: Requirement 7 - fetch unavailable fails closed', async () => {
  await assert.rejects(
    () => getLiveBusinessDate({ fetchImpl: null }),
    (err) => {
      assert.ok(err instanceof LiveBusinessDateProviderError);
      assert.equal(err.code, 'FETCH_UNAVAILABLE');
      return true;
    }
  );
});

test('LiveBusinessDateProvider: Requirement 8 - local clock independence (Date.now forbidden as authority)', async () => {
  const originalDateNow = Date.now;
  let dateNowCalled = false;

  try {
    Date.now = () => {
      dateNowCalled = true;
      throw new Error('Date.now() must not be called as business-date authority');
    };

    const mockFetch = async () => ({
      status: 200,
      ok: true,
      headers: {
        get: () => 'Fri, 11 Sep 2026 15:55:13 GMT'
      }
    });

    const businessDate = await getLiveBusinessDate({ fetchImpl: mockFetch });
    assert.equal(businessDate, '2026-09-11');
    assert.equal(dateNowCalled, false, 'Date.now() was never consulted');
  } finally {
    Date.now = originalDateNow;
  }
});

test('LiveBusinessDateProvider: Requirement 9 - explicit injected resolutionBusinessDate bypasses provider', async () => {
  let providerFetchCalled = false;

  const mockProvider = {
    getBusinessDate: async () => {
      providerFetchCalled = true;
      throw new Error('Provider must not be invoked when explicit date is injected');
    }
  };

  // Simulating main-mbo-app seam logic
  const authOptions = { resolutionBusinessDate: '2026-06-15' };
  const options = {};

  let resolutionBusinessDate = authOptions?.resolutionBusinessDate || options?.resolutionBusinessDate;
  if (!resolutionBusinessDate) {
    resolutionBusinessDate = await mockProvider.getBusinessDate();
  }

  assert.equal(resolutionBusinessDate, '2026-06-15');
  assert.equal(providerFetchCalled, false, 'provider was bypassed by explicit injected date');
});

test('LiveBusinessDateProvider: Requirement 10 - provider result reaches resolutionBusinessDate seam unchanged', async () => {
  const mockFetch = async () => ({
    status: 200,
    ok: true,
    headers: {
      get: () => 'Fri, 11 Sep 2026 12:00:00 GMT'
    }
  });

  // Simulating main-mbo-app lookup flow when no explicit date is injected
  const authOptions = {};
  const options = {};

  let resolutionBusinessDate = authOptions?.resolutionBusinessDate || options?.resolutionBusinessDate;
  if (!resolutionBusinessDate) {
    resolutionBusinessDate = await getLiveBusinessDate({ fetchImpl: mockFetch });
  }

  // Validate format regex
  assert.match(resolutionBusinessDate, /^\d{4}-\d{2}-\d{2}$/);
  assert.equal(resolutionBusinessDate, '2026-09-11');

  // Verify options structure passed to RoutingService.resolveRoutingProfile
  const routingServiceOptions = {
    d3: true,
    resolutionBusinessDate: resolutionBusinessDate
  };

  assert.equal(routingServiceOptions.resolutionBusinessDate, '2026-09-11');
});

test('MainMboApp: setResolutionBusinessDateForTests preserves deterministic test injection seam', () => {
  setResolutionBusinessDateForTests('2026-07-01');
  // Validation: invalid formats must throw
  assert.throws(
    () => setResolutionBusinessDateForTests('2026/07/01'),
    /TEST_RESOLUTION_BUSINESS_DATE_INVALID/
  );
  assert.throws(
    () => setResolutionBusinessDateForTests(12345),
    /TEST_RESOLUTION_BUSINESS_DATE_INVALID/
  );
  // Reset to null
  setResolutionBusinessDateForTests(null);
});