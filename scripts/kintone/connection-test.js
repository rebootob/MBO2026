const baseUrl = process.env.KINTONE_BASE_URL?.replace(/\/$/, '');
const token = process.env.KINTONE_API_TOKEN;
const username = process.env.KINTONE_USERNAME;
const password = process.env.KINTONE_PASSWORD;

if (!baseUrl || (!token && !(username && password))) {
  console.error('Connection test not run: configure KINTONE_BASE_URL plus KINTONE_API_TOKEN or KINTONE_USERNAME/KINTONE_PASSWORD in .env.');
  process.exitCode = 2;
} else {
  const headers = token
    ? { 'X-Cybozu-API-Token': token }
    : { 'X-Cybozu-Authorization': Buffer.from(`${username}:${password}`).toString('base64') };

  try {
    const response = await fetch(`${baseUrl}/k/v1/app/form/fields.json?app=53`, {
      method: 'GET',
      headers
    });
    if (!response.ok) {
      throw new Error(`Kintone returned HTTP ${response.status}.`);
    }
    console.log('Read-only connection test passed: App 53 form fields are accessible.');
  } catch (error) {
    console.error(`Read-only connection test failed: ${error.message}`);
    process.exitCode = 1;
  }
}
