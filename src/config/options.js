export const ACTION_OPTIONS = ['get', 'create', 'delete',]; //'describe',  'logs', 'exec', 'apply'
export const RESOURCE_OPTIONS = ['pod',]; // 'deployment', 'service', 'node', 'event', 'configmap', 'secret'];

export const OUTPUT_OPTIONS = [
  { label: 'YAML', value: '-o yaml' },
  { label: 'JSON', value: '-o json' },
  { label: 'Wide', value: '-o wide' },
  { label: 'Names Only', value: '-o name' },
];

export const FILTER_OPTIONS = [
  { label: 'Show Labels', value: '--show-labels' },
  { label: 'Label app=nginx', value: '-l app=nginx' },
  { label: 'Managed Fields', value: '--show-managed-fields' },
];

export const SCOPE_OPTIONS = [
  { label: 'All Namespaces', value: '--all-namespaces' },
  { label: 'All', value: '--all' },
  { label: 'Dev Context', value: '--context=dev-cluster' },
];

export const BEHAVIOR_OPTIONS = [
  { label: 'Watch', value: '--watch' },
  { label: 'Force', value: '--force' },
  { label: 'Dry Run Client', value: '--dry-run=client' },
  { label: 'Dry Run Server', value: '--dry-run=server' },
];
