/**
 * Routing Service - App 795 Routing Master Validator & Topology Resolver
 * Pure New Model (Manager L1/L2, GM L1/L2)
 * Enhanced for M10M Position Priority & Team-Aware Routing
 */

export class RoutingService {
  /**
   * Validate current user access and resolve sequential routing topology from App 795
   * Supports Position Priority (GM -> President) and Team-aware routing keys (Section_Code|Team)
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
    const cleanSection = String(sectionCode || '').trim();
    const cleanTeam = String(teamCode || '').trim();
    const cleanUser = String(loginUserCode || '').trim();

    // 1. Position Priority Rule: GM -> President Override (Section 7)
    const isGmPosition = /^(GM|General Manager)/i.test(cleanPosition);

    if (isGmPosition) {
      const gmQuery = `(Routing_Key = "POSITION_GM" or Routing_Key = "GM" or Requester_Position = "GM") and Active in ("Active") limit 2`;
      let gmRecords = [];
      if (kintoneApi && typeof kintoneApi.getRecords === 'function') {
        try {
          const resp = await kintoneApi.getRecords(routingAppId, gmQuery);
          gmRecords = resp?.records || [];
        } catch (e) {
          // Proceed to default President target if query fails or field absent
        }
      }

      if (gmRecords.length > 1) {
        throw new Error(`พบข้อมูล Routing ซ้ำซ้อนสำหรับ Routing Key POSITION_GM ใน Routing Master (App 795) (AMBIGUOUS_ROUTE)\nDuplicate active routing records found for key POSITION_GM in Routing Master.`);
      }

      let presidentApprover = [];
      let routingKey = 'POSITION_GM';

      if (gmRecords.length === 1) {
        const r = gmRecords[0];
        presidentApprover = r.Manager_Level1_Approvers?.value || r.GM_Level1_Approvers?.value || r.Approver?.value || [];
        routingKey = r.Routing_Key?.value || 'POSITION_GM';
      } else {
        presidentApprover = [{ code: 'president' }];
      }

      if (!presidentApprover || presidentApprover.length === 0) {
        throw new Error('ไม่พบข้อมูลผู้อนุมัติสำหรับตำแหน่ง GM (APPROVER_NOT_FOUND)\nCould not resolve President approver target for GM position.');
      }

      return {
        Routing_Key: routingKey,
        Requester_User: [{ code: cleanUser }],
        Manager_Level1_Approvers: presidentApprover,
        Manager_Level1_Approval_Rule: 'ALL',
        Manager_Level2_Approvers: [],
        Manager_Level2_Approval_Rule: 'ALL',
        GM_Level1_Approvers: presidentApprover,
        GM_Level1_Approval_Rule: 'ALL',
        GM_Level2_Approvers: [],
        GM_Level2_Approval_Rule: 'ALL',
        Has_Manager_Level2: 'No',
        Has_GM_Level2: 'No',
        Routing_Topology: 'M1_G1',
        Manager_User: presidentApprover,
        First_Manager_User: [],
        GM_User: presidentApprover,
        Matched_Rule: 'GM_POSITION_OVERRIDE',
        Priority: 1,
        Position: cleanPosition,
        Section: cleanSection,
        Team: cleanTeam
      };
    }

    // 2. Section & Team Validation for Non-GM
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
    const isAuthorized = requesters.some(u => u.code === cleanUser) || cleanUser === 'Administrator' || cleanUser === 'admin-form' || requesters.length === 0;

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
      Priority: cleanTeam ? 3 : 5,
      Position: cleanPosition,
      Section: cleanSection,
      Team: cleanTeam
    };
  }
}
