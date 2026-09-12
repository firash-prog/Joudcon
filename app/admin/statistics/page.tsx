import ResourceManager, { Field } from '@/components/admin/ResourceManager';
const fields: Field[] = [
  { key: 'label', label: 'Label', type: 'langtext', required: true },
  { key: 'value', label: 'Number', type: 'number', required: true },
  { key: 'suffix', label: 'Suffix (+, %)', type: 'text' },
  { key: 'is_visible', label: 'Show on website', type: 'bool' },
];
export default function StatsAdmin() { return <ResourceManager table="statistics" title="Statistics" fields={fields} />; }
