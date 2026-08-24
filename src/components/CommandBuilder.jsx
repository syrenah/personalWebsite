import { useMemo, useState } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import ActionButtons from './builder/ActionButtons';
import CommandLog from './builder/CommandLog';
import GeneratorControls from './builder/GeneratorControls';
import OptionGroup from './builder/OptionGroup';
import { getFieldSelectors } from '../utils/kubectlLogic';

function CommandBuilder() {
  const [action, setAction] = useState('get');
  const [resource, setResource] = useState('pod');
  const [name, setName] = useState('');
  const [namespace, setNamespace] = useState('');
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [commandOutput, setCommandOutput] = useState('$ kubectl command will appear here');
  const [mockOutput, setMockOutput] = useState('# mock cluster output will appear here');

  const fieldSelectorOptions = useMemo(() => {
    return getFieldSelectors(resource).map((item) => ({
      label: item,
      value: `--field-selector=${item}`,
    }));
  }, [resource]);

  const handleOptionToggle = (value) => {
    setSelectedOptions((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value]
    );
  };

  const handleCommandGenerated = (command, mock) => {
    setCommandOutput(command);
    setMockOutput(mock);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(commandOutput.replace('$ ', ''));
      alert('Command copied');
    } catch (error) {
      console.error('Unable to copy command', error);
    }
  };

  return (
    <Box component="main" className="app-shell">
      <Paper component="section" className="container" elevation={3}>
       

        <GeneratorControls
          action={action}
          resource={resource}
          name={name}
          namespace={namespace}
          onActionChange={(event) => setAction(event.target.value)}
          onResourceChange={(event) => setResource(event.target.value)}
          onNameChange={(event) => setName(event.target.value)}
          onNamespaceChange={(event) => setNamespace(event.target.value)}
        />

        <OptionGroup
          selectedOptions={selectedOptions}
          onToggle={handleOptionToggle}
          fieldSelectorOptions={fieldSelectorOptions}
        />

        <ActionButtons
          action={action}
          resource={resource}
          name={name}
          namespace={namespace}
          selectedOptions={selectedOptions}
          onCommandGenerated={handleCommandGenerated}
          onCopy={handleCopy}
        />

        <CommandLog title="Command Preview" content={commandOutput} />
        <CommandLog title="Mock Cluster Output" content={mockOutput} className="mock-output" />
      </Paper>
    </Box>
  );
}

export default CommandBuilder;
