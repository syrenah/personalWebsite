import { memo } from 'react';
import { Stack } from '@mui/material';
import FormControlField from '../reusableComponents/FormControlField';
import { ACTION_OPTIONS, RESOURCE_OPTIONS } from '../../config/options';

function GeneratorControls({
  action,
  resource,
  name,
  namespace,
  onActionChange,
  onResourceChange,
  onNameChange,
  onNamespaceChange,
}) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} >
      <FormControlField
        label="Action"
        value={action}
        onChange={onActionChange}
        options={ACTION_OPTIONS.map((option) => ({ label: option, value: option }))}
        selectId="action"
      />

      <FormControlField
        label="Resource"
        value={resource}
        onChange={onResourceChange}
        options={RESOURCE_OPTIONS.map((option) => ({ label: option, value: option }))}
        selectId="resource"
      />

      <FormControlField
        type="text"
        label="Name"
        value={name}
        onChange={onNameChange}
        placeholder="nginx"
      />

      <FormControlField
        type="text"
        label="Namespace"
        value={namespace}
        onChange={onNamespaceChange}
        placeholder="production"
      />
    </Stack>
  );
}

export default memo(GeneratorControls);
