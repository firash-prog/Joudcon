import ResourceManager, { Field } from '@/components/admin/ResourceManager';
const fields: Field[] = [
  { key: 'name', label: 'Client name', type: 'text', required: true },
  { key: 'logo', label: 'Client logo', type: 'media' },
  { key: 'website', label: 'Website', type: 'text' },
  { key: 'alt', label: 'Alt text', type: 'langtext' },
  { key: 'is_featured', label: 'Featured', type: 'bool' },
  { key: 'is_visible', label: 'Visible on site', type: 'bool' },
];
export default function ClientsAdmin() { return <ResourceManager table="clients" title="Clients" fields={fields} orderBy="sort_order" />; }
