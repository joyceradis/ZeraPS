export const CLINICAL_KEY = 'zera-ps-clinical-v1';
export function loadClinicalState(storage) {
  const serialized = storage.getItem(CLINICAL_KEY) ?? storage.getItem('zera-v2');
  if (serialized === null) return {patients: []};
  const parsed = JSON.parse(serialized);
  if (!parsed || !Array.isArray(parsed.patients)) throw new Error('Dados clínicos inválidos');
  // Read legacy patients without changing the original mixed backup.
  return {patients: parsed.patients};
}
