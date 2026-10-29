export function catalogueFailureCode(error:unknown):string {
 const e=error as {code?:unknown;message?:unknown}|null;
 if(e?.message==='DATABASE_URL is required')return 'DATABASE_NOT_CONFIGURED';
 if(typeof e?.message==='string'&&/TLS|sslmode/.test(e.message))return 'DATABASE_TLS_CONFIGURATION';
 if(e?.message==='PostgreSQL 17 is required')return 'DATABASE_VERSION_UNSUPPORTED';
 const codes:Record<string,string>={'28P01':'DATABASE_AUTHENTICATION','3D000':'DATABASE_NOT_FOUND','42P01':'DATABASE_SCHEMA_MISSING','42501':'DATABASE_PERMISSION',ECONNREFUSED:'DATABASE_UNREACHABLE',ENOTFOUND:'DATABASE_UNREACHABLE',ETIMEDOUT:'DATABASE_TIMEOUT'};
 return typeof e?.code==='string'&&codes[e.code]?codes[e.code]:'DATABASE_READ_FAILED';
}
