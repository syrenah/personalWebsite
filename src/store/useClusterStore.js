import { create } from 'zustand';

const initialResources = [
  {
    kind: 'Pod',
    name: 'nginx-demo',
    namespace: 'default',
    status: 'Running',
  },
  {
    kind: 'Namespace',
    name: 'production',
    namespace: 'production',
    status: 'Active',
  },
];

export const useClusterStore = create((set, get) => ({
  resources: initialResources,
  createResource: (resource) => {
    const normalized = {
      ...resource,
      namespace: resource.namespace || 'default',
      status: resource.status || 'Created',
    };

    set((state) => ({
      resources: [...state.resources, normalized],
    }));
  },
  deleteResource: (resourceName, namespace = 'default') => {
    set((state) => ({
      resources: state.resources.filter(
        (resource) => !(resource.name === resourceName && resource.namespace === namespace)
      ),
    }));
  },
  getResourcesByKind: (kind, namespace) => {
    const resources = get().resources;
    return resources.filter((resource) => {
      const matchesKind = resource.kind.toLowerCase() === kind.toLowerCase();
      const matchesNamespace = !namespace || resource.namespace === namespace;
      return matchesKind && matchesNamespace;
    });
  },
  clearResources: () => set({ resources: [] }),
}));
