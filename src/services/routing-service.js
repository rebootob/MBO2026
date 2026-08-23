/**
 * Routing Service - Section to User verification from App 795 (Routing Master)
 */

export class RoutingService {
  /**
   * Get routing rule for a section and validate requester access
   */
  static async validateRequesterAccess(routingAppId, sectionCode, loginUserCode, kintoneApi) {
    const cleanSection = String(sectionCode || '').trim().toUpperCase();
    if (!cleanSection) {
      throw new Error('ไม่พบข้อมูล Section ของพนักงาน');
    }

    const query = `Section_Code = "${cleanSection}" and Active in ("Active") limit 1`;
    const resp = await kintoneApi.getRecords(routingAppId, query);
    const records = resp?.records || [];

    if (records.length === 0) {
      throw new Error(`ไม่พบการตั้งค่า Routing สำหรับ Section ${cleanSection} ใน Routing Master (App ${routingAppId})`);
    }

    const route = records[0];
    const requesterUsers = route.Requester_User?.value || [];
    const allowedUserCodes = requesterUsers.map(u => u.code.toLowerCase());

    // Check if login user is allowed requester or admin/hr
    const isAllowed = allowedUserCodes.includes(loginUserCode.toLowerCase()) ||
                      ['admin', 'admin-form', 'hr'].includes(loginUserCode.toLowerCase());

    if (!isAllowed) {
      throw new Error('บัญชีที่ใช้อยู่ไม่มีสิทธิ์จัดทำ MBO สำหรับพนักงาน Section นี้ กรุณาตรวจสอบรหัสพนักงาน');
    }

    return {
      Requester_User: route.Requester_User?.value || [],
      First_Manager_User: route.First_Manager_User?.value || [],
      Manager_User: route.Manager_User?.value || [],
      GM_User: route.GM_User?.value || []
    };
  }
}
