import ResourceManager, { Field } from '@/components/admin/ResourceManager';
const fields: Field[] = [
  { key: 'quote', label: 'Quote', type: 'langtext', required: true },
  { key: 'person', label: 'Person', type: 'text', required: true },
  { key: 'position', label: 'Position', type: 'langtext' },
  { key: 'company', label: 'Company', type: 'text' },
  { key: 'photo', label: 'Photo', type: 'media' },
  { key: 'status', label: 'Status', type: 'select', options: ['draft', 'published', 'archived'] },
];
export default function TestimonialsAdmin() { return <ResourceManager table="testimonials" title="Testimonials" fields={fields} orderBy="created_at" searchable="person" />; }
