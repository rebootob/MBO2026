import test from 'node:test';
import assert from 'node:assert/strict';
import {
  LiveBusinessDateProvider,
  getLiveBusinessDate,
  LiveBusinessDateProviderError,
  AUTHORITATIVE_ENDPOINT,
  setLiveBusinessDateFetchForTests
} from '../src/services/live-business-date-provider.js';
import {
  setResolutionBusinessDateForTests,
  setLiveBusinessDateProviderForTests,
  resolveD3RoutingProfileWithDateSeam
} from '../src/main-mbo-app.js';
import { RoutingService } from '../src/services/routing-service.js';

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

test('LiveBusinessDateProvider: Requirement 9 (Corrective 1) - Authoritative endpoint is locked to /k/ (override forbidden)', async () => {
  // Disallow caller from redirecting authority to other endpoints
  for (const badOption of [
    { endpoint: '/custom/endpoint' },
    { url: 'https://evil.com/k/' },
    { origin: 'https://evil.com' },
    { host: 'evil.com' }
  ]) {
    await assert.rejects(
      () => getLiveBusinessDate(badOption),
      (err) => {
        assert.ok(err instanceof LiveBusinessDateProviderError);
        assert.equal(err.code, 'ENDPOINT_OVERRIDE_FORBIDDEN');
        return true;
      }
    );
  }
});

test('LiveBusinessDateProvider: Requirement 10 (Corrective 1) - Request strictly targets /k/ with same-origin and no-store', async () => {
  let queriedPath = null;
  let queriedInit = null;

  const mockFetch = async (target, init) => {
    queriedPath = target;
    queriedInit = init;
    return {
      status: 200,
      ok: true,
      headers: { get: () => 'Fri, 11 Sep 2026 12:00:00 GMT' }
    };
  };

  assert.equal(AUTHORITATIVE_ENDPOINT, '/k/');
  assert.equal(LiveBusinessDateProvider.AUTHORITATIVE_ENDPOINT, '/k/');

  const date = await LiveBusinessDateProvider.getBusinessDate({ fetchImpl: mockFetch });
  assert.equal(date, '2026-09-11');
  assert.equal(queriedPath, '/k/', 'Requested path must strictly be /k/');
  assert.equal(queriedInit.method, 'HEAD');
  assert.equal(queriedInit.credentials, 'same-origin');
  assert.equal(queriedInit.cache, 'no-store');
});

test('Real Production Seam: Requirement 11 (Corrective 2, Path A) - Explicit date bypasses provider and reaches RoutingService', async () => {
  let providerFetchCalled = false;
  let receivedRoutingOptions = null;

  // Set test fetch implementation that throws if called
  setLiveBusinessDateFetchForTests(async () => {
    providerFetchCalled = true;
    throw new Error('Provider must NOT be invoked when explicit date is provided');
  });

  const originalResolve = RoutingService.resolveRoutingProfile;
  RoutingService.resolveRoutingProfile = async (appId, sec, team, api, pos, options) => {
    receivedRoutingOptions = options;
    return { mockSuccess: true, effectiveDate: options.resolutionBusinessDate };
  };

  try {
    const authOptions = { resolutionBusinessDate: '2026-06-15' };
    const options = {};

    // Execute actual production code from src/main-mbo-app.js
    const result = await resolveD3RoutingProfileWithDateSeam(
      795, 'SEC', 'TEAM', {}, 'Staff',
      { d3: true, kExpected: 2 },
      authOptions,
      options
    );

    assert.equal(result.mockSuccess, true);
    assert.equal(providerFetchCalled, false, 'Provider was NOT invoked');
    assert.equal(receivedRoutingOptions?.resolutionBusinessDate, '2026-06-15', 'Exact explicit date reached RoutingService input');
  } finally {
    RoutingService.resolveRoutingProfile = originalResolve;
    setLiveBusinessDateFetchForTests(null);
  }
});

test('Real Production Seam: Requirement 12 (Corrective 2, Path B) - Provider acquires server date and reaches RoutingService unchanged', async () => {
  let providerFetchCalled = false;
  let receivedRoutingOptions = null;

  setLiveBusinessDateFetchForTests(async (endpoint, init) => {
    providerFetchCalled = true;
    assert.equal(endpoint, '/k/');
    assert.equal(init.method, 'HEAD');
    return {
      status: 200,
      ok: true,
      headers: { get: () => 'Fri, 11 Sep 2026 15:55:13 GMT' }
    };
  });

  const originalResolve = RoutingService.resolveRoutingProfile;
  RoutingService.resolveRoutingProfile = async (appId, sec, team, api, pos, options) => {
    receivedRoutingOptions = options;
    return { mockSuccess: true, effectiveDate: options.resolutionBusinessDate };
  };

  try {
    const authOptions = {};
    const options = {};

    // Execute actual production code from src/main-mbo-app.js with NO explicit date
    const result = await resolveD3RoutingProfileWithDateSeam(
      795, 'SEC', 'TEAM', {}, 'Staff',
      { d3: true, kExpected: 2 },
      authOptions,
      options
    );

    assert.equal(result.mockSuccess, true);
    assert.equal(providerFetchCalled, true, 'Provider path was invoked');
    assert.equal(receivedRoutingOptions?.resolutionBusinessDate, '2026-09-11', 'Exact server-derived Asia/Bangkok date reached RoutingService unchanged');
  } finally {
    RoutingService.resolveRoutingProfile = originalResolve;
    setLiveBusinessDateFetchForTests(null);
  }
});

test('Real Production Seam: Requirement 13 (Corrective 2, Path B) - End-to-end routing version resolution succeeds with provider date', async () => {
  // Test complete integration through RoutingService.resolveD3RoutingProfile
  const v = {
    Routing_Key: { value: 'TMT1' },
    Version_Key: { value: 'TMT1#v1' },
    Version_Number: { value: '1' },
    Version_Status: { value: 'ACTIVE' },
    Effective_From: { value: '2026-04-01' },
    Effective_To: { value: '2026-12-31' },
    Route_Pattern: { value: 'PATTERN_2_M1_G1' },
    Routing_Topology: { value: 'M1_G1' },
    Manager_Level1_Approvers: { value: [{ code: 'mgr_1', name: 'Manager 1' }] },
    GM_Level1_Approvers: { value: [{ code: 'gm_1', name: 'GM 1' }] },
    Manager_Level2_Approvers: { value: [] },
    GM_Level2_Approvers: { value: [] },
    Manager_Level1_Approval_Rule: { value: 'ALL' },
    GM_Level1_Approval_Rule: { value: 'ALL' },
    Has_Manager_Level2: { value: 'NO' },
    Has_GM_Level2: { value: 'NO' },
    Scorer_Priority_Slots: { value: '[1, 2]' },
    Requester_User: { value: [{ code: 'emp_1' }] }
  };

  // 1. Valid date in window (2026-09-11)
  setLiveBusinessDateFetchForTests(async () => ({
    status: 200,
    ok: true,
    headers: { get: () => 'Fri, 11 Sep 2026 15:55:13 GMT' }
  }));

  try {
    const routeProfile = await resolveD3RoutingProfileWithDateSeam(
      795, 'TMT1', '', {}, 'Staff',
      {
        d3: true,
        candidateRecords: [v],
        frozenProfileCode: 'PROF_STAFF_CHIEF',
        kExpected: 2
      },
      {},
      {}
    );

    assert.equal(routeProfile.Effective_Route_Version_Key, 'TMT1#v1');
    assert.equal(routeProfile.Active_Scorers.length, 2);
  } finally {
    setLiveBusinessDateFetchForTests(null);
  }

  // 2. Date before window (2026-03-15) fails closed with NO_EFFECTIVE_ROUTE
  setLiveBusinessDateFetchForTests(async () => ({
    status: 200,
    ok: true,
    headers: { get: () => 'Sun, 15 Mar 2026 12:00:00 GMT' }
  }));

  try {
    await assert.rejects(
      () => resolveD3RoutingProfileWithDateSeam(
        795, 'TMT1', '', {}, 'Staff',
        {
          d3: true,
          candidateRecords: [v],
          frozenProfileCode: 'PROF_STAFF_CHIEF',
          kExpected: 2
        },
        {},
        {}
      ),
      /NO_EFFECTIVE_ROUTE/
    );
  } finally {
    setLiveBusinessDateFetchForTests(null);
  }
});

test('Real Production Seam: Requirement 14 (Corrective 2, Path C) - Provider failure fails closed with zero silent continuation', async () => {
  let routeCalled = false;

  setLiveBusinessDateFetchForTests(async () => {
    throw new Error('Connection refused to Kintone endpoint');
  });

  const originalResolve = RoutingService.resolveRoutingProfile;
  RoutingService.resolveRoutingProfile = async () => {
    routeCalled = true;
    return { mockSuccess: true };
  };

  try {
    await assert.rejects(
      () => resolveD3RoutingProfileWithDateSeam(
        795, 'SEC', 'TEAM', {}, 'Staff',
        { d3: true, kExpected: 2 },
        {},
        {}
      ),
      (err) => {
        assert.ok(err instanceof LiveBusinessDateProviderError);
        assert.equal(err.code, 'NETWORK_ERROR');
        return true;
      }
    );

    assert.equal(routeCalled, false, 'RoutingService MUST NOT be called on provider failure; routing does not silently continue');
  } finally {
    RoutingService.resolveRoutingProfile = originalResolve;
    setLiveBusinessDateFetchForTests(null);
  }
});

test('MainMboApp: Requirement 15 - setResolutionBusinessDateForTests preserves deterministic test injection seam', () => {
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