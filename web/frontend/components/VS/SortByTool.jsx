import {Button, Modal, Stack, DropZone, Checkbox} from '@shopify/polaris';
import {useState, useCallback} from 'react';
import { SortAscendingMajor } from '@shopify/polaris-icons';
export const SortByTool = () => {
    const [active, setActive] = useState(true);
  const [checked, setChecked] = useState(false);

  const toggleActive = useCallback(() => setActive((active) => !active), []);

  const handleCheckbox = useCallback((value) => setChecked(value), []);

  const activator = <Button icon={SortAscendingMajor} onClick={toggleActive}>Bulk Actions</Button>;
  return (
    <div style={{height: '500px'}}>
    <Modal
      small
      activator={activator}
      open={active}
      onClose={toggleActive}
      title="Bulk Actions"
     
    >
      <Modal.Section>
        <Stack vertical>
          
          
        </Stack>
      </Modal.Section>
    </Modal>
  </div>
  )
}
