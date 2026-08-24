function formatAge(createdAt) {
  if (!createdAt) return '1m';

  const diffMs = Date.now() - new Date(createdAt).getTime();
  const minutes = Math.floor(diffMs / 60000);

  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  return `${days}d`;
}

const fieldSelectors = {
  pod: ['status.phase=Running', 'status.phase=Pending', 'status.phase=Failed', 'spec.nodeName=', 'metadata.name='],
  deployment: ['metadata.name=', 'metadata.namespace='],
  service: ['metadata.name=', 'metadata.namespace='],
  node: ['metadata.name=', 'spec.unschedulable=true'],
  event: ['type=Warning', 'type=Normal', 'reason=Failed'],
};

export function buildKubectlCommand({ action, resource, name, namespace, selectedOptions }) {
  let cmd = 'kubectl';

  if (action === 'apply') {
    cmd += ` apply -f ${name || '<file.yaml>'}`;
  } else if (action === 'logs') {
    cmd += ` logs ${name || '<pod>'}`;
  } else if (action === 'exec') {
    cmd += ` exec -it ${name || '<pod>'} -- /bin/sh`;
  } else if (action === 'create') {
    const createName = name || '<name>';
    cmd += ` create ${resource} ${createName}`;
  } else {
    cmd += ` ${action} ${resource}`;
    if (name) cmd += ` ${name}`;
  }

  if (namespace && !selectedOptions.includes('--all-namespaces')) {
    cmd += ` -n ${namespace}`;
  }

  if (selectedOptions.length) {
    cmd += ` ${selectedOptions.join(' ')}`;
  }

  return cmd;
}

export function buildMockOutput({
  action,
  resource,
  namespace,
  selectedOptions,
  createResource,
  deleteResource,
  getResourcesByKind,
}) {
  if (action === 'create') {
    const resourceName = resource === 'namespace' ? 'new-namespace' : 'example-resource';
    const createdResource = {
      kind: resource.charAt(0).toUpperCase() + resource.slice(1),
      name: resourceName,
      namespace: namespace || 'default',
      status: 'Created',
    };
    createResource(createdResource);

    return `created ${createdResource.kind}/${createdResource.name} in namespace ${createdResource.namespace}`;
  }

  if (action === 'delete') {
    deleteResource(name || 'example-resource', namespace || 'default');
    return `deleted ${resource}/${name || 'example-resource'}`;
  }

  if (action === 'get' && resource === 'pod') {
                    if (selectedOptions.includes('-o yaml')) {
                    return `apiVersion: v1\nkind: Pod\nmetadata:\n  name: nginx-demo\n  namespace: ${namespace || 'default'}\nstatus:\n  phase: Running\ncontainers:\n- name: nginx\n  image: nginx:latest`;
                    }

                    if (selectedOptions.includes('-o json')) {
                    return `{
                "kind":"Pod",
                "metadata":{
                "name":"nginx-demo",
                "namespace":"${namespace || 'default'}"
                },
                "status":{
                "phase":"Running"
                }
                }`;
                }

                const resources = getResourcesByKind('pod', namespace);
                if (resources.length) {
                const lines = ['NAME                 READY   STATUS     RESTARTS   AGE'];
                resources.forEach((item) => {
                    lines.push(`${item.name}           1/1     ${item.status}    0          ${formatAge(item.createdAt)}`);
                });
                return lines.join('\n');
                }

                return `NAME                 READY   STATUS     RESTARTS   AGE
                  nginx-demo           1/1     Running    0          3d`;
  }

  if (action === 'get' && resource === 'deployment') {
    const resources = getResourcesByKind('deployment', namespace);
    if (resources.length) {
      const lines = ['NAME          READY   UP-TO-DATE   AVAILABLE   AGE'];
      resources.forEach((item) => {
        lines.push(`${item.name}      1/1     1            1           ${formatAge(item.createdAt)}`);
      });
      return lines.join('\n');
    }

    return `NAME          READY   UP-TO-DATE   AVAILABLE   AGE
frontend      3/3     3            3           14d`;
  }

  if (action === 'get' && resource === 'service') {
    const resources = getResourcesByKind('service', namespace);
    if (resources.length) {
      const lines = ['NAME        TYPE        CLUSTER-IP     PORT'];
      resources.forEach((item) => {
        lines.push(`${item.name}    ClusterIP   10.0.0.10     80/TCP`);
      });
      return lines.join('\n');
    }

    return `NAME        TYPE        CLUSTER-IP     PORT
frontend    ClusterIP   10.0.20.15     80/TCP`;
  }

  if (action === 'get' && resource === 'node') {
    const resources = getResourcesByKind('node', namespace);
    if (resources.length) {
      const lines = ['NAME          STATUS   ROLES'];
      resources.forEach((item) => {
        lines.push(`${item.name}     Ready    worker`);
      });
      return lines.join('\n');
    }

    return `NAME          STATUS   ROLES
worker-01     Ready    worker`;
  }

  if (action === 'get' && resource === 'namespace') {
    const resources = getResourcesByKind('namespace', namespace);
    if (resources.length) {
      const lines = ['NAME              STATUS'];
      resources.forEach((item) => {
        lines.push(`${item.name}        Active`);
      });
      return lines.join('\n');
    }

    return `NAME              STATUS
kube-system        Active`;
  }

  if (action === 'describe') {
    return `Name: nginx-demo
Namespace: ${namespace || 'default'}

Status: Running

Containers:
 nginx:
   Image: nginx:latest
   Ready: True

Events:
 Normal Started
 Normal Pulled`;
  }

  if (action === 'create') {
    return `apiVersion: v1
kind: ${resource === 'pod' ? 'Pod' : resource.charAt(0).toUpperCase() + resource.slice(1)}
metadata:
  name: ${name || 'example'}
  namespace: ${namespace || 'default'}`;
  }

  if (action === 'logs') {
    return `2026-08-03T12:01:02 INFO Starting application
2026-08-03T12:01:05 INFO Connected database
2026-08-03T12:01:10 INFO Server listening`;
  }

  if (action === 'exec') {
    return `root@nginx-demo:/#
# simulated shell
#`;
  }

  return `Error from server:
resource simulation not available`;
}

export function getFieldSelectors(resource) {
  return fieldSelectors[resource] || [];
}
