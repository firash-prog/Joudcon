import ResourceManager, { Field } from '@/components/admin/ResourceManager';
const fields: Field[] = [
  { key: 'key', label: 'Stage key', type: 'text', required: true, hint: 'lowercase, unique, e.g. fabricate' },
  { key: 'name', label: 'Stage name', type: 'langtext', required: true },
  { key: 'description', label: 'Description', type: 'langtext' },
  { key: 'is_visible', label: 'Visible on website', type: 'bool' },
];
export default function ProcessAdmin() { return <ResourceManager table="process_stages" title="Process Stages" fields={fields} orderBy="sort_order" searchable="key" />; }
