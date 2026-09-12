import ResourceManager, { Field } from '@/components/admin/ResourceManager';
const fields: Field[] = [
  { key: 'name', label: 'Service name', type: 'langtext', required: true },
  { key: 'slug', label: 'Slug', type: 'text' },
  { key: 'short', label: 'Short description', type: 'langtext' },
  { key: 'detail', label: 'Detailed description', type: 'langtext' },
  { key: 'capabilities', label: 'Capabilities', type: 'jsonlist' },
  { key: 'process', label: 'Process', type: 'langtext' },
  { key: 'icon', label: 'Icon key', type: 'text' },
  { key: 'image', label: 'Image', type: 'media' },
  { key: 'video_path', label: 'Video path', type: 'text' },
  { key: 'status', label: 'Status', type: 'select', options: ['draft', 'published', 'archived'] },
];
export default function ServicesAdmin() { return <ResourceManager table="services" title="Services" fields={fields} />; }
