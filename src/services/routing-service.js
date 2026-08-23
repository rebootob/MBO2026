/**
 * Routing Service - App 795 Routing Master Validator & Topology Resolver
 */

export class RoutingService {
  /**
   * Validate current user access and resolve sequential routing topology from App 795
   * @param {number} routingAppId
   * @param {string} sectionCode
   * @param {string} loginUserCode
   * @param {Object} kintoneApi
   * @returns {Object} Full Sequential Routing Profile
   */
  static async validateRequesterAccess(routingAppId, sectionCode, loginUserCode, kintoneApi) {
    const cleanSection = String(sectionCode || '').trim();
    if (!cleanSection) {
      throw new Error('ไม่พบข้อมูล Section ของพนักงาน กรุณาตรวจสอบ Employee Master (App 53)\nEmployee section is missing in Employee Master.');
    }

    const query = `Section_Code = "${cleanSection}" and Active in ("Active") limit 2`;
    const resp = await kintoneApi.getRecords(routingAppId, query);
    const records = resp?.records || [];

    if (records.length === 0) {
      throw new Error(`ไม่พบการตั้งค่า Routing สำหรับ Section ${cleanSection} ใน Routing Master (App 795) กรุณาติดต่อ HR / Administrator\nRouting configuration for section ${cleanSection} was not found in Routing Master.`);
    }

    const route = records[0];
    const requesters = route.Requester_User?.value || [];
    const isAuthorized = requesters.some(u => u.code === loginUserCode) || loginUserCode === 'Administrator' || loginUserCode === 'admin-form';

    if (!isAuthorized) {
      throw new Error(`บัญชีนี้ (${loginUserCode}) ไม่มีสิทธิ์สร้าง MBO สำหรับพนักงานใน Section ${cleanSection}\nThis account (${loginUserCode}) is not authorized to create an MBO for section ${cleanSection}.`);
    }

    // Resolve Manager Levels (support new sequential model with fallback to legacy)
    const mgrL1 = route.Manager_Level1_Approvers?.value?.length > 0
      ? route.Manager_Level1_Approvers.value
      : (route.Manager_User?.value || []);
    const mgrL1Rule = route.Manager_Level1_Approval_Rule?.value || 'ANY';

    const mgrL2 = route.Manager_Level2_Approvers?.value || [];
    const mgrL2Rule = route.Manager_Level2_Approval_Rule?.value || 'ANY';

    // Resolve GM Levels
    const gmL1 = route.GM_Level1_Approvers?.value?.length > 0
      ? route.GM_Level1_Approvers.value
      : (route.GM_User?.value || []);
    const gmL1Rule = route.GM_Level1_Approval_Rule?.value || 'ANY';

    const gmL2 = route.GM_Level2_Approvers?.value || [];
    const gmL2Rule = route.GM_Level2_Approval_Rule?.value || 'ANY';

    const hasMgrL2 = mgrL2.length > 0;
    const hasGmL2 = gmL2.length > 0;

    // Topology: e.g. M1_G1, M1_M2_G1, M1_G1_G2, M1_M2_G1_G2
    let topology = 'M1_G1';
    if (hasMgrL2 && hasGmL2) {
      topology = 'M1_M2_G1_G2';
    } else if (hasMgrL2) {
      topology = 'M1_M2_G1';
    } else if (hasGmL2) {
      topology = 'M1_G1_G2';
    }

    return {
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
      // Legacy backwards compatibility
      Manager_User: mgrL1,
      First_Manager_User: mgrL2,
      GM_User: gmL1
    };
  }
}
