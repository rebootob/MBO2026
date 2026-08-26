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
   * Validate current user access and resolve sequential routing topology from App 795
   * Supports Position Priority (DGM/GM/VP -> President) and Team-aware routing keys (Section_Code|Team)
   * @param {number} routingAppId
   * @param {string} sectionCode
   * @param {string} teamCode
   * @param {string} loginUserCode
   * @param {Object} kintoneApi
   * @param {string} positionCode
   * @returns {Object} Full Sequential Routing Profile
   */
  static async validateRequesterAccess(routingAppId, sectionCode, teamCode, loginUserCode, kintoneApi, positionCode = '') {
    const cleanPosition = String(positionCode || '').trim();
    const normalizedPos = RoutingService.normalizePosition(cleanPosition);
    const cleanSection = String(sectionCode || '').trim();
    const cleanTeam = String(teamCode || '').trim();
    const cleanUser = String(loginUserCode || '').trim();

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

      // Check requester authorization against App795 Requester_User list
      const requesters = route.Requester_User?.value || [];
      const isAuthorized = requesters.some(u => u.code === cleanUser) || cleanUser === 'Administrator' || cleanUser === 'admin-form';

      if (!isAuthorized) {
        throw new Error(`บัญชีนี้ (${cleanUser}) ไม่มีสิทธิ์สร้าง MBO สำหรับตำแหน่ง ${cleanPosition}\nThis account (${cleanUser}) is not authorized to create an MBO for executive position ${cleanPosition}.`);
      }

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
    // Strict Requester Authorization (BLOCKER B Fix: NO blank Requester_User allow-all fallback)
    const isAuthorized = requesters.some(u => u.code === cleanUser) || cleanUser === 'Administrator' || cleanUser === 'admin-form';

    if (!isAuthorized) {
      throw new Error(`บัญชีนี้ (${cleanUser}) ไม่มีสิทธิ์สร้าง MBO สำหรับพนักงานใน Section ${cleanSection}\nThis account (${cleanUser}) is not authorized to create an MBO for section ${cleanSection}.`);
    }

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
}
