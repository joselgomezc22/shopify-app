import {Button, Modal, Stack, DropZone, Checkbox, Select} from '@shopify/polaris';
import {useState, useCallback, useEffect} from 'react';
import { SortAscendingMajor } from '@shopify/polaris-icons';
import { useDispatch, useSelector } from 'react-redux';
import { setFilter, setOrder } from '../../redux/slices/filterSlice';
export const SortByTool = ({productsQuantity}) => {
  //global state
  const filterstate = useSelector(state => state.filter)
  const dispatch = useDispatch()
  const [active, setActive] = useState(false);
  const [checked, setChecked] = useState(false);

  const [filterSelected, setFilterSelected] = useState(filterstate.filter)

  const toggleActive = useCallback(() => setActive((active) => !active), []);

  const handleCheckbox = useCallback((value) => setChecked(value), []);

  useEffect(_ => {
    setFilterSelected(filterstate.filter)
  },[filterstate])

  const activator = <Button icon={SortAscendingMajor} onClick={toggleActive}>Bulk Actions</Button>

  return (
    <Modal
      small
      activator={activator}
      open={active}
      onClose={toggleActive}
      title="Bulk Actions"
      primaryAction={
        [{
          content: "Apply",
          onAction: _ => {
            dispatch(setFilter(filterSelected))
            toggleActive()
          }
        }]
      }
      secondaryActions={
        [{
          content: "Cancel",
          onAction: toggleActive
        }]
      }
    >
      <Modal.Section>
        <Stack vertical>

          <Select
            label="Sort by:"
            options={[
              {label: "Select filter", value: ""},
              {label: "Title A-Z", value: "taz"},
              {label: "Title Z-A", value: "tza"},
              {label: "Vendor A-Z", value: "vaz"},
              {label: "Vendor Z-A", value: "vza"},
              {label: "Newest Created", value: "nc"},
              {label: "Oldest Created", value: "oc"},
              {label: "Newest Published", value: "np"},
              {label: "Oldest Published", value: "op"},
              {label: "Highest Price", value: "hp"},
              {label: "Lowest Price", value: "lp"},
              {label: "Highest Inventory", value: "hi"},
              {label: "Lowest Inventory", value: "li"},
            ]}
            onChange={setFilterSelected}
            value={filterSelected}
          />
          
        </Stack>
      </Modal.Section>
    </Modal>
  )
}
