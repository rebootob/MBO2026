/**
 * Routing Service - App 795 Routing Master Validator & Topology Resolver
 * Pure New Model (Manager L1/L2, GM L1/L2, Executive Direct M1_ONLY)
 * Enhanced for M10M-R2 Executive Direct Routing (DGM / GM / VP -> President)
 */

export class RoutingService {
  /**
   * Normalize position string to canonical routing position class
   * @param {string} positionCode
   * @returns {string} Normalized Position Class
   */
  static normalizePosition(positionCode) {
    const clean = String(positionCode || '').trim();
    if (/^(Deputy\s*General\s*Manager|DGM)$/i.test(clean)) {
      return 'DEPUTY_GENERAL_MANAGER';
    }
    if (/^(General\s*Manager|GM)$/i.test(clean)) {
      return 'GENERAL_MANAGER';
    }
    if (/^(Vice\s*President|VP)$/i.test(clean)) {
      return 'VICE_PRESIDENT';
    }
    return clean;
  }

  /**
   * Pure Read-Only Route Resolution from App 795 (Zero Requester Authorization Check)
   * Supports Position Priority (DGM/GM/VP -> President) and Team-aware routing keys (Section_Code|Team)
   * @param {number} routingAppId
   * @param {string} sectionCode
   * @param {string} teamCode
   * @param {Object} kintoneApi
   * @param {string} positionCode
   * @returns {Object} Resolved Routing Profile with Requester_User list
   */
  static async resolveRoutingProfile(routingAppId, sectionCode, teamCode, kintoneApi, positionCode = '') {
    const cleanPosition = String(positionCode || '').trim();
    const normalizedPos = RoutingService.normalizePosition(cleanPosition);
    const cleanSection = String(sectionCode || '').trim();
    const cleanTeam = String(teamCode || '').trim();

    // 1. Executive Direct Position Priority Rule: DGM / GM / VP -> President Route in App795 (M1_ONLY)
    const isExecutiveDirect = ['DEPUTY_GENERAL_MANAGER', 'GENERAL_MANAGER', 'VICE_PRESIDENT'].includes(normalizedPos);

    if (isExecutiveDirect) {
      let routingKey = 'POSITION_GM';
      if (normalizedPos === 'DEPUTY_GENERAL_MANAGER') routingKey = 'POSITION_DGM';
      if (normalizedPos === 'VICE_PRESIDENT') routingKey = 'POSITION_VP';

      const execQuery = `Routing_Key = "${routingKey}" and Active in ("Active") limit 2`;
      const resp = await kintoneApi.getRecords(routingAppId, execQuery);
      const execRecords = resp?.records || [];

      if (execRecords.length === 0) {
        throw new Error(`ไม่พบข้อมูลการตั้งค่า Routing สำหรับตำแหน่ง ${normalizedPos} (${routingKey}) ใน Routing Master (App 795) (APPROVER_NOT_FOUND)\nRouting configuration for executive position ${normalizedPos} (${routingKey}) was not found in Routing Master.`);
      }

      if (execRecords.length > 1) {
        throw new Error(`พบข้อมูล Routing ซ้ำซ้อนสำหรับ Routing Key ${routingKey} ใน Routing Master (App 795) (AMBIGUOUS_ROUTE)\nDuplicate active routing records found for key ${routingKey} in Routing Master.`);
      }

      const route = execRecords[0];
      const presidentApprover = route.Manager_Level1_Approvers?.value || route.GM_Level1_Approvers?.value || [];

      if (!presidentApprover || presidentApprover.length === 0) {
        throw new Error(`ไม่พบข้อมูลผู้อนุมัติสำหรับตำแหน่ง ${normalizedPos} ใน Routing Master (App 795) (APPROVER_NOT_FOUND)\nNo valid approver target configured for executive position ${normalizedPos} in Routing Master.`);
      }

      const requesters = route.Requester_User?.value || [];

      return {
        Routing_Key: route.Routing_Key?.value || routingKey,
        Requester_User: requesters,
        Manager_Level1_Approvers: presidentApprover,
        Manager_Level1_Approval_Rule: route.Manager_Level1_Approval_Rule?.value || 'ALL',
        Manager_Level2_Approvers: [],
        Manager_Level2_Approval_Rule: 'ALL',
        GM_Level1_Approvers: [],
        GM_Level1_Approval_Rule: 'ALL',
        GM_Level2_Approvers: [],
        GM_Level2_Approval_Rule: 'ALL',
        Has_Manager_Level2: 'No',
        Has_GM_Level2: 'No',
        Routing_Topology: 'M1_ONLY',
        Manager_User: presidentApprover,
        First_Manager_User: [],
        GM_User: [],
        Matched_Rule: routingKey,
        Position: cleanPosition,
        Section: cleanSection,
        Team: cleanTeam
      };
    }

    // 2. Section & Team Validation for Non-Executive
    if (!cleanSection) {
      throw new Error('ไม่พบข้อมูล Section ของพนักงาน กรุณาตรวจสอบ Employee Master (App 53)\nEmployee section is missing in Employee Master.');
    }

    const isTmgSection = cleanSection === 'TMG1' || cleanSection === 'TMG2' || /^TMG/i.test(cleanSection);

    if (isTmgSection && !cleanTeam) {
      throw new Error(`ไม่พบข้อมูล Team ของพนักงานใน Section ${cleanSection} กรุณาตรวจสอบ Employee Master (App 53) (TEAM_REQUIRED)\nTeam is required for employee in section ${cleanSection}.`);
    }

    const primaryRoutingKey = cleanTeam ? `${cleanSection}|${cleanTeam}` : cleanSection;

    // 3. App795 Query by Routing_Key
    const query = `Routing_Key = "${primaryRoutingKey}" and Active in ("Active") limit 2`;
    const resp = await kintoneApi.getRecords(routingAppId, query);
    const records = resp?.records || [];

    // Fail-Closed: Routing Not Found
    if (records.length === 0) {
      const targetLabel = cleanTeam ? `${cleanSection} / Team ${cleanTeam}` : cleanSection;
      throw new Error(`ไม่พบการตั้งค่า Routing สำหรับ Section ${targetLabel} ใน Routing Master (App 795) กรุณาติดต่อ HR / Administrator (ROUTE_NOT_FOUND)\nRouting configuration for section ${targetLabel} was not found in Routing Master.`);
    }

    // Fail-Closed: Duplicate Active Routing Key
    if (records.length > 1) {
      throw new Error(`พบข้อมูล Routing ซ้ำซ้อนสำหรับ Routing Key ${primaryRoutingKey} ใน Routing Master (App 795) กรุณาติดต่อ HR / Administrator (AMBIGUOUS_ROUTE)\nDuplicate active routing records found for key ${primaryRoutingKey} in Routing Master.`);
    }

    const route = records[0];
    const requesters = route.Requester_User?.value || [];

    // Pure New Model as Source of Truth
    const mgrL1 = route.Manager_Level1_Approvers?.value || [];
    const mgrL1Rule = route.Manager_Level1_Approval_Rule?.value || 'ALL';

    const mgrL2 = route.Manager_Level2_Approvers?.value || [];
    const mgrL2Rule = route.Manager_Level2_Approval_Rule?.value || 'ALL';

    const gmL1 = route.GM_Level1_Approvers?.value || [];
    const gmL1Rule = route.GM_Level1_Approval_Rule?.value || 'ALL';

    const gmL2 = route.GM_Level2_Approvers?.value || [];
    const gmL2Rule = route.GM_Level2_Approval_Rule?.value || 'ALL';

    const hasMgrL2 = mgrL2.length > 0;
    const hasGmL2 = gmL2.length > 0;

    let topology = 'M1_G1';
    if (hasMgrL2 && hasGmL2) {
      topology = 'M1_M2_G1_G2';
    } else if (hasMgrL2) {
      topology = 'M1_M2_G1';
    } else if (hasGmL2) {
      topology = 'M1_G1_G2';
    }

    return {
      Routing_Key: route.Routing_Key?.value || primaryRoutingKey,
      Requester_User: requesters,
      Manager_Level1_Approvers: mgrL1,
      Manager_Level1_Approval_Rule: mgrL1Rule,
      Manager_Level2_Approvers: mgrL2,
      Manager_Level2_Approval_Rule: mgrL2Rule,
      GM_Level1_Approvers: gmL1,
      GM_Level1_Approval_Rule: gmL1Rule,
      GM_Level2_Approvers: gmL2,
      GM_Level2_Approval_Rule: gmL2Rule,
      Has_Manager_Level2: hasMgrL2 ? 'Yes' : 'No',
      Has_GM_Level2: hasGmL2 ? 'Yes' : 'No',
      Routing_Topology: topology,
      Manager_User: mgrL1,
      First_Manager_User: mgrL2,
      GM_User: gmL1,
      Matched_Rule: route.Routing_Key?.value || primaryRoutingKey,
      Position: cleanPosition,
      Section: cleanSection,
      Team: cleanTeam
    };
  }

  /**
   * Asserts Business Requester Authorization against the resolved route's Requester_User list.
   * `admin-form` and `Administrator` have 0 business requester authority unless listed in Requester_User.
   * @param {Object} route Resolved route profile
   * @param {string} loginUserCode Current login user code
   */
  static assertRequesterAuthorized(route, loginUserCode) {
    const cleanUser = String(loginUserCode || '').trim();
    if (!cleanUser) {
      throw new Error('ไม่พบข้อมูลผู้ใช้งานที่เข้าสู่ระบบ\nLogged-in user code is missing.');
    }

    const requesters = route?.Requester_User || [];
    const norm = (code) => String(code || '').trim().toLowerCase();
    const isAuthorized = Array.isArray(requesters) && requesters.some(u => {
      const uCode = typeof u === 'object' ? (u.code || u.value) : u;
      return norm(uCode) === norm(cleanUser);
    });

    if (!isAuthorized) {
      const cleanSection = route?.Section || '';
      const cleanPosition = route?.Position || '';
      const sectionInfo = cleanSection ? ` สำหรับพนักงานใน Section ${cleanSection}` : (cleanPosition ? ` สำหรับตำแหน่ง ${cleanPosition}` : '');
      throw new Error(`บัญชีนี้ (${cleanUser}) ไม่มีสิทธิ์สร้าง MBO${sectionInfo}\nThis account (${cleanUser}) is not authorized to create an MBO for this target.`);
    }
  }

  /**
   * Resolves effective requester user array based on access mode.
   * DEDICATED mode: returns [{ code: kintoneUserCode }].
   * SHARED mode: requires kintoneUserCode to match route's Requester_User list.
   * Accepts ONLY exact 'DEDICATED' or 'SHARED' mode; any unknown/malformed mode fails closed.
   * @param {Object} params
   * @param {string} params.mode - Exact 'DEDICATED' | 'SHARED'
   * @param {string} params.kintoneUserCode - Current Kintone user code
   * @param {Array<Object|string>} params.routeRequesterUsers - Requester_User from App 795 route
   * @returns {Array<Object>} Effective requester user array
   */
  static resolveEffectiveRequesterUser({ mode, kintoneUserCode, routeRequesterUsers = [] }) {
    if (mode !== 'DEDICATED' && mode !== 'SHARED') {
      throw new Error(`INVALID_REQUESTER_MODE: Requester mode must be exact 'DEDICATED' or 'SHARED' (received '${mode}').`);
    }

    if (!kintoneUserCode || typeof kintoneUserCode !== 'string' || kintoneUserCode === '') {
      throw new Error('ไม่พบข้อมูลผู้ใช้งานที่เข้าสู่ระบบ\nLogged-in user code is missing.');
    }

    if (kintoneUserCode === 'admin-form' || kintoneUserCode === 'Administrator' || kintoneUserCode === 'ADMIN') {
      throw new Error(`บัญชีบริหารระบบ (${kintoneUserCode}) ไม่มีสิทธิ์สร้าง MBO ในฐานะพนักงาน\nTechnical admin identity (${kintoneUserCode}) cannot create MBO records.`);
    }

    if (mode === 'DEDICATED') {
      // DEDICATED mode requires exact nonblank native Kintone User Code without whitespace normalization
      if (kintoneUserCode !== kintoneUserCode.trim()) {
        throw new Error('KINTONE_USER_CODE_HAS_WHITESPACE: Dedicated Kintone user code cannot contain whitespace.');
      }
      return [{ code: kintoneUserCode }];
    }

    // SHARED mode validation: case-insensitive comparison for shared principal compatibility
    const cleanUser = kintoneUserCode.trim();
    const norm = (c) => String(c || '').trim().toLowerCase();
    const isAuthorized = Array.isArray(routeRequesterUsers) && routeRequesterUsers.some(u => {
      const uCode = typeof u === 'object' ? (u.code || u.value) : u;
      return norm(uCode) === norm(cleanUser);
    });

    if (!isAuthorized) {
      throw new Error(`บัญชีนี้ (${cleanUser}) ไม่มีสิทธิ์สร้าง MBO ในโหมด SHARED\nThis account (${cleanUser}) is not authorized to create an MBO for this target.`);
    }

    return routeRequesterUsers;
  }

  /**
   * Applies own-MBO self-appraiser elision transformation by preserving approver slots.
   * For own MBO only: removes self appraiser from each slot, keeps surviving slots,
   * shifts surviving slots left into canonical topology positions carrying each slot's approval rule,
   * and recalculates effective technical topology (e.g. M1_G1 -> M1_ONLY for Natta).
   * Pure transformation: returns a new route object without mutating the input object.
   * @param {Object} routeProfile - App 795 route profile
   * @param {string} currentDedicatedUserCode - Current dedicated Kintone user code
   * @param {boolean} isOwnMbo - Flag indicating whether this is the employee's own MBO
   * @returns {Object} Effective route profile
   */
  static applyOwnMboSelfAppraiserElision(routeProfile, currentDedicatedUserCode, isOwnMbo = false) {
    if (!routeProfile || typeof routeProfile !== 'object') {
      throw new Error('Invalid route profile provided for self-appraiser elision.');
    }

    // 1. If not own MBO, return route profile clone unchanged
    if (!isOwnMbo) {
      return { ...routeProfile };
    }

    // Require exact nonblank dedicated user code for own MBO
    if (!currentDedicatedUserCode || typeof currentDedicatedUserCode !== 'string' || currentDedicatedUserCode === '') {
      throw new Error('MISSING_DEDICATED_USER_CODE: Dedicated Kintone user code is required for own-MBO self-appraiser elision.');
    }

    if (currentDedicatedUserCode !== currentDedicatedUserCode.trim()) {
      throw new Error('KINTONE_USER_CODE_HAS_WHITESPACE: Dedicated Kintone user code cannot contain whitespace.');
    }

    const cleanUser = currentDedicatedUserCode;

    // Helper to extract approver objects from raw slot
    const parseSlotApprovers = (arr) => {
      if (!Array.isArray(arr)) return [];
      return arr.map(u => {
        if (!u) return null;
        if (typeof u === 'object') return { ...u, code: String(u.code || u.value || '').trim() };
        return { code: String(u).trim() };
      }).filter(u => u && u.code);
    };

    // Extract 4 canonical ordered slots with their approval rules
    const slots = [
      {
        id: 'M1',
        approvers: parseSlotApprovers(routeProfile.Manager_Level1_Approvers || routeProfile.Manager_User),
        rule: routeProfile.Manager_Level1_Approval_Rule || 'ALL'
      },
      {
        id: 'M2',
        approvers: parseSlotApprovers(routeProfile.Manager_Level2_Approvers || routeProfile.First_Manager_User),
        rule: routeProfile.Manager_Level2_Approval_Rule || 'ALL'
      },
      {
        id: 'G1',
        approvers: parseSlotApprovers(routeProfile.GM_Level1_Approvers || routeProfile.GM_User),
        rule: routeProfile.GM_Level1_Approval_Rule || 'ALL'
      },
      {
        id: 'G2',
        approvers: parseSlotApprovers(routeProfile.GM_Level2_Approvers),
        rule: routeProfile.GM_Level2_Approval_Rule || 'ALL'
      }
    ];

    // Case-sensitive exact user code matching
    let selfRemoved = false;
    const survivingSlots = [];

    for (const slot of slots) {
      const filtered = slot.approvers.filter(u => {
        if (u.code === cleanUser) {
          selfRemoved = true;
          return false;
        }
        return true;
      });

      if (filtered.length > 0) {
        survivingSlots.push({
          approvers: filtered,
          rule: slot.rule
        });
      }
    }

    if (!selfRemoved) {
      return { ...routeProfile, selfAppraiserElided: false };
    }

    if (survivingSlots.length === 0) {
      throw new Error(`ไม่พบผู้อนุมัติอื่นนอกเหนือจากตนเองสำหรับ MBO ตนเอง (NO_REMAINING_NON_SELF_APPROVER)\nRouting configuration produces no valid non-self appraiser for own MBO (${cleanUser}).`);
    }

    // Reassign surviving slots into canonical topology positions
    let effMgrL1 = [];
    let effMgrL1Rule = 'ALL';
    let effMgrL2 = [];
    let effMgrL2Rule = 'ALL';
    let effGmL1 = [];
    let effGmL1Rule = 'ALL';
    let effGmL2 = [];
    let effGmL2Rule = 'ALL';
    let effTopology = 'M1_ONLY';

    if (survivingSlots.length === 1) {
      effMgrL1 = survivingSlots[0].approvers;
      effMgrL1Rule = survivingSlots[0].rule;
      effTopology = 'M1_ONLY';
    } else if (survivingSlots.length === 2) {
      effMgrL1 = survivingSlots[0].approvers;
      effMgrL1Rule = survivingSlots[0].rule;
      effGmL1 = survivingSlots[1].approvers;
      effGmL1Rule = survivingSlots[1].rule;
      effTopology = 'M1_G1';
    } else if (survivingSlots.length === 3) {
      effMgrL1 = survivingSlots[0].approvers;
      effMgrL1Rule = survivingSlots[0].rule;
      effMgrL2 = survivingSlots[1].approvers;
      effMgrL2Rule = survivingSlots[1].rule;
      effGmL1 = survivingSlots[2].approvers;
      effGmL1Rule = survivingSlots[2].rule;
      effTopology = 'M1_M2_G1';
    } else if (survivingSlots.length >= 4) {
      effMgrL1 = survivingSlots[0].approvers;
      effMgrL1Rule = survivingSlots[0].rule;
      effMgrL2 = survivingSlots[1].approvers;
      effMgrL2Rule = survivingSlots[1].rule;
      effGmL1 = survivingSlots[2].approvers;
      effGmL1Rule = survivingSlots[2].rule;
      effGmL2 = survivingSlots[3].approvers;
      effGmL2Rule = survivingSlots[3].rule;
      effTopology = 'M1_M2_G1_G2';
    }

    return {
      ...routeProfile,
      Manager_Level1_Approvers: effMgrL1,
      Manager_User: effMgrL1,
      Manager_Level1_Approval_Rule: effMgrL1Rule,
      Manager_Level2_Approvers: effMgrL2,
      First_Manager_User: effMgrL2,
      Manager_Level2_Approval_Rule: effMgrL2Rule,
      GM_Level1_Approvers: effGmL1,
      GM_User: effGmL1,
      GM_Level1_Approval_Rule: effGmL1Rule,
      GM_Level2_Approvers: effGmL2,
      GM_Level2_Approval_Rule: effGmL2Rule,
      Has_Manager_Level2: effMgrL2.length > 0 ? 'Yes' : 'No',
      Has_GM_Level2: effGmL2.length > 0 ? 'Yes' : 'No',
      Routing_Topology: effTopology,
      selfAppraiserElided: true
    };
  }

  /**
   * Validate current user access and resolve sequential routing topology from App 795
   * Composes `resolveRoutingProfile` + `assertRequesterAuthorized`.
   * @param {number} routingAppId
   * @param {string} sectionCode
   * @param {string} teamCode
   * @param {string} loginUserCode
   * @param {Object} kintoneApi
   * @param {string} positionCode
   * @returns {Object} Full Sequential Routing Profile
   */
  static async validateRequesterAccess(routingAppId, sectionCode, teamCode, loginUserCode, kintoneApi, positionCode = '') {
    const route = await RoutingService.resolveRoutingProfile(routingAppId, sectionCode, teamCode, kintoneApi, positionCode);
    RoutingService.assertRequesterAuthorized(route, loginUserCode);
    return route;
  }
}
