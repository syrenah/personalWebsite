import { Button, Stack } from '@mui/material';
import { buildKubectlCommand, buildMockOutput } from '../../utils/kubectlLogic';
import { useClusterStore } from '../../store/useClusterStore';
import { BRAND_BLUE, BRAND_BLUE_DARK,TERMINAL_GREEN,DARKER_GREEN} from '../../config/contants';
function ActionButtons({
  action,
  resource,
  name,
  namespace,
  selectedOptions,
  onCommandGenerated,
  onCopy,
}) {
  const { createResource, deleteResource, getResourcesByKind } = useClusterStore();

  const handleGenerate = () => {
    const command = buildKubectlCommand({
      action,
      resource,
      name,
      namespace,
      selectedOptions,
    });

    const mock = buildMockOutput({
      action,
      resource,
      namespace,
      selectedOptions,
      createResource,
      deleteResource,
      getResourcesByKind,
    });

    onCommandGenerated(`$ ${command}`, mock);
  };

  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} >
      <Button variant="contained"
      sx={{ backgroundColor: BRAND_BLUE, color: 'white', '&:hover': { backgroundColor: BRAND_BLUE_DARK } }}
      onClick={handleGenerate}>
        Generate Command
      </Button>
      <Button
        variant="contained"
        sx={{ backgroundColor: TERMINAL_GREEN, color: 'white', '&:hover': { backgroundColor: DARKER_GREEN } }}
        onClick={onCopy}
      >
        Copy Command
      </Button>
    </Stack>
  );
}

export default ActionButtons;
