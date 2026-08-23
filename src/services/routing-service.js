/**
 * Routing Service - App 795 Routing Master Validator
 */

export class RoutingService {
  /**
   * Validate current user access against Section Routing in App 795
   * @param {number} routingAppId
   * @param {string} sectionCode
   * @param {string} loginUserCode
   * @param {Object} kintoneApi
   * @returns {Object} { Requester_User, First_Manager_User, Manager_User, GM_User }
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

    return {
      Requester_User: route.Requester_User?.value || [],
      First_Manager_User: route.First_Manager_User?.value || [],
      Manager_User: route.Manager_User?.value || [],
      GM_User: route.GM_User?.value || []
    };
  }
}
