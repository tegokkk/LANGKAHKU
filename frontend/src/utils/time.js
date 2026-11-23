let schoolTimezone='Asia/Jakarta';
export function setSchoolTimezone(zone){schoolTimezone=zone||'Asia/Jakarta';}
export const formatDate=(value,withTime=false,zone=schoolTimezone)=>value?new Intl.DateTimeFormat('id-ID',{dateStyle:'medium',...(withTime?{timeStyle:'short'}:{}),timeZone:zone}).format(new Date(value)):'Belum ditentukan';
